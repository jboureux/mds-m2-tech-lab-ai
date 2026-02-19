import { PUBLIC_RUNTIME_CONFIG_KEYS } from "@/lib/runtime-config";

export function RuntimeConfigProvider() {
	// Only run on the server to generate the configuration object
	// This takes the keys defined in PUBLIC_RUNTIME_CONFIG_KEYS and
	// gets their current values from process.env.
	const config = PUBLIC_RUNTIME_CONFIG_KEYS.reduce(
		(acc, key) => {
			acc[key] = process.env[key];
			return acc;
		},
		{} as Record<string, string | undefined>,
	);

	return (
		<script
			id="runtime-config"
			// biome-ignore lint/security/noDangerouslySetInnerHtml: Required to inject runtime configuration variables into the browser
			dangerouslySetInnerHTML={{
				__html: `window._runtime_config_ = ${JSON.stringify(config)}`,
			}}
		/>
	);
}
