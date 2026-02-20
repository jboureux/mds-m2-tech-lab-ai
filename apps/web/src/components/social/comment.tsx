"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { ShieldAlert } from "lucide-react";

interface CommentProps {
	comment: {
		id: string;
		content: string;
		isToxic: boolean;
		createdAt: Date;
		author: {
			name: string | null;
			image: string | null;
			role: string;
		};
		replies?: CommentProps["comment"][];
	};
}

export function Comment({ comment }: CommentProps) {
	return (
		<div className="flex flex-col gap-3 pl-4 border-l border-slate-200 dark:border-slate-800 ml-4 py-2">
			<div className="flex items-center gap-3">
				<Avatar className="h-6 w-6">
					<AvatarImage src={comment.author.image || ""} alt={comment.author.name || ""} />
					<AvatarFallback className="text-[10px]">{comment.author.name?.charAt(0) || "U"}</AvatarFallback>
				</Avatar>
				<div className="flex flex-col">
					<div className="flex items-center gap-2">
						<span className="font-semibold text-xs">{comment.author.name}</span>
						{comment.author.role !== "USER" && (
							<Badge variant="secondary" className="text-[8px] h-3 px-1 leading-none">
								{comment.author.role.toLowerCase()}
							</Badge>
						)}
					</div>
					<span className="text-[10px] text-muted-foreground">
						{formatDistanceToNow(comment.createdAt, { addSuffix: true })}
					</span>
				</div>
			</div>
			
			<div className="text-sm pl-9">
				{comment.isToxic ? (
					<div className="flex items-center gap-2 p-2 rounded bg-destructive/5 text-destructive text-[11px] italic">
						<ShieldAlert className="h-3 w-3 shrink-0" />
						Content flagged.
					</div>
				) : (
					<p className="text-slate-700 dark:text-slate-300">{comment.content}</p>
				)}
			</div>

			{comment.replies && comment.replies.length > 0 && (
				<div className="mt-2 space-y-2">
					{comment.replies.map((reply) => (
						<Comment key={reply.id} comment={reply} />
					))}
				</div>
			)}
		</div>
	);
}
