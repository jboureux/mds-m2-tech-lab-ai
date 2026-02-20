import { Globe, Info, Network, ShieldCheck, Wifi } from "lucide-react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AdminNetworkActions } from "@/components/admin/admin-network-actions";
import { NetworkRangeTable } from "@/components/admin/network-range-table";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { auth } from "@/lib/auth";
import db from "@/lib/prisma";

/**
 * Admin Network Management page.
 * Securely checks for ADMIN role and manages CIDR ranges.
 */
export default async function AdminNetworkPage() {
	// Authentication & Authorization check
	const sessionResponse = await auth.api.getSession({
		headers: await headers(),
	});

	const session = sessionResponse as
		| (typeof sessionResponse & {
				user: { role: string };
		  })
		| null;

	if (!session || session.user.role !== "ADMIN") {
		redirect("/access-denied");
	}

	// Fetch current allowed IP ranges
	const [ranges, totalRanges] = await Promise.all([
		db.allowedIP.findMany({
			orderBy: { createdAt: "desc" },
		}),
		db.allowedIP.count(),
	]);

	return (
		<div className="flex flex-col gap-8 p-8 max-w-[1600px] mx-auto animate-in fade-in duration-700">
			{/* Page Header */}
			<div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
				<div className="space-y-1.5">
					<div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-[0.2em]">
						<Network className="h-3 w-3" />
						Infrastructure & Access Control
					</div>
					<h1 className="text-4xl font-black tracking-tight lg:text-5xl">
						Network Management
					</h1>
					<p className="text-muted-foreground text-lg max-w-2xl">
						Define and manage the physical boundaries of the network to enable
						location-aware security policies.
					</p>
				</div>
				<AdminNetworkActions />
			</div>

			{/* Info Section */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<Card className="shadow-sm border-border/50 bg-muted/10">
					<CardHeader className="pb-3">
						<CardTitle className="text-sm font-bold flex items-center gap-2">
							<Wifi className="h-4 w-4 text-primary" />
							How it works
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-xs text-muted-foreground leading-relaxed">
							The system automatically detects the client's IP address and
							compares it against these registered CIDR ranges. If a match is
							found, the user is granted <strong>on-campus</strong> status,
							enabling posting privileges.
						</p>
					</CardContent>
				</Card>

				<Card className="shadow-sm border-border/50 bg-muted/10">
					<CardHeader className="pb-3">
						<CardTitle className="text-sm font-bold flex items-center gap-2">
							<ShieldCheck className="h-4 w-4 text-emerald-500" />
							Security Policy
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-xs text-muted-foreground leading-relaxed">
							Standard users can only post when connected to a verified
							institutional network. Moderators and VIPs are exempt from this
							restriction and can post from any location.
						</p>
					</CardContent>
				</Card>

				<Card className="shadow-sm border-border/50 bg-muted/10">
					<CardHeader className="pb-3">
						<CardTitle className="text-sm font-bold flex items-center gap-2">
							<Info className="h-4 w-4 text-amber-500" />
							Cache Management
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-xs text-muted-foreground leading-relaxed">
							Network ranges are cached in the middleware with a 5-minute TTL.
							Adding or removing a range triggers an immediate background
							revalidation of the system-wide network registry.
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Main Content Areas */}
			<div className="grid grid-cols-1 gap-8">
				{/* Network Ranges Table */}
				<Card className="shadow-xl overflow-hidden border-border/50">
					<CardHeader className="border-b bg-muted/20 py-6 px-8">
						<div className="flex items-center justify-between">
							<div className="space-y-1">
								<CardTitle className="text-xl font-bold tracking-tight">
									Authorized CIDR Ranges
								</CardTitle>
								<CardDescription className="text-sm text-muted-foreground/70">
									Active network segments authorized for campus interactions.
								</CardDescription>
							</div>
							<div className="flex items-center gap-2">
								<Globe className="h-4 w-4 text-muted-foreground/40" />
								<span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/50">
									Network Boundary Registry
								</span>
							</div>
						</div>
					</CardHeader>
					<CardContent className="p-0">
						<NetworkRangeTable
							initialRanges={JSON.parse(JSON.stringify(ranges))}
						/>
						<div className="py-4 px-8 border-t bg-muted/10 flex justify-between items-center">
							<span className="text-[11px] font-medium text-muted-foreground">
								Displaying {ranges.length} of {totalRanges} registered network
								ranges
							</span>
							<div className="flex items-center gap-1.5">
								<div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
								<span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
									Real-time Status Active
								</span>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
