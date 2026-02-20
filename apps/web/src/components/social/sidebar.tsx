import type { User } from "better-auth";
import { headers } from "next/headers";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardHeader } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { SidebarNav } from "./sidebar-nav";

export async function SocialSidebar({
	hideCard = false,
}: {
	hideCard?: boolean;
}) {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) return null;

	const { user } = session;
	const profileHref = (user as User & { username?: string }).username
		? `/u/${(user as User & { username?: string }).username}`
		: "/profile";

	return (
		<div className="hidden lg:flex flex-col gap-4 w-64 shrink-0 h-fit sticky top-20">
			{!hideCard && (
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
			)}

			<SidebarNav user={user} profileHref={profileHref} />
		</div>
	);
}
