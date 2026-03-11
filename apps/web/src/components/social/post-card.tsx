"use client";

import type { PostStatus } from "@prisma/client";
import { formatDistanceToNow } from "date-fns";
import {
	Heart,
	MessageSquare,
	MoreVertical,
	Send,
	Share2,
	ShieldAlert,
} from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { ModerationActions } from "@/components/admin/moderation/moderation-actions";
import { FollowButton } from "@/components/social/follow-button";
import { Markdown } from "@/components/social/markdown";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
} from "@/components/ui/card";

interface PostCardProps {
	post: {
		id: string;
		content: string;
		status: PostStatus;
		isToxic: boolean;
		createdAt: Date | string;
		author: {
			id: string;
			name: string | null;
			email?: string | null;
			username?: string | null;
			image: string | null;
			role: string;
		};
		_count?: {
			comments: number;
		};
	};
	isStaff?: boolean;
}

export function PostCard({ post, isStaff = false }: PostCardProps) {
	const [mounted, setMounted] = React.useState(false);
	const [liked, setLiked] = React.useState(false);

	React.useEffect(() => {
		setMounted(true);
	}, []);

	const isFlagged = post.status === "FLAGGED" || post.isToxic;

	const createdAt =
		typeof post.createdAt === "string"
			? new Date(post.createdAt)
			: post.createdAt;

	const authorHref = post.author.username
		? `/u/${post.author.username}`
		: "/profile";

	return (
		<Card className="w-full border-none shadow-sm hover:shadow-md transition-all duration-300 bg-white dark:bg-zinc-900 group">
			<CardHeader className="flex flex-row items-center space-y-0 gap-3 p-4">
				<Link href={authorHref}>
					<Avatar className="h-12 w-12 border shadow-sm ring-2 ring-blue-600/5 cursor-pointer">
						<AvatarImage
							src={post.author.image || ""}
							alt={post.author.name || ""}
						/>
						<AvatarFallback className="bg-blue-100 text-blue-700 font-bold">
							{post.author.name?.charAt(0) || "U"}
						</AvatarFallback>
					</Avatar>
				</Link>
				<div className="flex flex-col flex-1">
					<div className="flex items-center gap-1.5 group/author cursor-pointer">
						<Link href={authorHref}>
							<span className="font-bold text-sm text-slate-900 dark:text-zinc-100 group-hover/author:text-blue-600 group-hover/author:underline transition-colors leading-tight">
								{post.author.name}
							</span>
						</Link>
						{post.author.role !== "USER" && (
							<Badge
								variant="secondary"
								className="text-[9px] h-3.5 px-1 uppercase font-black bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-none"
							>
								{post.author.role}
							</Badge>
						)}
						<FollowButton userId={post.author.id} className="h-6 px-2 text-[10px]" />
					</div>
					<div className="flex items-center gap-1">
						<span className="text-[11px] text-muted-foreground font-medium">
							{mounted
								? formatDistanceToNow(createdAt, { addSuffix: true })
								: "Just now"}
						</span>
						<span className="text-[10px] text-muted-foreground">•</span>
						<span className="text-[10px] text-muted-foreground font-bold flex items-center gap-0.5">
							<ShieldAlert className="h-3 w-3 inline" /> Public
						</span>
					</div>
				</div>
				{isStaff ? (
					<ModerationActions post={post} />
				) : (
					<Button
						variant="ghost"
						size="icon"
						className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
					>
						<MoreVertical className="h-4 w-4" />
					</Button>
				)}
			</CardHeader>

			<CardContent className="space-y-3 px-4 pb-4">
				{isFlagged ? (
					isStaff ? (
						<div className="space-y-4">
							<div className="flex items-start gap-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-400 text-[11px] font-bold uppercase tracking-tight shadow-sm">
								<ShieldAlert className="h-4 w-4 shrink-0" />
								<span>
									Staff View: This post is flagged but visible to you for
									review.
								</span>
							</div>
							<Markdown
								content={post.content}
								className="text-sm text-slate-700 dark:text-zinc-300"
							/>
						</div>
					) : (
						<div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/50 text-red-700 dark:text-red-400 text-sm italic shadow-inner">
							<ShieldAlert className="h-5 w-5 shrink-0" />
							<div className="space-y-1">
								<p className="font-bold not-italic">Hidden for moderation</p>
								<p className="text-xs opacity-80">
									This content has been flagged by our AI moderation system.
								</p>
							</div>
						</div>
					)
				) : (
					<Markdown
						content={post.content}
						className="text-sm text-slate-700 dark:text-zinc-300"
					/>
				)}
			</CardContent>

			<div className="px-4 py-2 border-t flex items-center justify-between text-xs text-muted-foreground font-medium bg-slate-50/50 dark:bg-zinc-800/30">
				<div className="flex items-center gap-1">
					<div className="flex -space-x-1.5">
						<div className="h-5 w-5 rounded-full bg-blue-600 border-2 border-white dark:border-zinc-900 flex items-center justify-center text-[8px] text-white font-bold">
							<Heart className="h-2.5 w-2.5 fill-current" />
						</div>
					</div>
					<span className="ml-1">Be the first to like this</span>
				</div>
				<div className="flex items-center gap-3">
					<button type="button" className="hover:text-blue-600 hover:underline">
						{post._count?.comments || 0} comments
					</button>
				</div>
			</div>

			<CardFooter className="px-2 py-1 flex items-center justify-between">
				<ActionButton
					icon={Heart}
					label="Like"
					active={liked}
					activeColor="text-red-500 fill-red-500"
					onClick={() => setLiked(!liked)}
				/>
				<Button
					variant="ghost"
					size="sm"
					asChild
					className="flex-1 gap-2 text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 h-10 rounded-lg group"
				>
					<Link href={`/posts/${post.id}`}>
						<MessageSquare className="h-4 w-4 group-hover:scale-110 transition-transform" />
						<span className="text-xs font-bold">Comment</span>
					</Link>
				</Button>
				<ActionButton icon={Share2} label="Share" />
				<ActionButton icon={Send} label="Send" />
			</CardFooter>
		</Card>
	);
}

function ActionButton({
	icon: Icon,
	label,
	active = false,
	activeColor,
	onClick,
}: {
	icon: React.ElementType;
	label: string;
	active?: boolean;
	activeColor?: string;
	onClick?: () => void;
}) {
	return (
		<Button
			variant="ghost"
			size="sm"
			onClick={onClick}
			className={`flex-1 gap-2 h-10 rounded-lg group transition-all ${
				active
					? activeColor
					: "text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800"
			}`}
		>
			<Icon
				className={`h-4 w-4 group-hover:scale-110 transition-transform ${
					active ? "fill-current" : ""
				}`}
			/>
			<span className="text-xs font-bold">{label}</span>
		</Button>
	);
}
