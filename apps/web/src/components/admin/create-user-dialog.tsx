"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	AlertCircle,
	ArrowRight,
	CheckCircle2,
	Loader2Icon,
	Mail,
	User,
	Shield,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { useModalStore } from "@/store/modal-store";
import { Role } from "@prisma/client";

/**
 * Dialog for manual user creation (authorization).
 */
export function CreateUserDialog() {
	const { isOpen, onClose, type } = useModalStore();
	const isModalOpen = isOpen && type === "create-user";

	const [email, setEmail] = useState("");
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [role, setRole] = useState<string>("USER");

	const queryClient = useQueryClient();
	const router = useRouter();

	const mutation = useMutation({
		mutationFn: async (userData: {
			email: string;
			firstName: string;
			lastName: string;
			role: string;
		}) => {
			const response = await fetch("/api/admin/users", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(userData),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Failed to authorize user");
			}

			return response.json();
		},
		onSuccess: (data) => {
			toast.success(data.message || "Identity successfully authorized", {
				icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
			});
			setEmail("");
			setFirstName("");
			setLastName("");
			setRole("USER");
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
		mutation.mutate({ email, firstName, lastName, role });
	};

	return (
		<Dialog open={isModalOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-[480px] border-none shadow-2xl p-0 overflow-hidden bg-background">
				<DialogHeader className="p-8 pb-0">
					<div className="flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-[0.2em] mb-1">
						<Shield className="h-3 w-3" />
						Manual Authorization
					</div>
					<DialogTitle className="text-3xl font-black tracking-tight">
						Grant Access
					</DialogTitle>
					<DialogDescription className="text-muted-foreground font-medium pt-1">
						Manually add a member to the authorized identity pool. They will be
						able to sign in using their school email.
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="flex flex-col">
					<div className="p-8 space-y-6">
						<div className="space-y-5">
							{/* Email Field */}
							<div className="space-y-2">
								<Label
									htmlFor="email"
									className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/70"
								>
									Institutional Email
								</Label>
								<div className="relative group">
									<Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
									<Input
										id="email"
										type="email"
										placeholder="student@school.edu"
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										required
										disabled={mutation.isPending}
										className="pl-10 h-12 bg-muted/30 border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-all rounded-xl font-medium"
									/>
								</div>
							</div>

							{/* Name Fields */}
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label
										htmlFor="firstName"
										className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/70"
									>
										First Name
									</Label>
									<div className="relative group">
										<User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
										<Input
											id="firstName"
											type="text"
											placeholder="John"
											value={firstName}
											onChange={(e) => setFirstName(e.target.value)}
											disabled={mutation.isPending}
											className="pl-10 h-12 bg-muted/30 border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-all rounded-xl font-medium"
										/>
									</div>
								</div>
								<div className="space-y-2">
									<Label
										htmlFor="lastName"
										className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/70"
									>
										Last Name
									</Label>
									<div className="relative group">
										<User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
										<Input
											id="lastName"
											type="text"
											placeholder="Doe"
											value={lastName}
											onChange={(e) => setLastName(e.target.value)}
											disabled={mutation.isPending}
											className="pl-10 h-12 bg-muted/30 border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-all rounded-xl font-medium"
										/>
									</div>
								</div>
							</div>

							{/* Role Selection */}
							<div className="space-y-2">
								<Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/70">
									Assigned Role
								</Label>
								<div className="grid grid-cols-2 gap-3">
									{Object.values(Role).map((r) => (
										<button
											key={r}
											type="button"
											onClick={() => setRole(r)}
											disabled={mutation.isPending}
											className={`flex items-center justify-center h-11 rounded-xl text-[11px] font-bold uppercase tracking-wider border-2 transition-all active:scale-95 ${
												role === r
													? "bg-primary/5 border-primary text-primary"
													: "bg-muted/30 border-transparent text-muted-foreground hover:border-muted-foreground/30"
											}`}
										>
											{r.toLowerCase()}
										</button>
									))}
								</div>
							</div>
						</div>

						{/* Info box */}
						<div className="rounded-xl bg-blue-500/10 border border-blue-500/20 p-4">
							<p className="text-[11px] text-blue-700 dark:text-blue-400 leading-relaxed font-semibold">
								Once authorized, the user will receive immediate access to post content when on-campus.
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
							disabled={!email || mutation.isPending}
							className="min-w-[140px] bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 font-bold rounded-xl active:scale-95 transition-all gap-2"
						>
							{mutation.isPending ? (
								<>
									<Loader2Icon className="h-4 w-4 animate-spin" />
									Authorizing...
								</>
							) : (
								<>
									Confirm Access
									<ArrowRight className="h-3.5 w-3.5" />
								</>
							)}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
