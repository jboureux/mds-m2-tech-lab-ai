"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	AlertCircle,
	ArrowRight,
	CheckCircle2,
	FileIcon,
	FileText,
	Loader2Icon,
	UploadIcon,
	X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { type ChangeEvent, type FormEvent, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useModal } from "@/hooks/use-modal";
import { cn } from "@/lib/utils";

/**
 * Enhanced Dialog component for bulk user import via CSV.
 */
export function ImportUsersDialog() {
	const [file, setFile] = useState<File | null>(null);
	const [isDragging, setIsDragging] = useState(false);
	const queryClient = useQueryClient();
	const router = useRouter();

	const { Modal, openModal, closeModal } = useModal({
		title: "Identity Authorization Utility",
		description:
			"Pre-register members by importing a structured CSV file. This will grant immediate access permissions based on assigned roles.",
		className: "sm:max-w-[500px] border-none shadow-2xl p-0 overflow-hidden",
	});

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
			closeModal();
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
		<>
			<Button
				onClick={openModal}
				className="gap-2 bg-[#0F172A] text-[#FACC15] hover:bg-[#1E293B] border-none shadow-lg active:scale-95 transition-all font-bold px-6"
			>
				<UploadIcon className="h-4 w-4" />
				Batch Import
			</Button>

			<Modal>
				<form onSubmit={handleSubmit} className="flex flex-col">
					<div className="p-8 space-y-6">
						<div className="space-y-4">
							<Label
								htmlFor="csv-file"
								className="text-xs font-black uppercase tracking-widest text-zinc-400"
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
											: "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-900/50",
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
										if (droppedFile?.name.endsWith(".csv"))
											setFile(droppedFile);
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
									<div className="h-14 w-14 rounded-2xl bg-white dark:bg-zinc-800 shadow-sm border border-zinc-100 dark:border-zinc-700 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
										<FileText className="h-7 w-7 text-zinc-400 group-hover:text-primary transition-colors" />
									</div>
									<div className="text-center">
										<p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
											Click to upload or drag & drop
										</p>
										<p className="text-[11px] text-zinc-500 font-medium mt-1">
											Authorized identities in .csv format only
										</p>
									</div>
								</div>
							) : (
								<div className="flex items-center gap-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/30 dark:bg-emerald-950/10 p-5 animate-in zoom-in-95 duration-300 relative group">
									<div className="h-12 w-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
										<FileIcon className="h-6 w-6" />
									</div>
									<div className="flex flex-col min-w-0 flex-1">
										<span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">
											{file.name}
										</span>
										<span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider mt-0.5">
											{(file.size / 1024).toFixed(1)} KB • Ready for processing
										</span>
									</div>
									<button
										type="button"
										onClick={() => setFile(null)}
										className="h-8 w-8 rounded-full flex items-center justify-center bg-white dark:bg-zinc-800 shadow-sm border border-zinc-100 dark:border-zinc-700 opacity-0 group-hover:opacity-100 transition-opacity"
									>
										<X className="h-4 w-4 text-zinc-500" />
									</button>
								</div>
							)}
						</div>

						<div className="rounded-xl bg-amber-50/50 dark:bg-amber-950/10 border border-amber-100 dark:border-amber-900/30 p-4 space-y-2">
							<div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
								<CheckCircle2 className="h-3.5 w-3.5" />
								<span className="text-[10px] font-black uppercase tracking-[0.1em]">
									Required Schema
								</span>
							</div>
							<p className="text-[11px] text-amber-800/70 dark:text-amber-400/70 leading-relaxed font-medium">
								The CSV header must strictly match: <br />
								<code className="bg-amber-100 dark:bg-amber-900/40 px-1.5 py-0.5 rounded font-bold text-amber-900 dark:text-amber-200">
									FirstName, LastName, Email, Role
								</code>
							</p>
						</div>
					</div>

					<div className="flex justify-end gap-3 p-6 border-t border-zinc-50 dark:border-zinc-900 bg-zinc-50/30 dark:bg-zinc-900/20">
						<Button
							type="button"
							variant="ghost"
							onClick={closeModal}
							disabled={mutation.isPending}
							className="font-bold text-xs text-zinc-500 hover:bg-transparent"
						>
							Discard
						</Button>
						<Button
							type="submit"
							disabled={!file || mutation.isPending}
							className="min-w-[140px] bg-[#0F172A] text-white hover:bg-[#1E293B] shadow-md font-bold rounded-xl active:scale-95 transition-all gap-2"
						>
							{mutation.isPending ? (
								<>
									<Loader2Icon className="h-4 w-4 animate-spin text-[#FACC15]" />
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
			</Modal>
		</>
	);
}
