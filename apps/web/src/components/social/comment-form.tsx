"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, SendHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";
import { RichEditor } from "@/components/social/rich-editor";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface CommentFormProps {
	postId: string;
	parentId?: string;
	user: {
		name: string | null;
		image: string | null;
	};
	isAllowedToComment: boolean;
	restrictionReason?: string;
	onCancel?: () => void;
	onSuccess?: () => void;
}

export function CommentForm({
	postId,
	parentId,
	user,
	isAllowedToComment,
	restrictionReason,
	onCancel,
	onSuccess,
}: CommentFormProps) {
	const [content, setContent] = React.useState("");
	const queryClient = useQueryClient();
	const router = useRouter();

	const mutation = useMutation({
		mutationFn: async (newComment: { content: string; parentId?: string }) => {
			const response = await fetch(`/api/posts/${postId}/comments`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(newComment),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Failed to post comment");
			}

			return response.json();
		},
		onSuccess: () => {
			toast.success(parentId ? "Reply posted!" : "Comment posted!");
			setContent("");
			router.refresh();
			queryClient.invalidateQueries({ queryKey: ["posts"] });
			onSuccess?.();
		},
		onError: (error: Error) => {
			toast.error(error.message);
		},
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!isAllowedToComment || !content.trim()) return;
		mutation.mutate({ content, parentId });
	};

	return (
		<div className="flex gap-3 py-4">
			<Avatar className="h-8 w-8 shrink-0">
				<AvatarImage src={user.image || ""} alt={user.name || ""} />
				<AvatarFallback>{user.name?.charAt(0) || "U"}</AvatarFallback>
			</Avatar>
			<div className="flex-1 space-y-3">
				<form onSubmit={handleSubmit} className="relative group">
					<RichEditor
						content={content}
						onChange={setContent}
						placeholder={
							isAllowedToComment
								? parentId
									? "Write a reply..."
									: "Write a comment..."
								: "Posting comments restricted."
						}
						disabled={!isAllowedToComment || mutation.isPending}
					/>

					<div className="flex justify-end mt-2 gap-2">
						{onCancel && (
							<Button
								type="button"
								variant="ghost"
								size="sm"
								onClick={onCancel}
								disabled={mutation.isPending}
								className="h-8 px-3 text-xs"
							>
								Cancel
							</Button>
						)}
						<Button
							type="submit"
							disabled={
								!isAllowedToComment || !content.trim() || mutation.isPending
							}
							className="h-8 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm text-xs font-bold gap-2"
						>
							{mutation.isPending ? (
								<Loader2 className="h-3 w-3 animate-spin" />
							) : (
								<SendHorizontal className="h-3 w-3" />
							)}
							{parentId ? "Reply" : "Comment"}
						</Button>
					</div>
				</form>

				{!isAllowedToComment && restrictionReason && (
					<p className="text-[10px] text-amber-600 dark:text-amber-400 font-medium px-1">
						⚠️ {restrictionReason}
					</p>
				)}
			</div>
		</div>
	);
}
