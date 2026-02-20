"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	Bold,
	Code,
	Italic,
	Loader2,
	Palette,
	SendHorizontal,
} from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";

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
	const textareaRef = React.useRef<HTMLTextAreaElement>(null);
	const queryClient = useQueryClient();
	const router = useRouter();

	const handleFormat = (type: string, value?: string) => {
		if (!textareaRef.current) return;

		const textarea = textareaRef.current;
		const start = textarea.selectionStart;
		const end = textarea.selectionEnd;
		const selectedText = content.substring(start, end);

		let formattedText = "";
		let cursorOffset = 0;

		switch (type) {
			case "bold":
				formattedText = `**${selectedText || "bold text"}**`;
				cursorOffset = selectedText ? 0 : -2;
				break;
			case "italic":
				formattedText = `*${selectedText || "italic text"}*`;
				cursorOffset = selectedText ? 0 : -1;
				break;
			case "code":
				formattedText = `\`${selectedText || "code text"}\``;
				break;
			case "link":
				formattedText = `[${selectedText || "link text"}](https://)`;
				cursorOffset = -1;
				break;
			case "color":
				formattedText = `<span style="color: ${value}">${
					selectedText || "colored text"
				}</span>`;
				break;
			default:
				return;
		}

		const newContent =
			content.substring(0, start) + formattedText + content.substring(end);

		setContent(newContent);

		// Reset focus and selection
		setTimeout(() => {
			textarea.focus();
			if (!selectedText) {
				const newPos = start + formattedText.length + cursorOffset;
				textarea.setSelectionRange(newPos, newPos);
			}
		}, 0);
	};

	const colors = [
		{ name: "Red", value: "#ef4444" },
		{ name: "Blue", value: "#3b82f6" },
		{ name: "Green", value: "#22c55e" },
		{ name: "Amber", value: "#f59e0b" },
		{ name: "Purple", value: "#a855f7" },
	];

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
				<div className="flex items-center justify-between px-1">
					<div className="flex items-center gap-0.5">
						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										type="button"
										variant="ghost"
										size="icon"
										className="h-7 w-7"
										onClick={() => handleFormat("bold")}
									>
										<Bold className="h-3.5 w-3.5" />
									</Button>
								</TooltipTrigger>
								<TooltipContent className="text-[10px]">Bold</TooltipContent>
							</Tooltip>

							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										type="button"
										variant="ghost"
										size="icon"
										className="h-7 w-7"
										onClick={() => handleFormat("italic")}
									>
										<Italic className="h-3.5 w-3.5" />
									</Button>
								</TooltipTrigger>
								<TooltipContent className="text-[10px]">Italic</TooltipContent>
							</Tooltip>

							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										type="button"
										variant="ghost"
										size="icon"
										className="h-7 w-7"
										onClick={() => handleFormat("code")}
									>
										<Code className="h-3.5 w-3.5" />
									</Button>
								</TooltipTrigger>
								<TooltipContent className="text-[10px]">Code</TooltipContent>
							</Tooltip>

							<DropdownMenu>
								<Tooltip>
									<TooltipTrigger asChild>
										<DropdownMenuTrigger asChild>
											<Button
												type="button"
												variant="ghost"
												size="icon"
												className="h-7 w-7"
											>
												<Palette className="h-3.5 w-3.5" />
											</Button>
										</DropdownMenuTrigger>
									</TooltipTrigger>
									<TooltipContent className="text-[10px]">
										Text Color
									</TooltipContent>
								</Tooltip>
								<DropdownMenuContent align="start" className="w-32">
									{colors.map((color) => (
										<DropdownMenuItem
											key={color.name}
											className="flex items-center gap-2 cursor-pointer text-xs"
											onClick={() => handleFormat("color", color.value)}
										>
											<div
												className="h-2.5 w-2.5 rounded-full"
												style={{ backgroundColor: color.value }}
											/>
											<span>{color.name}</span>
										</DropdownMenuItem>
									))}
								</DropdownMenuContent>
							</DropdownMenu>
						</TooltipProvider>
					</div>
					<span className="text-[10px] text-muted-foreground font-medium">
						Markdown supported
					</span>
				</div>
				<form onSubmit={handleSubmit} className="relative group">
					<Textarea
						id="content"
						ref={textareaRef}
						placeholder={
							isAllowedToComment
								? parentId
									? "Write a reply..."
									: "Write a comment..."
								: "Posting comments restricted."
						}
						value={content}
						onChange={(e) => setContent(e.target.value)}
						disabled={!isAllowedToComment || mutation.isPending}
						className="min-h-[80px] resize-none bg-slate-50 dark:bg-zinc-800 border-none focus-visible:ring-2 focus-visible:ring-blue-600/50 text-sm pr-12"
						autoFocus={!!parentId}
					/>
					<div className="absolute bottom-2 right-2 flex gap-2">
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
							size="icon"
							disabled={
								!isAllowedToComment || !content.trim() || mutation.isPending
							}
							className="h-8 w-8 rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
						>
							{mutation.isPending ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : (
								<SendHorizontal className="h-4 w-4" />
							)}
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
