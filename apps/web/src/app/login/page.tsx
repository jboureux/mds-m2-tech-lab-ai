"use client";

import { useMutation } from "@tanstack/react-query";
import { Loader2, Mail } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

export default function LoginPage() {
	const [email, setEmail] = useState("");
	const [isSent, setIsSent] = useState(false);

	const mutation = useMutation({
		mutationFn: async (loginEmail: string) => {
			const { error } = await authClient.signIn.magicLink({
				email: loginEmail.trim().toLowerCase(),
				callbackURL: "/admin/users",
			});

			if (error) {
				if (error.status === 400 && error.code === "SIGNUP_DISABLED") {
					throw new Error("This email is not pre-registered on the network.");
				}
				throw new Error(error.message || "Failed to send magic link");
			}
		},
		onSuccess: () => {
			setIsSent(true);
			toast.success("Magic link sent to your email!");
		},
		onError: (error: Error) => {
			toast.error(error.message);
		},
	});

	const handleLogin = (e: React.FormEvent) => {
		e.preventDefault();
		if (!email) return;
		mutation.mutate(email);
	};

	if (isSent) {
		return (
			<div className="flex min-h-screen items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-950">
				<Card className="w-full max-w-md text-center py-8 animate-in fade-in zoom-in-95 duration-300">
					<CardHeader>
						<div className="mx-auto bg-emerald-100 dark:bg-emerald-900/30 p-3 rounded-full w-fit mb-4">
							<Mail className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
						</div>
						<CardTitle className="text-2xl">Check your email</CardTitle>
						<CardDescription className="text-base mt-2">
							We've sent a magic link to{" "}
							<span className="font-semibold text-foreground">{email}</span>.
							Click the link to sign in to your account.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Button
							variant="outline"
							onClick={() => setIsSent(false)}
							className="mt-4"
						>
							Back to login
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="flex min-h-screen items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-950">
			<Card className="w-full max-w-md shadow-xl border-muted/60">
				<CardHeader className="space-y-1">
					<CardTitle className="text-3xl font-bold tracking-tight">
						Sign in
					</CardTitle>
					<CardDescription className="text-zinc-500 dark:text-zinc-400">
						Enter your email to receive a secure magic link
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleLogin} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="email">School Email</Label>
							<Input
								id="email"
								type="email"
								placeholder="name@student.com"
								required
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								disabled={mutation.isPending}
								className="h-11"
							/>
						</div>
						<Button
							type="submit"
							className="w-full h-11 text-base font-semibold transition-all active:scale-[0.98]"
							disabled={mutation.isPending || !email}
						>
							{mutation.isPending ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Sending Link...
								</>
							) : (
								"Send Magic Link"
							)}
						</Button>
					</form>

					<div className="mt-6 text-center">
						<p className="text-xs text-muted-foreground italic">
							Only pre-registered users can access the network.
						</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
