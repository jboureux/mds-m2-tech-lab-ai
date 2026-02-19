"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FileIcon, Loader2Icon, UploadIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { type ChangeEvent, type FormEvent, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useModal } from "@/hooks/use-modal";

/**
 * Dialog component for bulk user import via CSV.
 * Uses TanStack Query for the mutation and custom useModal hook for the UI.
 */
export function ImportUsersDialog() {
	const [file, setFile] = useState<File | null>(null);
	const queryClient = useQueryClient();
	const router = useRouter();

	const { Modal, openModal, closeModal } = useModal({
		title: "Batch User Import",
		description:
			"Import multiple users at once by uploading a CSV file with their details.",
		className: "sm:max-w-[425px]",
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
				throw new Error(errorData.error || "Failed to import users");
			}

			return response.json();
		},
		onSuccess: (data) => {
			toast.success(data.message || "Users imported successfully!");
			setFile(null);
			// Invalidate queries that fetch users to refresh the list if needed
			queryClient.invalidateQueries({ queryKey: ["users"] });
			// Refresh server component data
			router.refresh();
			closeModal();
		},
		onError: (error: Error) => {
			toast.error(error.message);
		},
	});

	const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
		const selectedFile = e.target.files?.[0];
		if (selectedFile) {
			if (selectedFile.name.endsWith(".csv")) {
				setFile(selectedFile);
			} else {
				toast.error("Please select a valid CSV file");
				e.target.value = "";
			}
		}
	};

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		if (!file) {
			toast.error("Please select a file to import");
			return;
		}

		mutation.mutate(file);
	};

	return (
		<>
			<Button
				onClick={openModal}
				variant="outline"
				className="gap-2 cursor-pointer transition-all hover:bg-accent"
			>
				<UploadIcon className="size-4" />
				Import Users
			</Button>

			<Modal>
				<form onSubmit={handleSubmit} className="space-y-6 pt-2">
					<div className="space-y-2">
						<Label htmlFor="csv-file" className="text-sm font-medium">
							CSV File
						</Label>
						<div className="relative">
							<Input
								id="csv-file"
								type="file"
								accept=".csv"
								onChange={handleFileChange}
								disabled={mutation.isPending}
								className="cursor-pointer file:cursor-pointer file:bg-muted file:text-muted-foreground file:border-0 file:rounded-md file:px-2 file:py-0.5 file:mr-2"
							/>
						</div>
						<p className="text-[12px] text-muted-foreground leading-relaxed">
							Ensure your CSV follows the header format:
							<br />
							<code className="bg-muted px-1 rounded">
								FirstName, LastName, Email, Role
							</code>
						</p>
					</div>

					{file && (
						<div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3 animate-in fade-in slide-in-from-bottom-2">
							<div className="bg-primary/10 p-2 rounded-md">
								<FileIcon className="size-5 text-primary" />
							</div>
							<div className="flex flex-col min-w-0 overflow-hidden">
								<span className="text-sm font-medium truncate">
									{file.name}
								</span>
								<span className="text-[11px] text-muted-foreground">
									{(file.size / 1024).toFixed(1)} KB
								</span>
							</div>
						</div>
					)}

					<div className="flex justify-end gap-3 pt-2">
						<Button
							type="button"
							variant="outline"
							onClick={closeModal}
							disabled={mutation.isPending}
							className="cursor-pointer"
						>
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={!file || mutation.isPending}
							className="min-w-[120px] cursor-pointer"
						>
							{mutation.isPending ? (
								<>
									<Loader2Icon className="mr-2 size-4 animate-spin" />
									Importing...
								</>
							) : (
								"Start Import"
							)}
						</Button>
					</div>
				</form>
			</Modal>
		</>
	);
}
