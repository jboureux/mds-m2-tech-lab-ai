"use client";

import { ChevronDown, ChevronUp, Network, Terminal, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface DebugPanelProps {
	networkLocation: string;
	clientIp: string;
}

/**
 * A floating debug panel for development environment.
 * Shows network context and can be expanded for more details.
 */
export function DebugPanel({ networkLocation, clientIp }: DebugPanelProps) {
	const [isOpen, setIsOpen] = useState(false);

	// Only render in development
	if (process.env.NODE_ENV !== "development") return null;

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

					<div className="p-3 space-y-3">
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
											"font-bold",
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
										Detected IP
									</div>
									<div className="truncate font-medium text-zinc-900 dark:text-zinc-100">
										{clientIp || "Unknown"}
									</div>
								</div>
							</div>
						</div>

						{/* Add more sections here for scalability */}
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
