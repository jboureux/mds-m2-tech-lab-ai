import { LayoutDashboard, Settings, ShieldAlert } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { auth } from "@/lib/auth";

export async function SocialSidebar() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) return null;

	const { user } = session;

	return (
		<div className="hidden lg:flex flex-col gap-4 w-64 shrink-0 h-fit sticky top-20">
			<Card className="overflow-hidden border-none shadow-sm bg-white dark:bg-zinc-900">
				<div className="h-16 bg-gradient-to-r from-blue-600 to-indigo-600" />
				<CardHeader className="p-0 flex items-center -mt-8 px-4 pb-4">
					<Avatar className="h-16 w-16 border-4 border-white dark:border-zinc-900 ring-2 ring-blue-600/10">
						<AvatarImage src={user.image || ""} />
						<AvatarFallback className="text-xl">
							{user.name?.charAt(0)}
						</AvatarFallback>
					</Avatar>
					<div className="text-center mt-2">
						<h3 className="font-bold text-lg leading-tight">{user.name}</h3>
						<p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mt-1">
							{user.role}
						</p>
					</div>
				</CardHeader>
			</Card>

			<nav className="flex flex-col gap-1">
				<SidebarNavItem
					href="/feed"
					icon={LayoutDashboard}
					label="Feed"
					active
				/>
				<SidebarNavItem href="/settings" icon={Settings} label="Settings" />
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
			</nav>
		</div>
	);
}

function SidebarNavItem({
	href,
	icon: Icon,
	label,
	active = false,
	badge,
	variant = "default",
}: {
	href: string;
	icon: React.ElementType;
	label: string;
	active?: boolean;
	badge?: number;
	variant?: "default" | "destructive";
}) {
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
