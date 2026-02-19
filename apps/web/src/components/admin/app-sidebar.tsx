"use client";

import {
	ChevronUp,
	Globe,
	LogOut,
	Network,
	School,
	Settings,
	ShieldCheck,
	Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import { signOut, useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

const adminNavItems = [
	{
		title: "User Management",
		url: "/admin/users",
		icon: Users,
	},
	{
		title: "Network Ranges",
		url: "/admin/network",
		icon: Network,
	},
	{
		title: "Moderation Rules",
		url: "/admin/moderation",
		icon: ShieldCheck,
	},
];

/**
 * AppSidebar wrapper to ensure it only renders on the client.
 */
export function AppSidebar() {
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return (
			<Sidebar
				collapsible="icon"
				className="border-r border-zinc-200 dark:border-zinc-800"
			>
				<SidebarHeader className="h-16 flex items-center justify-center border-b border-zinc-100 dark:border-zinc-800">
					<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
						<School className="h-5 w-5 text-zinc-400" />
					</div>
				</SidebarHeader>
				<SidebarContent />
				<SidebarFooter className="border-t border-zinc-100 dark:border-zinc-800 p-2" />
			</Sidebar>
		);
	}

	return <AppSidebarContent />;
}

function AppSidebarContent() {
	const { data: session } = useSession();
	const pathname = usePathname();
	const router = useRouter();

	// Access network location from headers isn't direct here,
	// but we can assume it might be passed or fetched.
	// For now, let's use a dummy state or wait for implementation.
	const networkLocation = "on-campus"; // This should ideally come from a context/provider

	const handleSignOut = async () => {
		await signOut({
			fetchOptions: {
				onSuccess: () => {
					router.push("/login");
					router.refresh();
				},
			},
		});
	};

	const userInitials = session?.user?.name
		? session.user.name
				.split(" ")
				.map((n) => n[0])
				.join("")
				.toUpperCase()
		: "U";

	return (
		<Sidebar
			collapsible="icon"
			className="border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50"
		>
			<SidebarHeader className="h-16 flex items-center justify-center border-b border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950">
				<Link href="/" className="flex items-center gap-3 px-2 group">
					<div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0F172A] text-[#FACC15] shadow-lg transition-transform group-hover:scale-105 active:scale-95">
						<School className="h-5 w-5" />
					</div>
					<div className="flex flex-col group-data-[collapsible=icon]:hidden overflow-hidden">
						<span className="font-bold text-sm tracking-tight text-zinc-900 dark:text-zinc-100">
							MDS Admin
						</span>
						<span className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest">
							Internal Portal
						</span>
					</div>
				</Link>
			</SidebarHeader>

			<SidebarContent className="px-2 py-4">
				<SidebarGroup>
					<SidebarGroupLabel className="px-2 pb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
						Core Systems
					</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{adminNavItems.map((item) => (
								<SidebarMenuItem key={item.title} className="mb-1">
									<SidebarMenuButton
										asChild
										tooltip={item.title}
										isActive={pathname === item.url}
										className={cn(
											"transition-all duration-200 rounded-lg py-5 px-3",
											pathname === item.url
												? "bg-[#0F172A] text-white shadow-md hover:bg-[#1E293B] hover:text-white"
												: "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50",
										)}
									>
										<Link href={item.url} className="flex items-center gap-3">
											<item.icon
												className={cn(
													"h-4.5 w-4.5",
													pathname === item.url
														? "text-[#FACC15]"
														: "text-zinc-400",
												)}
											/>
											<span className="font-medium text-sm">{item.title}</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>

				{/* Network Status indicator in Sidebar */}
				<div className="mt-auto px-4 py-4 group-data-[collapsible=icon]:hidden">
					<div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3 shadow-sm">
						<div className="flex items-center justify-between mb-2">
							<span className="text-[10px] font-bold uppercase text-zinc-400">
								Network
							</span>
							{networkLocation === "on-campus" ? (
								<School className="h-3 w-3 text-emerald-500" />
							) : (
								<Globe className="h-3 w-3 text-amber-500" />
							)}
						</div>
						<div className="flex items-center gap-2">
							<div
								className={cn(
									"h-2 w-2 rounded-full animate-pulse",
									networkLocation === "on-campus"
										? "bg-emerald-500"
										: "bg-amber-500",
								)}
							/>
							<span className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 capitalize">
								{networkLocation.replace("-", " ")}
							</span>
						</div>
					</div>
				</div>
			</SidebarContent>

			<SidebarFooter className="border-t border-zinc-100 dark:border-zinc-800 p-3 bg-white dark:bg-zinc-950">
				<SidebarMenu>
					<SidebarMenuItem>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<SidebarMenuButton
									size="lg"
									className="transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl"
								>
									<Avatar className="h-9 w-9 rounded-lg border-2 border-zinc-100 dark:border-zinc-800 shadow-sm">
										<AvatarFallback className="rounded-lg bg-[#0F172A] text-[#FACC15] text-xs font-bold">
											{userInitials}
										</AvatarFallback>
									</Avatar>
									<div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden ml-1">
										<span className="truncate font-bold text-zinc-900 dark:text-zinc-100">
											{session?.user?.name || "Anonymous"}
										</span>
										<span className="truncate text-[10px] text-zinc-500 font-medium">
											{session?.user?.email}
										</span>
									</div>
									<ChevronUp className="ml-auto size-4 group-data-[collapsible=icon]:hidden text-zinc-400" />
								</SidebarMenuButton>
							</DropdownMenuTrigger>
							<DropdownMenuContent
								className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-xl p-2 shadow-2xl"
								side="top"
								align="end"
								sideOffset={8}
							>
								<DropdownMenuLabel className="px-2 py-2 font-normal">
									<div className="flex items-center gap-3">
										<Avatar className="h-9 w-9 rounded-lg">
											<AvatarFallback className="rounded-lg bg-[#0F172A] text-[#FACC15] font-bold">
												{userInitials}
											</AvatarFallback>
										</Avatar>
										<div className="grid flex-1 text-left text-sm leading-tight">
											<span className="truncate font-bold text-zinc-900 dark:text-zinc-100">
												{session?.user?.name}
											</span>
											<span className="truncate text-xs text-zinc-500 font-medium">
												{session?.user?.role}
											</span>
										</div>
									</div>
								</DropdownMenuLabel>
								<DropdownMenuSeparator className="my-2" />
								<DropdownMenuItem className="rounded-lg gap-2 cursor-pointer py-2">
									<Settings className="h-4 w-4 text-zinc-400" />
									<span className="font-medium">Account Settings</span>
								</DropdownMenuItem>
								<DropdownMenuSeparator className="my-2" />
								<DropdownMenuItem
									onClick={handleSignOut}
									className="rounded-lg gap-2 text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer py-2"
								>
									<LogOut className="h-4 w-4" />
									<span className="font-bold">Log out</span>
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
		</Sidebar>
	);
}
