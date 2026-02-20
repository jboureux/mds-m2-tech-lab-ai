import {
	ArrowUpRight,
	Calendar,
	Mail,
	MoreHorizontal,
	Search,
	UserCheck,
	UserPlus,
	Users,
} from "lucide-react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AdminUserActions } from "@/components/admin/admin-user-actions";
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
import { auth } from "@/lib/auth";
import db from "@/lib/prisma";
import { cn } from "@/lib/utils";

/**
 * Admin Users page showing signed-in users and pre-registered ones.
 * Securely checks for ADMIN role via Better-Auth.
 */
export default async function AdminUsersPage() {
	// Authentication & Authorization check
	const sessionResponse = await auth.api.getSession({
		headers: await headers(),
	});

	// Cast the user to include the role field for TypeScript safety if automatic inference fails
	const session = sessionResponse as
		| (typeof sessionResponse & {
				user: { role: string };
		  })
		| null;

	if (!session || session.user.role !== "ADMIN") {
		redirect("/access-denied");
	}

	// Fetch current users and pre-registered records for the initial render
	const [users, preRegistered, totalUsers, totalPreRegistered] =
		await Promise.all([
			db.user.findMany({
				orderBy: { createdAt: "desc" },
				take: 10,
			}),
			db.preRegisteredUser.findMany({
				orderBy: { createdAt: "desc" },
				take: 10,
			}),
			db.user.count(),
			db.preRegisteredUser.count(),
		]);

	return (
		<div className="flex flex-col gap-8 p-8 max-w-[1600px] mx-auto animate-in fade-in duration-700">
			{/* Page Header */}
			<div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
				<div className="space-y-1.5">
					<div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-[0.2em]">
						<Users className="h-3 w-3" />
						Identity & Access
					</div>
					<h1 className="text-4xl font-black tracking-tight lg:text-5xl">
						User Management
					</h1>
					<p className="text-muted-foreground text-lg max-w-2xl">
						Maintain the academic integrity of the network by authorizing and
						reviewing member access.
					</p>
				</div>
				<AdminUserActions />
			</div>

			{/* Stats Overview */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				<StatsCard
					title="Active Members"
					value={totalUsers}
					description="Verified accounts on the network"
					icon={UserCheck}
					color="emerald"
				/>
				<StatsCard
					title="Authorized Registry"
					value={totalPreRegistered}
					description="Emails pending first login"
					icon={UserPlus}
					color="blue"
				/>
				<StatsCard
					title="Total Identity Pool"
					value={totalUsers + totalPreRegistered}
					description="Maximum authorized capacity"
					icon={Users}
					color="amber"
				/>
			</div>

			{/* Main Content Areas */}
			<div className="grid grid-cols-1 2xl:grid-cols-5 gap-8">
				{/* Recent Users Table */}
				<Card className="2xl:col-span-3 shadow-xl overflow-hidden border-border/50">
					<CardHeader className="border-b bg-muted/20 py-6 px-8">
						<div className="flex items-center justify-between">
							<div className="space-y-1">
								<CardTitle className="text-xl font-bold tracking-tight">
									Active Network Users
								</CardTitle>
								<CardDescription className="text-sm text-muted-foreground/70">
									Recently joined and active scholars.
								</CardDescription>
							</div>
							<div className="relative w-64 hidden sm:block">
								<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
								<Input
									placeholder="Search by name or email..."
									className="pl-9 bg-background h-9 text-xs"
								/>
							</div>
						</div>
					</CardHeader>
					<CardContent className="p-0">
						<div className="overflow-x-auto">
							<Table>
								<TableHeader className="bg-muted/30">
									<TableRow className="hover:bg-transparent border-b">
										<TableHead className="py-4 px-8 font-bold text-muted-foreground uppercase text-[10px] tracking-wider">
											User Profile
										</TableHead>
										<TableHead className="font-bold text-muted-foreground uppercase text-[10px] tracking-wider">
											Role
										</TableHead>
										<TableHead className="font-bold text-muted-foreground uppercase text-[10px] tracking-wider">
											Status
										</TableHead>
										<TableHead className="text-right py-4 px-8 font-bold text-muted-foreground uppercase text-[10px] tracking-wider">
											Join Date
										</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{users.map((user) => (
										<TableRow
											key={user.id}
											className="group border-b transition-colors hover:bg-muted/20"
										>
											<TableCell className="py-4 px-8">
												<div className="flex items-center gap-3">
													<div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold shadow-sm">
														{(user.firstName?.[0] || user.email[0]).toUpperCase()}
													</div>
													<div className="flex flex-col">
														<span className="font-bold text-sm group-hover:text-primary transition-colors">
															{user.firstName || user.lastName
																? `${user.firstName || ""} ${user.lastName || ""}`.trim()
																: "Anonymous"}
														</span>
														<span className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
															<Mail className="h-2.5 w-2.5" />
															{user.email}
														</span>
													</div>
												</div>
											</TableCell>
											<TableCell>
												<Badge
													variant="outline"
													className={cn(
														"capitalize font-bold text-[10px] px-2 py-0 border shadow-none",
														user.role === "ADMIN"
															? "bg-destructive/10 text-destructive border-destructive/20"
															: "bg-secondary text-secondary-foreground border-border",
													)}
												>
													{user.role.toLowerCase()}
												</Badge>
											</TableCell>
											<TableCell>
												<div className="flex items-center gap-1.5">
													<div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
													<span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
														Active
													</span>
												</div>
											</TableCell>
											<TableCell className="text-right py-4 px-8">
												<span className="text-[11px] font-medium text-muted-foreground flex items-center justify-end gap-1.5">
													<Calendar className="h-3 w-3" />
													{new Date(user.createdAt).toLocaleDateString(
														undefined,
														{ day: "numeric", month: "short" },
													)}
												</span>
											</TableCell>
										</TableRow>
									))}
									{users.length === 0 && (
										<TableRow>
											<TableCell
												colSpan={4}
												className="text-center py-16 text-muted-foreground italic"
											>
												No active scholars found in the registry.
											</TableCell>
										</TableRow>
									)}
								</TableBody>
							</Table>
						</div>
						<div className="py-4 px-8 border-t bg-muted/10 flex justify-between items-center">
							<span className="text-[11px] font-medium text-muted-foreground">
								Showing {users.length} of {totalUsers} active users
							</span>
							<Button
								variant="ghost"
								size="sm"
								className="text-[11px] font-bold hover:bg-transparent hover:text-primary gap-1"
							>
								View All Registry <ArrowUpRight className="h-3 w-3" />
							</Button>
						</div>
					</CardContent>
				</Card>

				{/* Pre-registered Pool Card */}
				<Card className="2xl:col-span-2 shadow-xl overflow-hidden border-border/50">
					<CardHeader className="border-b bg-muted/20 py-6 px-8">
						<CardTitle className="text-xl font-bold tracking-tight">
							Authorization Pool
						</CardTitle>
						<CardDescription className="text-sm text-muted-foreground/70">
							Members eligible to claim their identity.
						</CardDescription>
					</CardHeader>
					<CardContent className="p-0">
						<Table>
							<TableHeader className="bg-muted/30">
								<TableRow className="hover:bg-transparent border-b">
									<TableHead className="py-4 px-8 font-bold text-muted-foreground uppercase text-[10px] tracking-wider">
										Credential
									</TableHead>
									<TableHead className="font-bold text-muted-foreground uppercase text-[10px] tracking-wider">
										Target Role
									</TableHead>
									<TableHead className="text-right py-4 px-8"></TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{preRegistered.map((user) => (
									<TableRow
										key={user.id}
										className="group border-b hover:bg-muted/20 transition-colors"
									>
										<TableCell className="py-4 px-8">
											<div className="flex flex-col">
												<span className="font-bold text-sm">
													{user.firstName || user.lastName
														? `${user.firstName || ""} ${user.lastName || ""}`.trim()
														: "N/A"}
												</span>
												<span className="text-[11px] text-muted-foreground font-medium">
													{user.email}
												</span>
											</div>
										</TableCell>
										<TableCell>
											<Badge
												variant="outline"
												className="capitalize font-bold text-[9px] px-2 py-0 shadow-none text-muted-foreground"
											>
												{user.role.toLowerCase()}
											</Badge>
										</TableCell>
										<TableCell className="text-right py-4 px-8">
											<Button
												variant="ghost"
												size="icon"
												className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-lg"
											>
												<MoreHorizontal className="h-4 w-4" />
											</Button>
										</TableCell>
									</TableRow>
								))}
								{preRegistered.length === 0 && (
									<TableRow>
										<TableCell
											colSpan={3}
											className="text-center py-12 text-muted-foreground italic px-8"
										>
											Registry is empty. Use the{" "}
											<strong className="text-foreground">
												Import Utility
											</strong>{" "}
											to authorize new identities.
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
						<div className="py-4 px-8 border-t bg-muted/10 flex justify-center">
							<Button
								variant="ghost"
								size="sm"
								className="text-[11px] font-bold text-muted-foreground hover:bg-transparent hover:text-foreground uppercase tracking-widest"
							>
								Manage Pool
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

function StatsCard({
	title,
	value,
	description,
	icon: Icon,
	color,
}: {
	title: string;
	value: number;
	description: string;
	icon: React.ElementType;
	color: "blue" | "emerald" | "amber";
}) {
	const colorMap = {
		blue: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 border-blue-100 dark:border-blue-900/30",
		emerald:
			"text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/30",
		amber:
			"text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border-amber-100 dark:border-amber-900/30",
	};

	return (
		<Card className="shadow-sm bg-card group hover:shadow-md transition-all duration-300 hover:-translate-y-1 border-border/50">
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
				<CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
					{title}
				</CardTitle>
				<div className={cn("p-2 rounded-lg border", colorMap[color])}>
					<Icon className="h-4 w-4" />
				</div>
			</CardHeader>
			<CardContent>
				<div className="text-3xl font-black tracking-tight">{value}</div>
				<p className="text-[11px] text-muted-foreground font-medium mt-1">
					{description}
				</p>
			</CardContent>
		</Card>
	);
}
