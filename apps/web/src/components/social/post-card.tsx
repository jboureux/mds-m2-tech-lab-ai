"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { PostStatus } from "@prisma/client";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, MoreVertical, ShieldAlert } from "lucide-react";
import Link from "next/link";

interface PostCardProps {
	post: {
		id: string;
		title: string;
		content: string;
		status: PostStatus;
		isToxic: boolean;
		createdAt: Date;
		author: {
			name: string | null;
			image: string | null;
			role: string;
		};
		_count?: {
			comments: number;
		};
	};
}

export function PostCard({ post }: PostCardProps) {
	const isFlagged = post.status === "FLAGGED" || post.isToxic;
	const isPending = post.status === "PENDING";

	return (
		<Card className="w-full transition-all hover:border-slate-300 dark:hover:border-slate-700">
			<CardHeader className="flex flex-row items-center space-y-0 gap-4">
				<Avatar>
					<AvatarImage src={post.author.image || ""} alt={post.author.name || ""} />
					<AvatarFallback>{post.author.name?.charAt(0) || "U"}</AvatarFallback>
				</Avatar>
				<div className="flex flex-col flex-1">
					<div className="flex items-center gap-2">
						<span className="font-semibold text-sm">{post.author.name}</span>
						{post.author.role !== "USER" && (
							<Badge variant="secondary" className="text-[10px] h-4 px-1 capitalize">
								{post.author.role.toLowerCase()}
							</Badge>
						)}
					</div>
					<span className="text-xs text-muted-foreground">
						{formatDistanceToNow(post.createdAt, { addSuffix: true })}
					</span>
				</div>
				<Button variant="ghost" size="icon" className="h-8 w-8">
					<MoreVertical className="h-4 w-4" />
				</Button>
			</CardHeader>
			<CardContent className="space-y-2">
				<h3 className="font-bold text-lg leading-tight">{post.title}</h3>
				{isFlagged ? (
					<div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm italic">
						<ShieldAlert className="h-4 w-4 shrink-0" />
						Content flagged for moderation.
					</div>
				) : (
					<p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
						{post.content}
					</p>
				)}
				{isPending && !isFlagged && (
					<Badge variant="outline" className="text-[10px] text-amber-600 border-amber-200 bg-amber-50">
						Awaiting approval
					</Badge>
				)}
			</CardContent>
			<CardFooter className="border-t pt-3 pb-3">
				<Button variant="ghost" size="sm" asChild className="gap-2 text-muted-foreground">
					<Link href={`/posts/${post.id}`}>
						<MessageSquare className="h-4 w-4" />
						<span className="text-xs font-medium">{post._count?.comments || 0} Comments</span>
					</Link>
				</Button>
			</CardFooter>
		</Card>
	);
}
