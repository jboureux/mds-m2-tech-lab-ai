"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { SendHorizontal } from "lucide-react";

interface PostEditorProps {
	user: {
		name: string | null;
		image: string | null;
	};
	isAllowedToPost: boolean;
	restrictionReason?: string;
}

export function PostEditor({ user, isAllowedToPost, restrictionReason }: PostEditorProps) {
	const [title, setTitle] = useState("");
	const [content, setContent] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!isAllowedToPost || !title.trim() || !content.trim()) return;

		setIsSubmitting(true);
		// TODO: Implement API call
		console.log("Submitting post:", { title, content });
		
		// Simulate delay
		await new Promise(resolve => setTimeout(resolve, 1000));
		
		setTitle("");
		setContent("");
		setIsSubmitting(false);
	};

	return (
		<Card className="w-full bg-slate-50/50 dark:bg-slate-900/50 border-dashed">
			<CardContent className="pt-6 space-y-4">
				<div className="flex items-center gap-3">
					<Avatar className="h-8 w-8">
						<AvatarImage src={user.image || ""} alt={user.name || ""} />
						<AvatarFallback>{user.name?.charAt(0) || "U"}</AvatarFallback>
					</Avatar>
					<span className="text-sm font-medium">What's on your mind, {user.name}?</span>
				</div>

				<form id="post-form" onSubmit={handleSubmit} className="space-y-3">
					<div className="space-y-1">
						<Label htmlFor="title" className="sr-only">Title</Label>
						<Input 
							id="title"
							placeholder="Post title" 
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							disabled={!isAllowedToPost || isSubmitting}
							className="bg-background"
						/>
					</div>
					<div className="space-y-1">
						<Label htmlFor="content" className="sr-only">Content</Label>
						<Textarea 
							id="content"
							placeholder="Share something with the school..." 
							value={content}
							onChange={(e) => setContent(e.target.value)}
							disabled={!isAllowedToPost || isSubmitting}
							className="min-h-[100px] resize-none bg-background"
						/>
					</div>
				</form>

				{!isAllowedToPost && restrictionReason && (
					<div className="p-3 rounded-md bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-xs text-amber-700 dark:text-amber-400">
						{restrictionReason}
					</div>
				)}
			</CardContent>
			<CardFooter className="flex justify-end pb-6">
				<Button 
					type="submit" 
					form="post-form"
					disabled={!isAllowedToPost || !title.trim() || !content.trim() || isSubmitting}
					className="gap-2"
				>
					{isSubmitting ? "Posting..." : "Post"}
					<SendHorizontal className="h-4 w-4" />
				</Button>
			</CardFooter>
		</Card>
	);
}
