"use client";

import {
	Check,
	ExternalLink,
	EyeOff,
	Gavel,
	Loader2,
	MoreHorizontal,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Author {
	id: string;
	name: string | null;
	email: string;
	image: string | null;
}

interface Post {
	id: string;
	content: string;
	author: Author;
}

export function ModerationActions({ post }: { post: Post }) {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [isBanDialogOpen, setIsBanDialogOpen] = useState(false);
	const [banReason, setBanReason] = useState("");
	const [banDuration, setBanDuration] = useState("7"); // Default 7 days

	const handleApprove = async () => {
		setIsLoading(true);
		try {
			const res = await fetch(
				`/api/admin/moderation/posts/${post.id}/approve`,
				{
					method: "POST",
				},
			);
			if (!res.ok) throw new Error("Failed to approve post");
			toast.success("Post approved successfully");
			router.refresh();
		} catch (_error) {
			toast.error("Failed to approve post");
		} finally {
			setIsLoading(false);
		}
	};

	const handleHide = async () => {
		setIsLoading(true);
		try {
			const res = await fetch(`/api/admin/moderation/posts/${post.id}/hide`, {
				method: "POST",
			});
			if (!res.ok) throw new Error("Failed to hide post");
			toast.success("Post removed successfully");
			router.refresh();
		} catch (_error) {
			toast.error("Failed to remove post");
		} finally {
			setIsLoading(false);
		}
	};

	const handleBanUser = async () => {
		setIsLoading(true);
		try {
			const res = await fetch(
				`/api/admin/moderation/users/${post.author.id}/ban`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						reason: banReason || "Violation of community guidelines",
						durationInDays: parseInt(banDuration, 10),
					}),
				},
			);
			if (!res.ok) throw new Error("Failed to ban user");
			toast.success(
				`User ${post.author.name || post.author.email} banned successfully`,
			);
			setIsBanDialogOpen(false);
			// Also hide the post as it's likely bad
			await handleHide();
		} catch (_error) {
			toast.error("Failed to ban user");
			setIsLoading(false);
		}
	};

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" size="icon" disabled={isLoading}>
						{isLoading ? (
							<Loader2 className="h-4 w-4 animate-spin" />
						) : (
							<MoreHorizontal className="h-4 w-4" />
						)}
						<span className="sr-only">Open menu</span>
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DropdownMenuItem asChild className="cursor-pointer">
						<Link href={`/posts/${post.id}`} target="_blank">
							<ExternalLink className="mr-2 h-4 w-4 text-blue-500" />
							View Full Post
						</Link>
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem
						onClick={handleApprove}
						className="text-emerald-600 focus:text-emerald-700"
					>
						<Check className="mr-2 h-4 w-4" />
						Approve Post
					</DropdownMenuItem>
					<DropdownMenuItem
						onClick={handleHide}
						className="text-amber-600 focus:text-amber-700"
					>
						<EyeOff className="mr-2 h-4 w-4" />
						Hide Post
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem
						onClick={() => setIsBanDialogOpen(true)}
						className="text-destructive focus:text-destructive"
					>
						<Gavel className="mr-2 h-4 w-4" />
						Ban User
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			<Dialog open={isBanDialogOpen} onOpenChange={setIsBanDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Ban User</DialogTitle>
						<DialogDescription>
							This will ban{" "}
							<strong>{post.author.name || post.author.email}</strong> and
							remove their post.
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="grid gap-2">
							<Label htmlFor="reason">Reason</Label>
							<Input
								id="reason"
								value={banReason}
								onChange={(e) => setBanReason(e.target.value)}
								placeholder="e.g. Hate speech, Spam"
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="duration">Duration (days)</Label>
							<Input
								id="duration"
								type="number"
								value={banDuration}
								onChange={(e) => setBanDuration(e.target.value)}
								min="1"
							/>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setIsBanDialogOpen(false)}>
							Cancel
						</Button>
						<Button
							variant="destructive"
							onClick={handleBanUser}
							disabled={isLoading}
						>
							{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							Ban User
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
