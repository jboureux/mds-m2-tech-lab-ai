import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";
import { DebugPanel } from "@/components/debug/DebugPanel";
import { RuntimeConfigProvider } from "@/components/runtime-config-provider";

const inter = Inter({
	subsets: ["latin"],
	variable: "--font-sans",
});

export const metadata: Metadata = {
	title: "My Digital Scoop",
	description: "Internal School Social Network",
};

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const headerList = await headers();
	const networkLocation = headerList.get("x-network-location") || "off-campus";
	const clientIp = headerList.get("x-client-ip") || "unknown";

	return (
		<html lang="en">
			<body className={`${inter.variable} font-sans antialiased`}>
				<RuntimeConfigProvider />
				{children}
				{process.env.NODE_ENV === "development" && (
					<DebugPanel networkLocation={networkLocation} clientIp={clientIp} />
				)}
			</body>
		</html>
	);
}
