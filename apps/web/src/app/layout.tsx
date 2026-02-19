import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { RuntimeConfigProvider } from "@/components/runtime-config-provider";

const inter = Inter({
	subsets: ["latin"],
	variable: "--font-sans",
});

export const metadata: Metadata = {
	title: "My Digital Scoop",
	description: "Internal School Social Network",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={`${inter.variable} font-sans antialiased`}>
				<RuntimeConfigProvider />
				{children}
			</body>
		</html>
	);
}
