"use client";

import { useQuery } from "@tanstack/react-query";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PostCard } from "./post-card";

interface PostFeedProps {
	initialPosts: Array<{
		id: string;
		content: string;
		status: string;
		isToxic: boolean;
		createdAt: string | Date;
		author: {
			name: string | null;
			image: string | null;
			role: string;
		};
		_count?: {
			comments: number;
		};
	}>;
}

export function PostFeed({ initialPosts }: PostFeedProps) {
	const {
		data: posts,
		isLoading,
		isError,
		refetch,
		isRefetching,
	} = useQuery({
		queryKey: ["posts"],
		queryFn: async () => {
			const response = await fetch("/api/posts");
			if (!response.ok) throw new Error("Failed to fetch posts");
			return response.json();
		},
		initialData: initialPosts,
		refetchOnWindowFocus: false,
	});

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

	if (isLoading && !posts) {
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
					{isRefetching && (
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
				{posts.map((post: any) => (
					<PostCard key={post.id} post={post} />
				))}
			</div>

			<div className="py-10 text-center">
				<p className="text-xs text-muted-foreground font-medium italic">
					You've reached the end of the scoop. Go make some news!
				</p>
			</div>
		</div>
	);
}
