export const PUBLIC_RUNTIME_CONFIG_KEYS = ["BETTER_AUTH_URL"] as const;

export type PublicRuntimeConfigKey =
	(typeof PUBLIC_RUNTIME_CONFIG_KEYS)[number];

declare global {
	interface Window {
		_runtime_config_?: Record<string, string | undefined>;
	}
}

/**
 * Utility to get environment variables both on server and client.
 * On server, it reads from process.env.
 * On client, it reads from window._runtime_config_ injected in layout.
 */
export function getRuntimeConfig(key: string): string {
	if (typeof window === "undefined") {
		// Server-side: use process.env
		return process.env[key] || "";
	}

	// Client-side: use window._runtime_config_
	return window._runtime_config_?.[key] || "";
}
