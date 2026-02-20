"use client";

import { formatDistanceToNow } from "date-fns";
import { MessageSquare, ShieldAlert } from "lucide-react";
import * as React from "react";
import { CommentForm } from "@/components/social/comment-form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";
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
	};
	isAllowedToComment: boolean;
	restrictionReason?: string;
}

export function Comment({
	comment,
	isAllowedToComment,
	restrictionReason,
}: CommentProps) {
	const [mounted, setMounted] = React.useState(false);
	const { data: session } = useSession();
	const { replyingToId, setReplyingTo, cancelReply } = useReplyStore();

	const isReplying = replyingToId === comment.id;

	React.useEffect(() => {
		setMounted(true);
	}, []);

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
					session?.user?.role === "ADMIN" ||
					session?.user?.role === "MODERATOR" ? (
						<div className="space-y-2">
							<div className="flex items-center gap-2 p-1.5 rounded bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 text-[10px] font-bold uppercase border border-amber-100 dark:border-amber-900/50">
								<ShieldAlert className="h-3 w-3 shrink-0" />
								Staff View: Toxic Comment
							</div>
							<p className="text-slate-700 dark:text-slate-300 italic opacity-80">
								{comment.content}
							</p>
						</div>
					) : (
						<div className="flex items-center gap-2 p-2 rounded bg-destructive/5 text-destructive text-[11px] italic">
							<ShieldAlert className="h-3 w-3 shrink-0" />
							Content flagged.
						</div>
					)
				) : (
					<p className="text-slate-700 dark:text-slate-300">
						{comment.content}
					</p>
				)}

				<div className="flex items-center gap-4">
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

			{isReplying && session?.user && (
				<div className="pl-9">
					<CommentForm
						postId={comment.postId}
						parentId={comment.id}
						user={{
							name: session.user.name,
							image: session.user.image ?? null,
						}}
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
							isAllowedToComment={isAllowedToComment}
							restrictionReason={restrictionReason}
						/>
					))}
				</div>
			)}
		</div>
	);
}
