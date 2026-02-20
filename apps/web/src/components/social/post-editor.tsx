"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, SendHorizontal, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { RichEditor } from "@/components/social/rich-editor";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

interface PostEditorProps {
	user: {
		name: string | null;
		image: string | null;
	};
	isAllowedToPost: boolean;
	restrictionReason?: string;
}

export function PostEditor({
	user,
	isAllowedToPost,
	restrictionReason,
}: PostEditorProps) {
	const [content, setContent] = useState("");
	const [isExpanded, setIsExpanded] = useState(false);
	const queryClient = useQueryClient();

	const mutation = useMutation({
		mutationFn: async (newPost: { content: string }) => {
			const response = await fetch("/api/posts", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(newPost),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Failed to create post");
			}

			return response.json();
		},
		onSuccess: () => {
			toast.success("Scoop published successfully!");
			setContent("");
			setIsExpanded(false);
			queryClient.invalidateQueries({ queryKey: ["posts"] });
		},
		onError: (error: Error) => {
			toast.error(error.message);
		},
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!isAllowedToPost || !content.trim()) return;
		mutation.mutate({ content });
	};

	if (!isExpanded) {
		return (
			<Card
				className="w-full bg-white dark:bg-zinc-900 border-none shadow-sm transition-all hover:shadow-md cursor-pointer group"
				onClick={() => setIsExpanded(true)}
			>
				<CardContent className="p-4 flex items-center gap-4">
					<Avatar className="h-12 w-12 border shadow-sm ring-2 ring-blue-600/5">
						<AvatarImage src={user.image || ""} alt={user.name || ""} />
						<AvatarFallback>{user.name?.charAt(0) || "U"}</AvatarFallback>
					</Avatar>
					<div className="flex-1 bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 border hover:bg-slate-100 dark:hover:bg-zinc-700/80 rounded-full h-12 flex items-center px-6 transition-all">
						<span className="text-slate-500 dark:text-zinc-400 font-medium text-sm">
							Start a scoop, {user.name?.split(" ")[0]}...
						</span>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="w-full bg-white dark:bg-zinc-900 border-none shadow-lg animate-in fade-in zoom-in duration-200 text-slate-900 dark:text-zinc-100">
			<CardContent className="pt-6 space-y-4">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<Avatar className="h-10 w-10 border shadow-sm ring-2 ring-blue-600/5">
							<AvatarImage src={user.image || ""} alt={user.name || ""} />
							<AvatarFallback>{user.name?.charAt(0) || "U"}</AvatarFallback>
						</Avatar>
						<div className="flex flex-col">
							<span className="text-sm font-bold leading-tight">
								{user.name}
							</span>
							<span className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">
								Public Post
							</span>
						</div>
					</div>
					<Button
						variant="ghost"
						size="icon"
						className="h-8 w-8 rounded-full"
						onClick={() => setIsExpanded(false)}
					>
						<X className="h-4 w-4" />
					</Button>
				</div>

				<form id="post-form" onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label
							htmlFor="content"
							className="text-xs font-bold text-muted-foreground uppercase px-1"
						>
							Share something
						</Label>

						<RichEditor
							content={content}
							onChange={setContent}
							disabled={!isAllowedToPost || mutation.isPending}
						/>
					</div>
				</form>

				{!isAllowedToPost && restrictionReason && (
					<div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 flex items-start gap-3">
						<span className="text-xl">⚠️</span>
						<p className="text-xs text-amber-800 dark:text-amber-400 font-medium leading-relaxed">
							{restrictionReason}
						</p>
					</div>
				)}
			</CardContent>
			<CardFooter className="flex justify-end items-center p-6 pt-2 border-t mt-4">
				<Button
					type="submit"
					form="post-form"
					disabled={!isAllowedToPost || !content.trim() || mutation.isPending}
					className="gap-2 px-8 h-10 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md hover:shadow-lg transition-all"
				>
					{mutation.isPending ? (
						<Loader2 className="h-4 w-4 animate-spin" />
					) : (
						"Post Scoop"
					)}
					{!mutation.isPending && <SendHorizontal className="h-4 w-4" />}
				</Button>
			</CardFooter>
		</Card>
	);
}
