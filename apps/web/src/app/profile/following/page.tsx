"use client";

import { useQuery } from "@tanstack/react-query";
import { User, Users, Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { AsidePanel } from "@/components/social/aside-panel";
import { FollowButton } from "@/components/social/follow-button";
import { SocialHeader } from "@/components/social/header";
import { SocialSidebar } from "@/components/social/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

export default function FollowingPage() {
	const [searchQuery, setSearchSearchQuery] = useState("");

	const { data: following, isLoading } = useQuery({
		queryKey: ["following"],
		queryFn: async () => {
			const res = await fetch("/api/user/following");
			if (!res.ok) throw new Error("Failed to fetch following list");
			return res.json() as Promise<
				{
					id: string;
					name: string | null;
					username: string | null;
					image: string | null;
					bio: string | null;
				}[]
			>;
		},
	});

	const filteredFollowing = following?.filter((user) => {
		const search = searchQuery.toLowerCase();
		return (
			user.name?.toLowerCase().includes(search) ||
			user.username?.toLowerCase().includes(search)
		);
	});

	return (
		<div className="flex min-h-screen flex-col bg-[#F4F2EE] dark:bg-[#000000] font-sans">
			<SocialHeader />

			<div className="container mx-auto max-w-7xl px-4 py-8 flex items-start gap-6 lg:gap-8">
				<SocialSidebar />

				<main className="flex-1 max-w-2xl mx-auto lg:mx-0 space-y-6">
					<Card className="border-none shadow-sm bg-white dark:bg-zinc-900">
						<CardHeader className="border-b px-6 py-4">
							<div className="flex items-center justify-between">
								<CardTitle className="text-xl font-black flex items-center gap-2">
									<Users className="h-5 w-5 text-blue-600" />
									My Following
								</CardTitle>
								<div className="relative w-64">
									<Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
									<Input
										placeholder="Search subscriptions..."
										className="pl-9 h-9 bg-slate-50 dark:bg-zinc-800 border-none text-xs"
										value={searchQuery}
										onChange={(e) => setSearchSearchQuery(e.target.value)}
									/>
								</div>
							</div>
						</CardHeader>
						<CardContent className="p-0">
							{isLoading ? (
								<div className="p-6 space-y-4">
									{[1, 2, 3].map((i) => (
										<div key={i} className="flex items-center gap-4">
											<Skeleton className="h-12 w-12 rounded-full" />
											<div className="space-y-2 flex-1">
												<Skeleton className="h-4 w-1/4" />
												<Skeleton className="h-3 w-1/2" />
											</div>
										</div>
									))}
								</div>
							) : filteredFollowing?.length === 0 ? (
								<div className="p-12 text-center space-y-4">
									<div className="bg-slate-50 dark:bg-zinc-800/50 p-4 rounded-full w-fit mx-auto">
										<User className="h-8 w-8 text-muted-foreground" />
									</div>
									<div className="space-y-1">
										<p className="font-bold text-slate-900 dark:text-zinc-100">
											{searchQuery ? "No matches found" : "No subscriptions yet"}
										</p>
										<p className="text-sm text-muted-foreground">
											{searchQuery
												? "Try searching for someone else"
												: "Start following people to see their scoops here!"}
										</p>
									</div>
								</div>
							) : (
								<div className="divide-y dark:divide-zinc-800">
									{filteredFollowing?.map((user) => (
										<div
											key={user.id}
											className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors"
										>
											<Link
												href={`/u/${user.username}`}
												className="flex items-center gap-4 group"
											>
												<Avatar className="h-12 w-12 border shadow-sm group-hover:ring-2 ring-blue-600/20 transition-all">
													<AvatarImage src={user.image || ""} />
													<AvatarFallback className="bg-blue-100 text-blue-700 font-bold">
														{user.name?.charAt(0) || "U"}
													</AvatarFallback>
												</Avatar>
												<div className="flex flex-col">
													<span className="font-bold text-sm text-slate-900 dark:text-zinc-100 group-hover:text-blue-600 transition-colors">
														{user.name}
													</span>
													<span className="text-xs text-muted-foreground">
														@{user.username}
													</span>
													{user.bio && (
														<span className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
															{user.bio}
														</span>
													)}
												</div>
											</Link>
											<FollowButton userId={user.id} />
										</div>
									))}
								</div>
							)}
						</CardContent>
					</Card>
				</main>

				<AsidePanel />
			</div>
		</div>
	);
}
