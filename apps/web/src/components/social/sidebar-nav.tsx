"use client";

import { AtSign, LayoutDashboard, LogOut, ShieldAlert, User } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type React from "react";
import { Separator } from "@/components/ui/separator";
import { signOut } from "@/lib/auth-client";

interface SidebarNavProps {
	user: {
		role: string;
	};
	profileHref: string;
}

export function SidebarNav({ user, profileHref }: SidebarNavProps) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const filter = searchParams.get("filter");

	const handleSignOut = async () => {
		await signOut({
			fetchOptions: {
				onSuccess: () => {
					router.push("/");
				},
			},
		});
	};

	return (
		<nav className="flex flex-col gap-1">
			<SidebarNavItem
				href="/feed"
				icon={LayoutDashboard}
				label="Feed"
				active={!filter && usePathname() === "/feed"}
			/>
			<SidebarNavItem
				href="/feed?filter=tagged"
				icon={AtSign}
				label="Tagged"
				active={filter === "tagged"}
			/>
			<SidebarNavItem href={profileHref} icon={User} label="Profile" />
			{user.role === "ADMIN" && (
				<>
					<Separator className="my-2" />
					<SidebarNavItem
						href="/admin/users"
						icon={ShieldAlert}
						label="Admin Panel"
						variant="destructive"
					/>
				</>
			)}
			<Separator className="my-2" />
			<button
				type="button"
				onClick={handleSignOut}
				className="flex items-center justify-between px-3 py-2 rounded-lg transition-colors group hover:bg-red-50 dark:hover:bg-red-950/20 text-slate-600 dark:text-zinc-400 hover:text-red-600"
			>
				<div className="flex items-center gap-3">
					<LogOut className="h-5 w-5 text-slate-400 group-hover:text-red-500" />
					<span className="text-sm font-medium">Sign Out</span>
				</div>
			</button>
		</nav>
	);
}

function SidebarNavItem({
	href,
	icon: Icon,
	label,
	badge,
	active: customActive,
	variant = "default",
}: {
	href: string;
	icon: React.ElementType;
	label: string;
	badge?: number;
	active?: boolean;
	variant?: "default" | "destructive";
}) {
	const pathname = usePathname();
	const active =
		customActive !== undefined
			? customActive
			: pathname === href || (href !== "/feed" && pathname.startsWith(href));

	return (
		<Link
			href={href}
			className={`flex items-center justify-between px-3 py-2 rounded-lg transition-colors group ${
				active
					? "bg-blue-50 dark:bg-blue-900/20 text-blue-600"
					: "hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100"
			}`}
		>
			<div className="flex items-center gap-3">
				<Icon
					className={`h-5 w-5 ${
						active
							? "text-blue-600"
							: variant === "destructive"
								? "text-red-500"
								: "text-slate-400 group-hover:text-slate-600"
					}`}
				/>
				<span
					className={`text-sm font-medium ${variant === "destructive" ? "text-red-500" : ""}`}
				>
					{label}
				</span>
			</div>
			{badge && (
				<span className="text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded-full font-bold">
					{badge}
				</span>
			)}
		</Link>
	);
}
