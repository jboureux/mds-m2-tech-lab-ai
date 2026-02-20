"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	Bold,
	Code,
	Eye,
	EyeOff,
	Italic,
	Link as LinkIcon,
	Loader2,
	Palette,
	SendHorizontal,
	X,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Markdown } from "@/components/social/markdown";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";

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
	const [isPreview, setIsPreview] = useState(false);
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const queryClient = useQueryClient();

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
				if (selectedText.includes("\n")) {
					formattedText = `\n\`\`\`javascript\n${selectedText || "code"}\n\`\`\`\n`;
				} else {
					formattedText = `\`${selectedText || "code"}\``;
				}
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
		{ name: "Pink", value: "#ec4899" },
	];

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
			// Also refresh the page if we're using server components for the feed
			// window.location.reload(); // Or use router.refresh() if needed
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
		<Card className="w-full bg-white dark:bg-zinc-900 border-none shadow-lg animate-in fade-in zoom-in duration-200">
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
						<div className="flex items-center justify-between px-1">
							<Label
								htmlFor="content"
								className="text-xs font-bold text-muted-foreground uppercase"
							>
								Share something
							</Label>
							<div className="flex items-center gap-3">
								<span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
									Markdown supported
								</span>
								<Button
									type="button"
									variant="ghost"
									size="sm"
									className="h-6 px-2 text-[10px] gap-1 font-bold"
									onClick={() => setIsPreview(!isPreview)}
								>
									{isPreview ? (
										<>
											<EyeOff className="h-3 w-3" /> Edit
										</>
									) : (
										<>
											<Eye className="h-3 w-3" /> Preview
										</>
									)}
								</Button>
							</div>
						</div>
						{isPreview ? (
							<div className="min-h-[150px] p-3 rounded-md bg-slate-50 dark:bg-zinc-800 border-none prose dark:prose-invert max-w-none">
								<Markdown
									content={content || "*Nothing to preview yet...*"}
									className="text-base"
								/>
							</div>
						) : (
							<>
								<div className="flex items-center gap-1 bg-slate-100/50 dark:bg-zinc-800/50 p-1 rounded-lg border dark:border-zinc-800">
									<TooltipProvider>
										<Tooltip>
											<TooltipTrigger asChild>
												<Button
													type="button"
													variant="ghost"
													size="icon"
													className="h-8 w-8"
													onClick={() => handleFormat("bold")}
													disabled={isPreview}
												>
													<Bold className="h-4 w-4" />
												</Button>
											</TooltipTrigger>
											<TooltipContent>Bold (**) </TooltipContent>
										</Tooltip>

										<Tooltip>
											<TooltipTrigger asChild>
												<Button
													type="button"
													variant="ghost"
													size="icon"
													className="h-8 w-8"
													onClick={() => handleFormat("italic")}
													disabled={isPreview}
												>
													<Italic className="h-4 w-4" />
												</Button>
											</TooltipTrigger>
											<TooltipContent>Italic (*)</TooltipContent>
										</Tooltip>

										<Tooltip>
											<TooltipTrigger asChild>
												<Button
													type="button"
													variant="ghost"
													size="icon"
													className="h-8 w-8"
													onClick={() => handleFormat("code")}
													disabled={isPreview}
												>
													<Code className="h-4 w-4" />
												</Button>
											</TooltipTrigger>
											<TooltipContent>Code Block</TooltipContent>
										</Tooltip>

										<Tooltip>
											<TooltipTrigger asChild>
												<Button
													type="button"
													variant="ghost"
													size="icon"
													className="h-8 w-8"
													onClick={() => handleFormat("link")}
													disabled={isPreview}
												>
													<LinkIcon className="h-4 w-4" />
												</Button>
											</TooltipTrigger>
											<TooltipContent>Link</TooltipContent>
										</Tooltip>

										<DropdownMenu>
											<Tooltip>
												<TooltipTrigger asChild>
													<DropdownMenuTrigger asChild>
														<Button
															type="button"
															variant="ghost"
															size="icon"
															className="h-8 w-8"
															disabled={isPreview}
														>
															<Palette className="h-4 w-4" />
														</Button>
													</DropdownMenuTrigger>
												</TooltipTrigger>
												<TooltipContent>Text Color</TooltipContent>
											</Tooltip>
											<DropdownMenuContent align="start" className="w-40">
												{colors.map((color) => (
													<DropdownMenuItem
														key={color.name}
														className="flex items-center gap-2 cursor-pointer"
														onClick={() => handleFormat("color", color.value)}
													>
														<div
															className="h-3 w-3 rounded-full"
															style={{ backgroundColor: color.value }}
														/>
														<span>{color.name}</span>
													</DropdownMenuItem>
												))}
											</DropdownMenuContent>
										</DropdownMenu>
									</TooltipProvider>
								</div>

								<Textarea
									id="content"
									ref={textareaRef}
									placeholder="What's happening in school?"
									value={content}
									onChange={(e) => setContent(e.target.value)}
									disabled={!isAllowedToPost || mutation.isPending}
									className="min-h-[150px] resize-none bg-slate-50 dark:bg-zinc-800 border-none focus-visible:ring-2 focus-visible:ring-blue-600/50 text-base"
									autoFocus
								/>
							</>
						)}
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
