import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";
import { DebugPanel } from "@/components/debug/DebugPanel";
import { ModalProvider } from "@/components/modal-provider";
import { Providers } from "@/components/providers";
import { RuntimeConfigProvider } from "@/components/runtime-config-provider";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({
	subsets: ["latin"],
	variable: "--font-sans",
});

const cormorant = Cormorant_Garamond({
	subsets: ["latin"],
	weight: ["300", "400", "500", "600", "700"],
	variable: "--font-serif",
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
		<html lang="en" suppressHydrationWarning>
			<body
				className={`${inter.variable} ${cormorant.variable} font-sans antialiased`}
			>
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
					disableTransitionOnChange
				>
					<Providers>
						<RuntimeConfigProvider />
						<ModalProvider />
						{children}
						{process.env.NODE_ENV === "development" && (
							<DebugPanel
								networkLocation={networkLocation}
								clientIp={clientIp}
							/>
						)}
					</Providers>
				</ThemeProvider>
			</body>
		</html>
	);
}
