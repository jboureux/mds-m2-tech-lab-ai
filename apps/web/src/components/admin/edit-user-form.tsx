"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	AlertCircle,
	CheckCircle2,
	FileText,
	Loader2,
	Save,
	User as UserIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useModalStore } from "@/store/modal-store";

interface EditUserFormProps {
	user: {
		id: string;
		name: string | null;
		username: string | null;
		bio: string | null;
		email: string;
	};
}

/**
 * Form for administrators to edit any user's profile.
 */
export function EditUserForm({ user }: EditUserFormProps) {
	const { onClose } = useModalStore();
	const router = useRouter();
	const queryClient = useQueryClient();

	const [name, setName] = useState(user.name || "");
	const [username, setUsername] = useState(user.username || "");
	const [bio, setBio] = useState(user.bio || "");

	const mutation = useMutation({
		mutationFn: async (userData: {
			id: string;
			name: string;
			username: string;
			bio: string;
		}) => {
			const response = await fetch("/api/user/profile", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(userData),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Failed to update user");
			}

			return response.json();
		},
		onSuccess: (data) => {
			toast.success(data.message || "User updated successfully", {
				icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
			});
			queryClient.invalidateQueries({ queryKey: ["users"] });
			router.refresh();
			onClose();
		},
		onError: (error: Error) => {
			toast.error(error.message, {
				icon: <AlertCircle className="h-4 w-4 text-destructive" />,
			});
		},
	});

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		mutation.mutate({ id: user.id, name, username, bio });
	};

	return (
		<form onSubmit={handleSubmit} className="flex flex-col">
			<div className="p-8 space-y-6">
				<div className="space-y-5">
					<div className="space-y-2">
						<Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/70">
							Email (Read-only)
						</Label>
						<Input
							value={user.email}
							disabled
							className="h-12 bg-muted/30 border-border/50 rounded-xl font-medium opacity-70"
						/>
					</div>

					<div className="space-y-2">
						<Label
							htmlFor="edit-name"
							className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/70"
						>
							Name
						</Label>
						<div className="relative group">
							<UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
							<Input
								id="edit-name"
								value={name}
								onChange={(e) => setName(e.target.value)}
								required
								className="pl-10 h-12 bg-muted/30 border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-all rounded-xl font-medium"
							/>
						</div>
					</div>

					<div className="space-y-2">
						<Label
							htmlFor="edit-username"
							className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/70"
						>
							Username
						</Label>
						<div className="relative group">
							<span className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground font-bold flex items-center justify-center">
								@
							</span>
							<Input
								id="edit-username"
								value={username}
								onChange={(e) => setUsername(e.target.value)}
								required
								className="pl-10 h-12 bg-muted/30 border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-all rounded-xl font-medium"
							/>
						</div>
					</div>

					<div className="space-y-2">
						<Label
							htmlFor="edit-bio"
							className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/70"
						>
							Biography
						</Label>
						<div className="relative group">
							<FileText className="absolute left-3 top-4 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
							<Textarea
								id="edit-bio"
								value={bio}
								onChange={(e) => setBio(e.target.value)}
								className="pl-10 min-h-[100px] bg-muted/30 border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-all rounded-xl font-medium resize-none"
							/>
						</div>
					</div>
				</div>
			</div>

			<div className="flex justify-end gap-3 p-6 border-t bg-muted/20">
				<Button
					type="button"
					variant="ghost"
					onClick={onClose}
					className="font-bold text-xs text-muted-foreground hover:bg-transparent"
				>
					Discard
				</Button>
				<Button
					type="submit"
					disabled={mutation.isPending}
					className="min-w-[140px] bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 font-bold rounded-xl active:scale-95 transition-all gap-2"
				>
					{mutation.isPending ? (
						<>
							<Loader2 className="h-4 w-4 animate-spin" />
							Saving...
						</>
					) : (
						<>
							Save Changes
							<Save className="h-3.5 w-3.5" />
						</>
					)}
				</Button>
			</div>
		</form>
	);
}
