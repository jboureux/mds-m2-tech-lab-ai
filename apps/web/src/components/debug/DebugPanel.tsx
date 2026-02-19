"use client";

import {
	ChevronDown,
	ChevronUp,
	Loader2,
	LogOut,
	Network,
	Terminal,
	User,
	UserPlus,
	X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { signOut, useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

interface DebugPanelProps {
	networkLocation: string;
	clientIp: string;
}

/**
 * A floating debug panel for development environment.
 * Prevents SSR issues by only rendering on the client after mount.
 */
export function DebugPanel(props: DebugPanelProps) {
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted || process.env.NODE_ENV !== "development") return null;

	return <DebugPanelContent {...props} />;
}

function DebugPanelContent({ networkLocation, clientIp }: DebugPanelProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [isPreRegistering, setIsPreRegistering] = useState(false);
	const [debugEmail, setDebugEmail] = useState("");
	const [debugRole, setDebugRole] = useState<"ADMIN" | "USER">("ADMIN");

	const { data: session, isPending: isSessionPending } = useSession();
	const router = useRouter();

	const handleQuickPreRegister = async () => {
		if (!debugEmail || !debugEmail.includes("@")) {
			toast.error("Please enter a valid email");
			return;
		}

		setIsPreRegistering(true);

		try {
			const response = await fetch("/api/debug/pre-register", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					email: debugEmail.trim().toLowerCase(),
					name: `Debug ${debugRole}`,
					role: debugRole,
				}),
			});

			if (!response.ok) throw new Error("Failed to pre-register");

			const data = await response.json();
			toast.success(data.message);
		} catch (error) {
			console.error("Debug pre-registration failed:", error);
			toast.error("Failed to pre-register user");
		} finally {
			setIsPreRegistering(false);
		}
	};

	const handleSignOut = async () => {
		await signOut({
			fetchOptions: {
				onSuccess: () => {
					router.push("/login");
					router.refresh();
				},
			},
		});
	};

	return (
		<div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2 font-mono text-xs animate-in slide-in-from-bottom-4 fade-in duration-500">
			{/* Main Panel Content */}
			{isOpen && (
				<div className="w-64 overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-950">
					<div className="flex items-center justify-between border-b border-zinc-100 bg-zinc-50/50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900/50">
						<div className="flex items-center gap-2 font-semibold">
							<Terminal className="h-3.5 w-3.5" />
							<span>Dev Inspector</span>
						</div>
						<button
							type="button"
							onClick={() => setIsOpen(false)}
							className="rounded-md p-1 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
						>
							<X className="h-3.5 w-3.5" />
						</button>
					</div>

					<div className="p-3 space-y-4">
						{/* Session Section */}
						<div className="space-y-1.5">
							<div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
								<User className="h-3 w-3" />
								<span className="uppercase text-[10px] tracking-wider font-bold">
									Session
								</span>
							</div>
							{isSessionPending ? (
								<div className="flex items-center gap-2 text-[10px] text-zinc-400">
									<Loader2 className="h-3 w-3 animate-spin" />
									Loading session...
								</div>
							) : session ? (
								<div className="space-y-2">
									<div className="rounded border border-emerald-100 bg-emerald-50/30 p-2 dark:border-emerald-900/20 dark:bg-emerald-900/10">
										<div className="text-[9px] text-emerald-600 dark:text-emerald-400 uppercase font-bold mb-1">
											Authenticated
										</div>
										<div className="truncate font-medium text-zinc-900 dark:text-zinc-100 text-[10px]">
											{session.user.email}
										</div>
										<div className="flex items-center gap-1.5 mt-1">
											<span className="inline-flex items-center rounded-full bg-emerald-100 px-1.5 py-0.5 text-[8px] font-medium text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
												{session.user.role}
											</span>
										</div>
									</div>
									<button
										type="button"
										onClick={handleSignOut}
										className="flex w-full items-center justify-center gap-2 rounded border border-zinc-200 bg-white py-1.5 text-[10px] font-medium text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800"
									>
										<LogOut className="h-3 w-3" />
										Sign Out
									</button>
								</div>
							) : (
								<div className="rounded border border-zinc-100 bg-zinc-50/50 p-2 text-center text-[10px] text-zinc-400 dark:border-zinc-800 dark:bg-zinc-900/50">
									Not logged in
								</div>
							)}
						</div>

						{/* Network Section */}
						<div className="space-y-1.5">
							<div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
								<Network className="h-3 w-3" />
								<span className="uppercase text-[10px] tracking-wider font-bold">
									Network
								</span>
							</div>
							<div className="grid grid-cols-2 gap-2">
								<div className="rounded border border-zinc-100 bg-zinc-50/50 p-2 dark:border-zinc-800 dark:bg-zinc-900/50">
									<div className="text-[10px] text-zinc-400 mb-0.5 uppercase">
										Location
									</div>
									<div
										className={cn(
											"font-bold text-[10px]",
											networkLocation === "on-campus"
												? "text-emerald-600 dark:text-emerald-400"
												: "text-amber-600 dark:text-amber-400",
										)}
									>
										{networkLocation}
									</div>
								</div>
								<div className="rounded border border-zinc-100 bg-zinc-50/50 p-2 dark:border-zinc-800 dark:bg-zinc-900/50">
									<div className="text-[10px] text-zinc-400 mb-0.5 uppercase">
										IP
									</div>
									<div className="truncate font-medium text-zinc-900 dark:text-zinc-100 text-[10px]">
										{clientIp || "Unknown"}
									</div>
								</div>
							</div>
						</div>

						{/* Pre-register Actions */}
						<div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
							<div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
								<UserPlus className="h-3 w-3" />
								<span className="uppercase text-[10px] tracking-wider font-bold">
									Quick Authorize
								</span>
							</div>
							<div className="space-y-2">
								<input
									type="text"
									name="debug-email-ignore"
									placeholder="test@example.com"
									value={debugEmail}
									onChange={(e) => setDebugEmail(e.target.value)}
									autoComplete="off"
									data-1p-ignore
									data-lpignore="true"
									className="w-full rounded border border-zinc-200 bg-white px-2 py-1 text-[10px] outline-none focus:border-emerald-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
								/>
								<div className="flex gap-1">
									<button
										type="button"
										onClick={() => setDebugRole("ADMIN")}
										className={cn(
											"flex-1 rounded border py-1 text-[9px] font-bold transition-colors",
											debugRole === "ADMIN"
												? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
												: "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400",
										)}
									>
										ADMIN
									</button>
									<button
										type="button"
										onClick={() => setDebugRole("USER")}
										className={cn(
											"flex-1 rounded border py-1 text-[9px] font-bold transition-colors",
											debugRole === "USER"
												? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
												: "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400",
										)}
									>
										USER
									</button>
								</div>
								<button
									type="button"
									disabled={isPreRegistering || !debugEmail}
									onClick={handleQuickPreRegister}
									className="flex w-full items-center justify-center gap-2 rounded bg-zinc-900 py-2 text-[10px] font-bold text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 disabled:opacity-50"
								>
									{isPreRegistering ? (
										<Loader2 className="h-3 w-3 animate-spin" />
									) : (
										"Pre-Register"
									)}
								</button>
							</div>
						</div>

						{/* Footer */}
						<div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
							<div className="text-[10px] text-zinc-400 text-center uppercase">
								MDS v0.1.0-dev
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Toggle Button */}
			<button
				type="button"
				onClick={() => setIsOpen(!isOpen)}
				className={cn(
					"flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium shadow-lg transition-all hover:scale-105 active:scale-95 border",
					isOpen
						? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
						: "bg-white text-zinc-900 dark:bg-zinc-950 dark:text-white border-zinc-200 dark:border-zinc-800",
				)}
			>
				<Terminal className="h-4 w-4" />
				<span>Debug</span>
				{isOpen ? (
					<ChevronDown className="h-3 w-3" />
				) : (
					<ChevronUp className="h-3 w-3" />
				)}
			</button>
		</div>
	);
}
