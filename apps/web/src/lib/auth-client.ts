import { createAuthClient } from "better-auth/client";
import { magicLinkClient } from "better-auth/client/plugins";
import { getRuntimeConfig } from "@/lib/runtime-config";

export const authClient = createAuthClient({
	baseURL: getRuntimeConfig("BETTER_AUTH_URL") || "http://localhost:3000",
	plugins: [magicLinkClient()],
});
