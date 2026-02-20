"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	AlertCircle,
	ArrowRight,
	CheckCircle2,
	FileIcon,
	FileText,
	Loader2Icon,
	X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { type ChangeEvent, type FormEvent, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useModalStore } from "@/store/modal-store";

/**
 * Form component for bulk user import via CSV.
 * Used as the body of the global dynamic Dialog.
 */
export function ImportUsersForm() {
	const { onClose } = useModalStore();

	const [file, setFile] = useState<File | null>(null);
	const [isDragging, setIsDragging] = useState(false);
	const queryClient = useQueryClient();
	const router = useRouter();

	const mutation = useMutation({
		mutationFn: async (fileToUpload: File) => {
			const formData = new FormData();
			formData.append("file", fileToUpload);

			const response = await fetch("/api/admin/users/import", {
				method: "POST",
				body: formData,
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Batch import operation failed");
			}

			return response.json();
		},
		onSuccess: (data) => {
			toast.success(data.message || "Identity pool updated successfully", {
				icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
			});
			setFile(null);
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

	const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
		const selectedFile = e.target.files?.[0];
		if (selectedFile) {
			if (selectedFile.name.endsWith(".csv")) {
				setFile(selectedFile);
			} else {
				toast.error("Format Rejection: Only .csv files are authorized.");
				e.target.value = "";
			}
		}
	};

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		if (!file) return;
		mutation.mutate(file);
	};

	return (
		<form onSubmit={handleSubmit} className="flex flex-col">
			<div className="p-8 space-y-6">
				<div className="space-y-4">
					<Label
						htmlFor="csv-file"
						className="text-xs font-black uppercase tracking-widest text-muted-foreground/70"
					>
						CSV Source File
					</Label>

					{!file ? (
						// biome-ignore lint/a11y/noStaticElementInteractions: Dropzone pattern requires events on a div
						<div
							className={cn(
								"relative group cursor-pointer border-2 border-dashed rounded-2xl p-10 transition-all duration-300 flex flex-col items-center justify-center gap-4",
								isDragging
									? "border-primary bg-primary/5 scale-[0.99]"
									: "border-border hover:border-muted-foreground/50 bg-muted/30",
							)}
							onDragOver={(e) => {
								e.preventDefault();
								setIsDragging(true);
							}}
							onDragLeave={() => setIsDragging(false)}
							onDrop={(e) => {
								e.preventDefault();
								setIsDragging(false);
								const droppedFile = e.dataTransfer.files[0];
								if (droppedFile?.name.endsWith(".csv")) setFile(droppedFile);
							}}
						>
							<Input
								id="csv-file"
								type="file"
								accept=".csv"
								onChange={handleFileChange}
								disabled={mutation.isPending}
								className="absolute inset-0 opacity-0 cursor-pointer z-10"
							/>
							<div className="h-14 w-14 rounded-2xl bg-background shadow-sm border flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
								<FileText className="h-7 w-7 text-muted-foreground group-hover:text-primary transition-colors" />
							</div>
							<div className="text-center">
								<p className="text-sm font-bold">
									Click to upload or drag & drop
								</p>
								<p className="text-[11px] text-muted-foreground font-medium mt-1">
									Authorized identities in .csv format only
								</p>
							</div>
						</div>
					) : (
						<div className="flex items-center gap-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 animate-in zoom-in-95 duration-300 relative group">
							<div className="h-12 w-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
								<FileIcon className="h-6 w-6" />
							</div>
							<div className="flex flex-col min-w-0 flex-1">
								<span className="text-sm font-bold truncate">{file.name}</span>
								<span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider mt-0.5">
									{(file.size / 1024).toFixed(1)} KB • Ready for processing
								</span>
							</div>
							<button
								type="button"
								onClick={() => setFile(null)}
								className="h-8 w-8 rounded-full flex items-center justify-center bg-background shadow-sm border opacity-0 group-hover:opacity-100 transition-opacity"
							>
								<X className="h-4 w-4 text-muted-foreground" />
							</button>
						</div>
					)}
				</div>

				<div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-4 space-y-2">
					<div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
						<CheckCircle2 className="h-3.5 w-3.5" />
						<span className="text-[10px] font-black uppercase tracking-[0.1em]">
							Required Schema
						</span>
					</div>
					<p className="text-[11px] text-amber-700 dark:text-amber-400/70 leading-relaxed font-medium">
						The CSV header must strictly match: <br />
						<code className="bg-amber-500/20 px-1.5 py-0.5 rounded font-bold">
							FirstName, LastName, Email, Role
						</code>
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
					Discard
				</Button>
				<Button
					type="submit"
					disabled={!file || mutation.isPending}
					className="min-w-[140px] bg-primary text-primary-foreground hover:bg-primary/90 shadow-md font-bold rounded-xl active:scale-95 transition-all gap-2"
				>
					{mutation.isPending ? (
						<>
							<Loader2Icon className="h-4 w-4 animate-spin" />
							Validating...
						</>
					) : (
						<>
							Start Authorization
							<ArrowRight className="h-3.5 w-3.5" />
						</>
					)}
				</Button>
			</div>
		</form>
	);
}
