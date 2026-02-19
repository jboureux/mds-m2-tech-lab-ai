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

interface AppSidebarProps {
	networkLocation?: string;
}

/**
 * AppSidebar wrapper to ensure it only renders on the client.
 */
export function AppSidebar({
	networkLocation = "off-campus",
}: AppSidebarProps) {
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return (
			<Sidebar collapsible="icon" className="border-r">
				<SidebarHeader className="h-16 flex items-center justify-center border-b">
					<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
						<School className="h-5 w-5 text-muted-foreground" />
					</div>
				</SidebarHeader>
				<SidebarContent />
				<SidebarFooter className="border-t p-2" />
			</Sidebar>
		);
	}

	return <AppSidebarContent networkLocation={networkLocation} />;
}

function AppSidebarContent({ networkLocation }: { networkLocation: string }) {
	const { data: session } = useSession();
	const pathname = usePathname();
	const router = useRouter();

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
			className="border-r bg-sidebar text-sidebar-foreground"
		>
			<SidebarHeader className="h-16 flex items-center justify-center border-b bg-sidebar">
				<Link href="/" className="flex items-center gap-3 px-2 group">
					<div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg transition-transform group-hover:scale-105 active:scale-95">
						<School className="h-5 w-5" />
					</div>
					<div className="flex flex-col group-data-[collapsible=icon]:hidden overflow-hidden">
						<span className="font-bold text-sm tracking-tight">MDS Admin</span>
						<span className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">
							Internal Portal
						</span>
					</div>
				</Link>
			</SidebarHeader>

			<SidebarContent className="px-2 py-4">
				<SidebarGroup>
					<SidebarGroupLabel className="px-2 pb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
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
												? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:text-primary-foreground"
												: "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
										)}
									>
										<Link href={item.url} className="flex items-center gap-3">
											<item.icon
												className={cn(
													"h-4.5 w-4.5",
													pathname === item.url
														? "text-primary-foreground"
														: "text-muted-foreground",
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

				<div className="mt-auto px-4 py-4 group-data-[collapsible=icon]:hidden">
					<div className="rounded-xl border bg-muted/20 p-3 shadow-inner">
						<div className="flex items-center justify-between mb-2">
							<span className="text-[10px] font-bold uppercase text-muted-foreground/70">
								Network Status
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
										? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
										: "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]",
								)}
							/>
							<span className="text-[11px] font-bold text-foreground capitalize">
								{networkLocation.replace("-", " ")}
							</span>
						</div>
					</div>
				</div>
			</SidebarContent>

			<SidebarFooter className="border-t p-3 bg-sidebar">
				<SidebarMenu>
					<SidebarMenuItem>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<SidebarMenuButton
									size="lg"
									className="transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-xl"
								>
									<Avatar className="h-9 w-9 rounded-lg border shadow-sm">
										<AvatarFallback className="rounded-lg bg-primary text-primary-foreground text-xs font-bold">
											{userInitials}
										</AvatarFallback>
									</Avatar>
									<div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden ml-1">
										<span className="truncate font-bold">
											{session?.user?.name || "Anonymous"}
										</span>
										<span className="truncate text-[10px] text-muted-foreground font-medium">
											{session?.user?.email}
										</span>
									</div>
									<ChevronUp className="ml-auto size-4 group-data-[collapsible=icon]:hidden text-muted-foreground" />
								</SidebarMenuButton>
							</DropdownMenuTrigger>
							<DropdownMenuContent
								className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-xl p-2 shadow-2xl"
								side="top"
								align="end"
								sideOffset={8}
							>
								<DropdownMenuLabel className="p-0 font-normal">
									<div className="flex items-center gap-3 px-1 py-1.5 text-left text-sm leading-tight">
										<Avatar className="h-9 w-9 rounded-lg">
											<AvatarFallback className="rounded-lg bg-primary text-primary-foreground font-bold">
												{userInitials}
											</AvatarFallback>
										</Avatar>
										<div className="grid flex-1 text-left text-sm leading-tight">
											<span className="truncate font-bold text-foreground">
												{session?.user?.name}
											</span>
											<span className="truncate text-xs text-muted-foreground font-medium">
												{session?.user?.role}
											</span>
										</div>
									</div>
								</DropdownMenuLabel>
								<DropdownMenuSeparator className="my-2" />
								<DropdownMenuItem className="rounded-lg gap-2 cursor-pointer py-2">
									<Settings className="h-4 w-4 text-muted-foreground" />
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
