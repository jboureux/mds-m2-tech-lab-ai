import type { User } from "better-auth";
import { Search } from "lucide-react";
import { headers } from "next/headers";
import { Input } from "@/components/ui/input";
import { auth } from "@/lib/auth";
import { HeaderProfileLink } from "@/components/social/header-profile-link";

export async function SocialHeader() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) return null;

	const { user } = session;
	const profileHref = (user as User & { username?: string }).username
		? `/u/${(user as User & { username?: string }).username}`
		: "/profile";

	return (
		<header className="sticky top-0 z-50 w-full border-b bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md px-4 h-14 flex items-center shadow-sm">
			<div className="container mx-auto max-w-7xl flex items-center justify-between gap-4">
				<div className="flex items-center gap-2 shrink-0">
					<div className="h-9 w-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-xl shadow-lg ring-2 ring-blue-600/20 group hover:scale-105 transition-transform">
						M
					</div>
					<span className="text-xl font-black tracking-tighter text-blue-600 hidden sm:inline-block">
						MDS
					</span>
				</div>

				<div className="flex-1 max-w-md hidden md:flex items-center relative group">
					<Search className="absolute left-3 h-4 w-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
					<Input
						placeholder="Search for scoops..."
						className="pl-10 h-9 bg-slate-100 dark:bg-zinc-800 border-none ring-0 focus-visible:ring-2 focus-visible:ring-blue-600/50 transition-all rounded-full"
					/>
				</div>

				<div className="flex items-center gap-1 sm:gap-2">
					<div className="h-6 w-px bg-slate-200 dark:bg-zinc-700 mx-1 hidden sm:block" />

					<HeaderProfileLink
						profileHref={profileHref}
						user={{
							name: user.name,
							image: user.image,
						}}
					/>
				</div>
			</div>
		</header>
	);
}
