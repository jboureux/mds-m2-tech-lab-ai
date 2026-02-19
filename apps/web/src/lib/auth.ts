import { prismaAdapter } from "@better-auth/prisma-adapter";
import { betterAuth } from "better-auth";
import { APIError } from "better-auth/api";
import { magicLink } from "better-auth/plugins";
import db from "./prisma";
import { resend } from "./resend";
import { getRuntimeConfig } from "./runtime-config";

export const auth = betterAuth({
	database: prismaAdapter(db, {
		provider: "postgresql",
	}),
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
							name: user.name || preRegistered.name,
						},
					};
				},
			},
		},
	},
	plugins: [
		magicLink({
			sendMagicLink: async ({ email, token: _token, url }, _ctx) => {
				const { error } = await resend.emails.send({
					from:
						process.env.EMAIL_FROM ||
						"My Digital Scoop <noreply@mydigitalscoop.com>",
					to: [email],
					subject: "Sign in to My Digital Scoop",
					html: `<p>Click the link below to sign in to your account:</p><p><a href="${url}">Sign in</a></p>`,
				});

				if (error) {
					console.error("Failed to send magic link email", error);
					throw new Error("Failed to send magic link email");
				}
			},
			// Disable self-signup via magic link - only existing users can sign in
			disableSignUp: true,
		}),
	],
	// Base URL for better-auth
	baseURL: getRuntimeConfig("BETTER_AUTH_URL") || "http://localhost:3000",
});
