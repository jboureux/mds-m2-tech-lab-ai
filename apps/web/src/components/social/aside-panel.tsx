import { Hash, Info, UserPlus, Wifi, WifiOff } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { auth } from "@/lib/auth";
import db from "@/lib/prisma";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FollowButton } from "./follow-button";

export async function AsidePanel({ hideCard = false }: { hideCard?: boolean }) {
	const h = await headers();
	const networkLocation = h.get("x-network-location") || "off-campus";
	const isOnCampus = networkLocation === "on-campus";

	const session = await auth.api.getSession({
		headers: h,
	});

	// Fetch Trending Hashtags
	const trendingTags = await db.hashtag.findMany({
		take: 5,
		orderBy: {
			posts: {
				_count: "desc",
			},
		},
		include: {
			_count: {
				select: { posts: true },
			},
		},
	});

	// Fetch Suggested People (not followed by current user)
	let suggestedPeople: any[] = [];
	if (session) {
		const following = await db.follow.findMany({
			where: { followerId: session.user.id },
			select: { followingId: true },
		});
		const followingIds = following.map((f) => f.followingId);

		suggestedPeople = await db.user.findMany({
			where: {
				id: {
					notIn: [...followingIds, session.user.id],
				},
				role: { not: "ADMIN" },
			},
			take: 3,
			select: {
				id: true,
				name: true,
				username: true,
				image: true,
			},
		});
	}

	return (
		<div className="hidden xl:flex flex-col gap-4 w-72 shrink-0 h-fit sticky top-20">
			{!hideCard && (
				<Card className="border-none shadow-sm bg-white dark:bg-zinc-900 overflow-hidden">
					<CardHeader className="p-4 pb-2">
						<div className="flex items-center justify-between">
							<CardTitle className="text-sm font-bold flex items-center gap-2">
								Network Status
								<Info className="h-3.5 w-3.5 text-muted-foreground" />
							</CardTitle>
							<Badge
								variant={isOnCampus ? "default" : "secondary"}
								className={`text-[10px] uppercase ${isOnCampus ? "bg-green-100 text-green-700 hover:bg-green-100" : "bg-amber-100 text-amber-700 hover:bg-amber-100"}`}
							>
								{isOnCampus ? (
									<Wifi className="h-3 w-3 mr-1 inline" />
								) : (
									<WifiOff className="h-3 w-3 mr-1 inline" />
								)}
								{isOnCampus ? "On Campus" : "Off Campus"}
							</Badge>
						</div>
					</CardHeader>
					<CardContent className="p-4 pt-2">
						<p className="text-xs text-muted-foreground leading-relaxed">
							{isOnCampus
								? "You are connected to the School Wi-Fi. You have full access to all features, including posting."
								: "You are off-campus. Some features like posting are restricted to ensure local-only interactions."}
						</p>
					</CardContent>
				</Card>
			)}

			<Card className="border-none shadow-sm bg-white dark:bg-zinc-900 overflow-hidden">
				<CardHeader className="p-4 pb-2">
					<CardTitle className="text-sm font-bold flex items-center gap-2">
						Trending Scoops
						<Hash className="h-3.5 w-3.5 text-blue-600" />
					</CardTitle>
				</CardHeader>
				<CardContent className="p-4 pt-0 space-y-3">
					{trendingTags.length > 0 ? (
						trendingTags.map((tag) => (
							<Link
								key={tag.id}
								href={`/feed/hashtag/${tag.name}`}
								className="block group"
							>
								<p className="text-xs font-bold text-slate-900 dark:text-zinc-100 group-hover:text-blue-600 transition-colors">
									#{tag.name}
								</p>
								<p className="text-[10px] text-muted-foreground">
									{tag._count.posts} scoops
								</p>
							</Link>
						))
					) : (
						<p className="text-[10px] text-muted-foreground italic">
							No hashtags used yet.
						</p>
					)}
				</CardContent>
			</Card>

			{suggestedPeople.length > 0 && (
				<Card className="border-none shadow-sm bg-white dark:bg-zinc-900 overflow-hidden">
					<CardHeader className="p-4 pb-2">
						<CardTitle className="text-sm font-bold flex items-center gap-2">
							Who to follow
							<UserPlus className="h-3.5 w-3.5 text-blue-600" />
						</CardTitle>
					</CardHeader>
					<CardContent className="p-4 pt-0 space-y-4">
						{suggestedPeople.map((person) => (
							<div key={person.id} className="flex items-center justify-between gap-2">
								<Link
									href={`/u/${person.username}`}
									className="flex items-center gap-2 group min-w-0"
								>
									<Avatar className="h-8 w-8 border shadow-sm group-hover:ring-2 ring-blue-600/20 transition-all shrink-0">
										<AvatarImage src={person.image || ""} />
										<AvatarFallback className="bg-blue-100 text-blue-700 font-bold text-[10px]">
											{person.name?.charAt(0) || "U"}
										</AvatarFallback>
									</Avatar>
									<div className="flex flex-col min-w-0">
										<span className="font-bold text-[11px] text-slate-900 dark:text-zinc-100 group-hover:text-blue-600 transition-colors truncate">
											{person.name}
										</span>
										<span className="text-[9px] text-muted-foreground truncate">
											@{person.username}
										</span>
									</div>
								</Link>
								<FollowButton
									userId={person.id}
									className="h-7 px-2 text-[9px] rounded-full shrink-0"
								/>
							</div>
						))}
					</CardContent>
				</Card>
			)}

			<div className="px-4 text-[10px] text-muted-foreground space-y-1">
				<div className="flex flex-wrap gap-x-2 gap-y-1">
					<a href="/" className="hover:underline">
						About
					</a>
					<a href="/" className="hover:underline">
						Accessibility
					</a>
					<a href="/" className="hover:underline">
						Help Center
					</a>
					<a href="/" className="hover:underline">
						Privacy & Terms
					</a>
				</div>
				<p className="pt-2 font-medium">My Digital Scoop © 2026</p>
			</div>
		</div>
	);
}
