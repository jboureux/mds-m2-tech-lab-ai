"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { Loader2, RefreshCw } from "lucide-react";
import React from "react";
import { useInView } from "react-intersection-observer";
import { Button } from "@/components/ui/button";
import { PostCard } from "./post-card";

interface Post {
	id: string;
	content: string;
	status: string;
	isToxic: boolean;
	createdAt: string | Date;
	author: {
		id: string;
		name: string | null;
		image: string | null;
		role: string;
	};
	_count?: {
		comments: number;
	};
}

interface PostFeedProps {
	initialPosts: Post[];
}

export function PostFeed({ initialPosts }: PostFeedProps) {
	const { ref, inView } = useInView();

	const {
		data,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		isLoading,
		isError,
		refetch,
		isRefetching,
	} = useInfiniteQuery({
		queryKey: ["posts"],
		queryFn: async ({ pageParam = null }) => {
			const url = new URL("/api/posts", window.location.origin);
			url.searchParams.set("limit", "10");
			if (pageParam) url.searchParams.set("cursor", pageParam as string);
			const response = await fetch(url.toString());
			if (!response.ok) throw new Error("Failed to fetch posts");
			return response.json();
		},
		initialPageParam: null,
		getNextPageParam: (lastPage) => lastPage.nextCursor,
		refetchInterval: 60000, // Poll every 1 minute to keep feed fresh
		refetchOnWindowFocus: true,
	});

	React.useEffect(() => {
		if (inView && hasNextPage && !isFetchingNextPage) {
			fetchNextPage();
		}
	}, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

	// Use initialPosts only if data is not yet available
	const posts = data?.pages.flatMap((page) => page.items) || initialPosts;

	if (isError) {
		return (
			<div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-2xl border border-red-200 dark:border-red-900/50 shadow-sm">
				<p className="text-red-500 font-bold mb-4">
					Oops! Something went wrong loading the scoops.
				</p>
				<Button onClick={() => refetch()} variant="outline" className="gap-2">
					<RefreshCw className="h-4 w-4" /> Try again
				</Button>
			</div>
		);
	}

	if (isLoading && !posts.length) {
		return (
			<div className="flex flex-col items-center justify-center py-40 gap-4">
				<Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
				<p className="text-muted-foreground font-bold tracking-widest text-xs uppercase animate-pulse">
					Loading scoops...
				</p>
			</div>
		);
	}

	if (posts.length === 0) {
		return (
			<div className="text-center py-32 bg-white dark:bg-zinc-900 rounded-2xl border border-dashed shadow-sm group">
				<div className="h-16 w-16 bg-slate-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-500">
					✨
				</div>
				<h3 className="font-black text-lg text-slate-800 dark:text-zinc-200">
					The scoop is empty!
				</h3>
				<p className="text-muted-foreground text-sm mt-1">
					Be the first to share something amazing with your school.
				</p>
				<Button
					onClick={() => refetch()}
					variant="link"
					className="text-blue-600 mt-4 h-auto p-0 font-black tracking-wider uppercase text-[10px]"
				>
					Refresh feed
				</Button>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between px-1">
				<h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
					<span className="w-8 h-px bg-slate-200 dark:bg-zinc-800" />
					Recent Activity
					{(isRefetching || isFetchingNextPage) && (
						<Loader2 className="h-3 w-3 animate-spin text-blue-600" />
					)}
				</h2>
				<button
					type="button"
					onClick={() => refetch()}
					className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:underline"
				>
					Sort by Newest
				</button>
			</div>

			<div className="grid gap-6">
				{posts.map((post: PostFeedProps["initialPosts"][number]) => (
					<PostCard key={post.id} post={post} />
				))}
			</div>

			{/* Loading trigger for infinite scroll */}
			<div ref={ref} className="py-10 text-center">
				{isFetchingNextPage ? (
					<Loader2 className="h-6 w-6 animate-spin text-blue-600 mx-auto" />
				) : hasNextPage ? (
					<div className="h-10 w-full" />
				) : (
					<p className="text-xs text-muted-foreground font-medium italic">
						You've reached the end of the scoop. Go make some news!
					</p>
				)}
			</div>
		</div>
	);
}
