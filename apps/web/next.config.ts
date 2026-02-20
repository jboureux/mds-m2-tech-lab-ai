import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	/* config options here */
	reactCompiler: true,
	output: "standalone",
	serverExternalPackages: [
		"better-auth",
		"@tensorflow/tfjs-node",
		"@xenova/transformers"
	],
};

export default nextConfig;
