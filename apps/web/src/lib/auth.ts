import { prismaAdapter } from "@better-auth/prisma-adapter";
import { betterAuth } from "better-auth";
import { APIError } from "better-auth/api";
import { admin, magicLink } from "better-auth/plugins";
import db from "./prisma";
import { resend } from "./resend";
import { getRuntimeConfig } from "./runtime-config";

export const auth = betterAuth({
	database: prismaAdapter(db, {
		provider: "postgresql",
	}),
	user: {
		additionalFields: {
			role: {
				type: "string",
				input: false,
				defaultValue: "USER",
			},
			firstName: {
				type: "string",
				input: true,
				required: false,
			},
			lastName: {
				type: "string",
				input: true,
				required: false,
			},
		},
	},
	databaseHooks: {
		user: {
			create: {
				before: async (user) => {
					// Check if user is pre-registered
					const preRegistered = await db.preRegisteredUser.findUnique({
						where: { email: user.email },
					});

					if (!preRegistered) {
						throw new APIError("BAD_REQUEST", {
							message: "SIGNUP_DISABLED",
						});
					}

					return {
						data: {
							...user,
							role: preRegistered.role,
							firstName: user.firstName || preRegistered.firstName || undefined,
							lastName: user.lastName || preRegistered.lastName || undefined,
						},
					};
				},
				after: async (user) => {
					// Remove user from pre-registered list once they have joined
					await db.preRegisteredUser
						.delete({
							where: { email: user.email },
						})
						.catch((err) => {
							// Log error but don't fail the whole auth flow if deletion fails
							console.error(
								`[Auth] Failed to remove ${user.email} from PreRegisteredUser:`,
								err,
							);
						});
				},
			},
		},
	},
	plugins: [
		admin(),
		magicLink({
			sendMagicLink: async ({ email, token: _token, url }, _ctx) => {
				// 1. Check if user is authorized (either already registered or pre-registered)
				const [existingUser, preRegistered] = await Promise.all([
					db.user.findUnique({ where: { email } }),
					db.preRegisteredUser.findUnique({ where: { email } }),
				]);

				if (!existingUser && !preRegistered) {
					// Throwing an APIError here will be caught by the client
					// and prevent the email from being sent.
					throw new APIError("BAD_REQUEST", {
						message: "SIGNUP_DISABLED",
					});
				}

				const { error } = await resend.emails.send({
					from:
						process.env.RESEND_FROM_ADDRESS || "Test Mail <test@resend.dev>",
					to: [email],
					subject: "Sign in to My Digital Scoop",
					html: `<p>Click the link below to sign in to your account:</p><p><a href="${url}">Sign in</a></p>`,
				});

				if (error) {
					console.error("Failed to send magic link email", error);
					throw new Error("Failed to send magic link email");
				}
			},
			// Must be false to allow pre-registered users to create their account on first login.
			// Security is still enforced by databaseHooks.user.create.before and the check above.
			disableSignUp: false,
		}),
	],
	// Base URL for better-auth
	baseURL: getRuntimeConfig("BETTER_AUTH_URL") || "http://localhost:3000",
});
