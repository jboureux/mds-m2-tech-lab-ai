import { adminClient, magicLinkClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { getRuntimeConfig } from "@/lib/runtime-config";

export const authClient = createAuthClient({
	baseURL: getRuntimeConfig("BETTER_AUTH_URL") || "http://localhost:3000",
	plugins: [adminClient(), magicLinkClient()],
	user: {
		additionalFields: {
			role: {
				type: "string",
			},
			bio: {
				type: "string",
			},
			banned: {
				type: "boolean",
			},
			banReason: {
				type: "string",
			},
			banExpires: {
				type: "date",
			},
		},
	},
});

export const { useSession, signIn, signOut, admin } = authClient;
