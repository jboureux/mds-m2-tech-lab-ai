"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar, Loader2Icon, MoreHorizontal, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface AllowedIP {
	id: string;
	cidr: string;
	description: string | null;
	createdAt: string | Date;
}

interface NetworkRangeTableProps {
	initialRanges: AllowedIP[];
}

/**
 * Table for displaying and managing allowed CIDR ranges.
 */
export function NetworkRangeTable({ initialRanges }: NetworkRangeTableProps) {
	const queryClient = useQueryClient();
	const router = useRouter();
	const [deletingId, setDeletingId] = useState<string | null>(null);

	const deleteMutation = useMutation({
		mutationFn: async (id: string) => {
			setDeletingId(id);
			const response = await fetch(`/api/admin/network?id=${id}`, {
				method: "DELETE",
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Failed to remove range");
			}

			return response.json();
		},
		onSuccess: (data) => {
			toast.success(data.message || "Network range removed");
			queryClient.invalidateQueries({ queryKey: ["network-ranges"] });
			router.refresh();
		},
		onError: (error: Error) => {
			toast.error(error.message);
		},
		onSettled: () => {
			setDeletingId(null);
		},
	});

	const handleDelete = (id: string) => {
		if (
			confirm(
				"Are you sure you want to remove this network range? Users on this network will lose on-campus privileges.",
			)
		) {
			deleteMutation.mutate(id);
		}
	};

	return (
		<div className="overflow-x-auto">
			<Table>
				<TableHeader className="bg-muted/30">
					<TableRow className="hover:bg-transparent border-b">
						<TableHead className="py-4 px-8 font-bold text-muted-foreground uppercase text-[10px] tracking-wider">
							CIDR Range
						</TableHead>
						<TableHead className="font-bold text-muted-foreground uppercase text-[10px] tracking-wider">
							Description
						</TableHead>
						<TableHead className="font-bold text-muted-foreground uppercase text-[10px] tracking-wider">
							Status
						</TableHead>
						<TableHead className="text-right py-4 px-8 font-bold text-muted-foreground uppercase text-[10px] tracking-wider">
							Date Added
						</TableHead>
						<TableHead className="w-[50px]"></TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{initialRanges.map((range) => (
						<TableRow
							key={range.id}
							className={cn(
								"group border-b transition-colors hover:bg-muted/20",
								deletingId === range.id && "opacity-50 pointer-events-none",
							)}
						>
							<TableCell className="py-4 px-8 font-mono text-sm font-semibold group-hover:text-primary transition-colors">
								{range.cidr}
							</TableCell>
							<TableCell>
								<div className="flex flex-col">
									<span className="text-sm font-medium">
										{range.description || "No description provided"}
									</span>
								</div>
							</TableCell>
							<TableCell>
								<Badge
									variant="outline"
									className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-bold text-[10px] px-2 py-0 shadow-none"
								>
									Active
								</Badge>
							</TableCell>
							<TableCell className="text-right py-4 px-8">
								<span className="text-[11px] font-medium text-muted-foreground flex items-center justify-end gap-1.5">
									<Calendar className="h-3 w-3" />
									{new Date(range.createdAt).toLocaleDateString(undefined, {
										day: "numeric",
										month: "short",
										year: "numeric",
									})}
								</span>
							</TableCell>
							<TableCell className="py-4 pr-8">
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button
											variant="ghost"
											size="icon"
											className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-lg"
										>
											<MoreHorizontal className="h-4 w-4" />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end" className="rounded-xl p-1">
										<DropdownMenuItem
											onClick={() => handleDelete(range.id)}
											className="text-destructive focus:text-destructive focus:bg-destructive/10 rounded-lg font-bold text-xs gap-2 cursor-pointer"
										>
											{deletingId === range.id ? (
												<Loader2Icon className="h-3.5 w-3.5 animate-spin" />
											) : (
												<Trash2 className="h-3.5 w-3.5" />
											)}
											Remove Range
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</TableCell>
						</TableRow>
					))}
					{initialRanges.length === 0 && (
						<TableRow>
							<TableCell
								colSpan={5}
								className="text-center py-16 text-muted-foreground italic"
							>
								No network ranges defined. The system defaults to off-campus
								mode for everyone.
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
		</div>
	);
}
