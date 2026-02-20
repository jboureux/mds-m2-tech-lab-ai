import { Search } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { auth } from "@/lib/auth";

export async function SocialHeader() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) return null;

	const { user } = session;

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

					<Link href="/profile">
						<Button
							variant="ghost"
							className="p-0.5 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800"
						>
							<Avatar className="h-8 w-8 ring-2 ring-transparent hover:ring-blue-600/30 transition-all">
								<AvatarImage src={user.image || ""} />
								<AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
							</Avatar>
						</Button>
					</Link>
				</div>
			</div>
		</header>
	);
}

function _HeaderIconButton({
	icon: Icon,
	label,
	active = false,
}: {
	icon: React.ElementType;
	label: string;
	active?: boolean;
}) {
	return (
		<Button
			variant="ghost"
			size="icon"
			className={`h-9 w-9 rounded-full relative group transition-all ${
				active
					? "text-blue-600 bg-blue-50 dark:bg-blue-900/20"
					: "text-slate-500 hover:text-blue-600 hover:bg-slate-50 dark:hover:bg-zinc-800"
			}`}
			title={label}
		>
			<Icon className="h-5 w-5" />
			{active && (
				<span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full" />
			)}
		</Button>
	);
}
