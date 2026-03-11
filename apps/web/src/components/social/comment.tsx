"use client";

import { formatDistanceToNow } from "date-fns";
import { Heart, MessageSquare, ShieldAlert } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { CommentForm } from "@/components/social/comment-form";
import { Markdown } from "@/components/social/markdown";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useReplyStore } from "@/store/reply-store";

interface CommentProps {
	comment: {
		id: string;
		content: string;
		isToxic: boolean;
		postId: string;
		createdAt: Date;
		author: {
			name: string | null;
			image: string | null;
			role: string;
		};
		replies?: CommentProps["comment"][];
		_count?: {
			likes: number;
		};
		likes?: { type: string }[] | boolean;
	};
	currentUser?: {
		name: string;
		image?: string | null;
	};
	isAllowedToComment: boolean;
	restrictionReason?: string;
	isStaff?: boolean;
}

export function Comment({
	comment,
	currentUser,
	isAllowedToComment,
	restrictionReason,
	isStaff = false,
}: CommentProps) {
	const [mounted, setMounted] = React.useState(false);
	const { replyingToId, setReplyingTo, cancelReply } = useReplyStore();

	const isReplying = replyingToId === comment.id;

	const initialLiked = Array.isArray(comment.likes) && comment.likes.length > 0;
	const [liked, setLiked] = React.useState(initialLiked);
	const [likesCount, setLikesCount] = React.useState(
		comment._count?.likes || 0,
	);
	const [isLiking, setIsLiking] = React.useState(false);

	React.useEffect(() => {
		setMounted(true);
		setLiked(initialLiked);
		setLikesCount(comment._count?.likes || 0);
	}, [initialLiked, comment._count?.likes]);

	const handleLike = async (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();

		if (isLiking) return;
		setIsLiking(true);

		const previousLiked = liked;
		const previousCount = likesCount;

		const newLiked = !liked;
		const newCount = newLiked ? likesCount + 1 : likesCount - 1;

		setLiked(newLiked);
		setLikesCount(Math.max(0, newCount));

		try {
			const res = await fetch(`/api/comments/${comment.id}/like`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
			});

			if (!res.ok) {
				const error = await res.json();
				throw new Error(error.error || "Failed to update like");
			}

			const data = await res.json();
			setLiked(data.liked);
		} catch (err: any) {
			setLiked(previousLiked);
			setLikesCount(previousCount);
			toast.error(err.message || "Failed to update like");
		} finally {
			setIsLiking(false);
		}
	};

	return (
		<div className="flex flex-col gap-3 pl-4 border-l border-slate-200 dark:border-slate-800 ml-4 py-2">
			<div className="flex items-center gap-3">
				<Avatar className="h-6 w-6">
					<AvatarImage
						src={comment.author.image || ""}
						alt={comment.author.name || ""}
					/>
					<AvatarFallback className="text-[10px]">
						{comment.author.name?.charAt(0) || "U"}
					</AvatarFallback>
				</Avatar>
				<div className="flex flex-col">
					<div className="flex items-center gap-2">
						<span className="font-semibold text-xs">{comment.author.name}</span>
						{comment.author.role !== "USER" && (
							<Badge
								variant="secondary"
								className="text-[8px] h-3 px-1 leading-none"
							>
								{comment.author.role.toLowerCase()}
							</Badge>
						)}
					</div>
					<span className="text-[10px] text-muted-foreground">
						{mounted
							? formatDistanceToNow(new Date(comment.createdAt), {
									addSuffix: true,
								})
							: "Just now"}
					</span>
				</div>
			</div>

			<div className="text-sm pl-9 space-y-2">
				{comment.isToxic ? (
					isStaff ? (
						<div className="space-y-2">
							<div className="flex items-center gap-2 p-1.5 rounded bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 text-[10px] font-bold uppercase border border-amber-100 dark:border-amber-900/50">
								<ShieldAlert className="h-3 w-3 shrink-0" />
								Staff View: Toxic Comment
							</div>
							<Markdown
								content={comment.content}
								className="text-slate-700 dark:text-slate-300 italic opacity-80"
							/>
						</div>
					) : (
						<div className="flex items-center gap-2 p-2 rounded bg-destructive/5 text-destructive text-[11px] italic">
							<ShieldAlert className="h-3 w-3 shrink-0" />
							Content flagged.
						</div>
					)
				) : (
					<Markdown
						content={comment.content}
						className="text-slate-700 dark:text-slate-300"
					/>
				)}

				<div className="flex items-center gap-4">
					<Button
						variant="ghost"
						size="sm"
						className={`h-7 px-2 text-[10px] gap-1.5 transition-colors ${
							liked
								? "text-blue-600 font-bold bg-blue-50 dark:bg-blue-900/20"
								: "text-muted-foreground hover:text-blue-600"
						}`}
						onClick={handleLike}
					>
						<Heart
							className={`h-3 w-3 transition-transform group-hover:scale-110 ${
								liked ? "fill-current" : ""
							}`}
						/>
						{likesCount > 0 ? likesCount : "Like"}
					</Button>
					<Button
						variant="ghost"
						size="sm"
						className="h-7 px-2 text-[10px] text-muted-foreground hover:text-blue-600 gap-1.5"
						onClick={() => setReplyingTo(isReplying ? null : comment.id)}
					>
						<MessageSquare className="h-3 w-3" />
						Reply
					</Button>
				</div>
			</div>

			{isReplying && currentUser && (
				<div className="pl-9">
					<CommentForm
						postId={comment.postId}
						parentId={comment.id}
						user={currentUser}
						isAllowedToComment={isAllowedToComment}
						restrictionReason={restrictionReason}
						onCancel={cancelReply}
						onSuccess={cancelReply}
					/>
				</div>
			)}

			{comment.replies && comment.replies.length > 0 && (
				<div className="mt-2 space-y-2">
					{comment.replies.map((reply) => (
						<Comment
							key={reply.id}
							comment={reply}
							currentUser={currentUser}
							isAllowedToComment={isAllowedToComment}
							restrictionReason={restrictionReason}
							isStaff={isStaff}
						/>
					))}
				</div>
			)}
		</div>
	);
}
