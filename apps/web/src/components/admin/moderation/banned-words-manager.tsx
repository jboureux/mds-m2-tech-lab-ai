"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, ShieldAlert, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

interface BannedWord {
	id: string;
	word: string;
	createdAt: string;
}

export function BannedWordsManager() {
	const [newWord, setNewWord] = useState("");
	const queryClient = useQueryClient();

	const { data: bannedWords, isLoading } = useQuery<BannedWord[]>({
		queryKey: ["admin", "moderation", "banned-words"],
		queryFn: async () => {
			const res = await fetch("/api/admin/moderation/banned-words");
			if (!res.ok) throw new Error("Failed to fetch banned words");
			return res.json();
		},
	});

	const addMutation = useMutation({
		mutationFn: async (word: string) => {
			const res = await fetch("/api/admin/moderation/banned-words", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ word }),
			});
			if (!res.ok) {
				const error = await res.json();
				throw new Error(error.error || "Failed to add word");
			}
			return res.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["admin", "moderation", "banned-words"],
			});
			setNewWord("");
			toast.success("Keyword added to blocklist");
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	const deleteMutation = useMutation({
		mutationFn: async (id: string) => {
			const res = await fetch(`/api/admin/moderation/banned-words/${id}`, {
				method: "DELETE",
			});
			if (!res.ok) throw new Error("Failed to delete word");
			return res.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["admin", "moderation", "banned-words"],
			});
			toast.success("Keyword removed from blocklist");
		},
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!newWord.trim()) return;
		addMutation.mutate(newWord.trim());
	};

	return (
		<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
			<Card className="lg:col-span-1 shadow-xl border-border/50 h-fit sticky top-8">
				<CardHeader className="bg-muted/20 border-b py-6 px-8">
					<CardTitle className="text-xl font-black tracking-tight flex items-center gap-2">
						<Plus className="h-5 w-5 text-primary" />
						Add Keyword
					</CardTitle>
					<CardDescription className="text-sm font-medium text-muted-foreground/70">
						Add a new word or phrase to the prohibited content blocklist.
					</CardDescription>
				</CardHeader>
				<CardContent className="p-8">
					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="space-y-2">
							<Input
								placeholder="Enter keyword..."
								value={newWord}
								onChange={(e) => setNewWord(e.target.value)}
								className="font-medium bg-muted/30 border-border/50 focus-visible:ring-primary/20"
								disabled={addMutation.isPending}
							/>
							<p className="text-[10px] text-muted-foreground font-medium px-1">
								Keywords are case-insensitive and will block any content
								containing them.
							</p>
						</div>
						<Button
							type="submit"
							className="w-full font-bold shadow-lg shadow-primary/20 active:scale-95 transition-all"
							disabled={addMutation.isPending || !newWord.trim()}
						>
							{addMutation.isPending ? "Adding..." : "Add to Blocklist"}
						</Button>
					</form>
				</CardContent>
			</Card>

			<Card className="lg:col-span-2 shadow-xl border-border/50 overflow-hidden">
				<CardHeader className="bg-muted/20 border-b py-6 px-8">
					<div className="flex justify-between items-center">
						<div className="space-y-0.5">
							<CardTitle className="text-xl font-black tracking-tight flex items-center gap-2">
								<ShieldAlert className="h-5 w-5 text-destructive" />
								Active Blocklist
							</CardTitle>
							<CardDescription className="text-sm font-medium text-muted-foreground/70">
								{bannedWords?.length || 0} keywords currently being filtered.
							</CardDescription>
						</div>
					</div>
				</CardHeader>
				<CardContent className="p-0">
					<div className="max-h-[600px] overflow-auto">
						<Table>
							<TableHeader className="bg-muted/30 sticky top-0 z-10">
								<TableRow className="hover:bg-transparent border-b">
									<TableHead className="py-4 px-8 font-bold text-muted-foreground uppercase text-[10px] tracking-wider">
										Keyword
									</TableHead>
									<TableHead className="font-bold text-muted-foreground uppercase text-[10px] tracking-wider">
										Added On
									</TableHead>
									<TableHead className="text-right py-4 px-8 font-bold text-muted-foreground uppercase text-[10px] tracking-wider">
										Action
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{isLoading ? (
									<TableRow>
										<TableCell colSpan={3} className="text-center py-12">
											<div className="flex flex-col items-center gap-3">
												<div className="h-6 w-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
												<p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
													Loading blocklist...
												</p>
											</div>
										</TableCell>
									</TableRow>
								) : bannedWords?.length === 0 ? (
									<TableRow>
										<TableCell colSpan={3} className="text-center py-16">
											<div className="flex flex-col items-center gap-2 italic text-muted-foreground">
												<p>No keywords in blocklist.</p>
												<p className="text-xs non-italic font-medium">
													Posts and comments are currently unfiltered.
												</p>
											</div>
										</TableCell>
									</TableRow>
								) : (
									bannedWords?.map((item) => (
										<TableRow
											key={item.id}
											className="group border-b transition-colors hover:bg-muted/20"
										>
											<TableCell className="py-4 px-8">
												<Badge
													variant="outline"
													className="bg-destructive/5 text-destructive border-destructive/20 font-mono font-bold text-sm px-3 py-1"
												>
													{item.word}
												</Badge>
											</TableCell>
											<TableCell className="text-xs font-medium text-muted-foreground">
												{new Date(item.createdAt).toLocaleDateString()}
											</TableCell>
											<TableCell className="text-right py-4 px-8">
												<Button
													variant="ghost"
													size="icon"
													className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors h-8 w-8 rounded-full"
													onClick={() => deleteMutation.mutate(item.id)}
													disabled={deleteMutation.isPending}
												>
													<Trash2 className="h-4 w-4" />
												</Button>
											</TableCell>
										</TableRow>
									))
								)}
							</TableBody>
						</Table>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
