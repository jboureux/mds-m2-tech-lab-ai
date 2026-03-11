import { prismaAdapter } from "@better-auth/prisma-adapter";
import { betterAuth } from "better-auth";
import { APIError } from "better-auth/api";
import { admin, magicLink } from "better-auth/plugins";
import db from "./prisma";
import { resend } from "./resend";
import { getRuntimeConfig } from "./runtime-config";
import { slugify } from "./utils";

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
			username: {
				type: "string",
			},
			bio: {
				type: "string",
			},
			banned: {
				type: "boolean",
				input: false,
				defaultValue: false,
			},
			banReason: {
				type: "string",
				input: false,
			},
			banExpires: {
				type: "date",
				input: false,
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

					// Generate unique username
					const baseName =
						user.name || preRegistered.name || user.email.split("@")[0];
					const baseUsername = slugify(baseName) || "user";
					let username = baseUsername;
					let counter = 1;
					let exists = true;

					while (exists) {
						const existingUser = await db.user.findUnique({
							where: { username },
						});
						if (existingUser) {
							username = `${baseUsername}${counter}`;
							counter++;
						} else {
							exists = false;
						}
					}

					return {
						data: {
							...user,
							role: preRegistered.role,
							name: user.name || preRegistered.name || undefined,
							username,
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
				console.log(`[Auth] Attempting to send magic link to: ${email}`);
				// 1. Check if user is authorized (either already registered or pre-registered)
				const [existingUser, preRegistered] = await Promise.all([
					db.user.findUnique({ where: { email } }),
					db.preRegisteredUser.findUnique({ where: { email } }),
				]);

				if (!existingUser && !preRegistered) {
					console.warn(
						`[Auth] Blocked magic link for unauthorized email: ${email}`,
					);
					// Throwing an APIError here will be caught by the client
					// and prevent the email from being sent.
					throw new APIError("BAD_REQUEST", {
						message: "SIGNUP_DISABLED",
					});
				}

				console.log(`[Auth] Email authorized. Sending via Resend...`);
				const { error } = await resend.emails.send({
					from:
						process.env.RESEND_FROM_ADDRESS || "Test Mail <test@resend.dev>",
					to: [email],
					subject: "Sign in to My Digital Scoop",
					html: `<p>Click the link below to sign in to your account:</p><p><a href="${url}">Sign in</a></p>`,
				});

				if (error) {
					console.error("[Auth] Resend error details:", error);
					throw new Error("Failed to send magic link email");
				}
				console.log(`[Auth] Magic link sent successfully to: ${email}`);
			},
			// Must be false to allow pre-registered users to create their account on first login.
			// Security is still enforced by databaseHooks.user.create.before and the check above.
			disableSignUp: false,
		}),
	],
	// Base URL for better-auth
	baseURL: getRuntimeConfig("BETTER_AUTH_URL") || "http://localhost:3000",
});
