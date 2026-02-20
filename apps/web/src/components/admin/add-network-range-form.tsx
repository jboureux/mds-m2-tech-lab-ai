"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	AlertCircle,
	ArrowRight,
	CheckCircle2,
	Globe,
	Info,
	Loader2Icon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useModalStore } from "@/store/modal-store";

/**
 * Form for adding a new allowed CIDR range.
 */
export function AddNetworkRangeForm() {
	const { onClose } = useModalStore();

	const [cidr, setCidr] = useState("");
	const [description, setDescription] = useState("");

	const queryClient = useQueryClient();
	const router = useRouter();

	const mutation = useMutation({
		mutationFn: async (data: { cidr: string; description: string }) => {
			const response = await fetch("/api/admin/network", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Failed to add CIDR range");
			}

			return response.json();
		},
		onSuccess: (data) => {
			toast.success(data.message || "Network range successfully added", {
				icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
			});
			setCidr("");
			setDescription("");
			queryClient.invalidateQueries({ queryKey: ["network-ranges"] });
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
		mutation.mutate({ cidr, description });
	};

	return (
		<form onSubmit={handleSubmit} className="flex flex-col">
			<div className="p-8 space-y-6">
				<div className="space-y-5">
					{/* CIDR Field */}
					<div className="space-y-2">
						<Label
							htmlFor="cidr"
							className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/70"
						>
							CIDR Range
						</Label>
						<div className="relative group">
							<Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
							<Input
								id="cidr"
								type="text"
								placeholder="e.g. 192.168.1.0/24"
								value={cidr}
								onChange={(e) => setCidr(e.target.value)}
								required
								disabled={mutation.isPending}
								className="pl-10 h-12 bg-muted/30 border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-all rounded-xl font-mono text-sm"
							/>
						</div>
						<p className="text-[10px] text-muted-foreground/60 px-1 italic">
							Use standard CIDR notation or a single IP address.
						</p>
					</div>

					{/* Description Field */}
					<div className="space-y-2">
						<Label
							htmlFor="description"
							className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/70"
						>
							Location / Description
						</Label>
						<div className="relative group">
							<Info className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
							<Textarea
								id="description"
								placeholder="e.g. Library Wi-Fi, Computer Lab 4"
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								disabled={mutation.isPending}
								className="pl-10 min-h-[100px] bg-muted/30 border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-all rounded-xl resize-none py-3"
							/>
						</div>
					</div>
				</div>

				{/* Warning box */}
				<div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-4">
					<p className="text-[11px] text-amber-700 dark:text-amber-400 leading-relaxed font-semibold">
						Adding a range will grant on-campus posting privileges to any user
						connecting from these IP addresses.
					</p>
				</div>
			</div>

			<div className="flex justify-end gap-3 p-6 border-t bg-muted/20">
				<Button
					type="button"
					variant="ghost"
					onClick={onClose}
					disabled={mutation.isPending}
					className="font-bold text-xs text-muted-foreground hover:bg-transparent"
				>
					Cancel
				</Button>
				<Button
					type="submit"
					disabled={!cidr || mutation.isPending}
					className="min-w-[140px] bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 font-bold rounded-xl active:scale-95 transition-all gap-2"
				>
					{mutation.isPending ? (
						<>
							<Loader2Icon className="h-4 w-4 animate-spin" />
							Adding...
						</>
					) : (
						<>
							Authorize Range
							<ArrowRight className="h-3.5 w-3.5" />
						</>
					)}
				</Button>
			</div>
		</form>
	);
}
