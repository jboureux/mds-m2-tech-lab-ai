import { CheckCircle, EyeOff, Flag, Gavel, ShieldAlert } from "lucide-react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ModerationActions } from "@/components/admin/moderation/moderation-actions";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
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

export default async function AdminModerationPage() {
	const sessionResponse = await auth.api.getSession({
		headers: await headers(),
	});

	const session = sessionResponse as
		| (typeof sessionResponse & {
				user: { role: string };
		  })
		| null;

	if (
		!session ||
		(session.user.role !== "ADMIN" && session.user.role !== "MODERATOR")
	) {
		redirect("/access-denied");
	}

	const flaggedPosts = await db.post.findMany({
		where: {
			OR: [{ status: "FLAGGED" }, { isToxic: true }],
			NOT: { status: "REMOVED" },
		},
		include: {
			author: {
				select: {
					id: true,
					name: true,
					email: true,
					image: true,
				},
			},
		},
		orderBy: {
			createdAt: "desc",
		},
	});

	const flaggedCount = await db.post.count({
		where: {
			OR: [{ status: "FLAGGED" }, { isToxic: true }],
			NOT: { status: "REMOVED" },
		},
	});
	const removedCount = await db.post.count({
		where: { status: "REMOVED" },
	});
	const bannedUsersCount = await db.user.count({ where: { banned: true } });

	return (
		<div className="flex flex-col gap-8 p-8 max-w-[1600px] mx-auto animate-in fade-in duration-700">
			<div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
				<div className="space-y-1.5">
					<div className="flex items-center gap-2 text-destructive font-bold text-xs uppercase tracking-[0.2em]">
						<ShieldAlert className="h-3 w-3" />
						Content Safety
					</div>
					<h1 className="text-4xl font-black tracking-tight lg:text-5xl">
						Moderation Queue
					</h1>
					<p className="text-muted-foreground text-lg max-w-2xl">
						Review flagged content and take action to maintain community
						standards.
					</p>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				<StatsCard
					title="Flagged Posts"
					value={flaggedCount}
					description="Pending review"
					icon={Flag}
					color="amber"
				/>
				<StatsCard
					title="Removed Content"
					value={removedCount}
					description="Hidden from feed"
					icon={EyeOff}
					color="destructive"
				/>
				<StatsCard
					title="Banned Users"
					value={bannedUsersCount}
					description="Restricted access"
					icon={Gavel}
					color="blue"
				/>
			</div>

			<Card className="shadow-xl overflow-hidden border-border/50">
				<CardHeader className="border-b bg-muted/20 py-6 px-8">
					<CardTitle className="text-xl font-bold tracking-tight">
						Flagged Content
					</CardTitle>
					<CardDescription className="text-sm text-muted-foreground/70">
						Posts flagged by automated systems or users.
					</CardDescription>
				</CardHeader>
				<CardContent className="p-0">
					<Table>
						<TableHeader className="bg-muted/30">
							<TableRow className="hover:bg-transparent border-b">
								<TableHead className="py-4 px-8 font-bold text-muted-foreground uppercase text-[10px] tracking-wider w-[400px]">
									Content Preview
								</TableHead>
								<TableHead className="font-bold text-muted-foreground uppercase text-[10px] tracking-wider">
									Author
								</TableHead>
								<TableHead className="font-bold text-muted-foreground uppercase text-[10px] tracking-wider">
									Reason
								</TableHead>
								<TableHead className="text-right py-4 px-8 font-bold text-muted-foreground uppercase text-[10px] tracking-wider">
									Actions
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{flaggedPosts.map((post) => (
								<TableRow
									key={post.id}
									className="group border-b transition-colors hover:bg-muted/20"
								>
									<TableCell className="py-4 px-8 align-top">
										<p className="text-sm font-medium line-clamp-3">
											{post.content}
										</p>
										<span className="text-[10px] text-muted-foreground mt-1 block">
											ID: {post.id} • {post.createdAt.toLocaleDateString()}
										</span>
									</TableCell>
									<TableCell className="align-top">
										<div className="flex flex-col">
											<span className="font-bold text-sm">
												{post.author.name || "Anonymous"}
											</span>
											<span className="text-[11px] text-muted-foreground font-medium">
												{post.author.email}
											</span>
										</div>
									</TableCell>
									<TableCell className="align-top">
										<div className="flex flex-col gap-1.5">
											{post.isToxic && (
												<Badge
													variant="outline"
													className="bg-destructive/10 text-destructive border-destructive/20 font-bold text-[10px] px-2 py-0 w-fit"
												>
													Toxic Content
												</Badge>
											)}
											{post.status === "FLAGGED" && (
												<Badge
													variant="outline"
													className="bg-amber-100 text-amber-700 border-amber-200 font-bold text-[10px] px-2 py-0 w-fit"
												>
													Flagged by User
												</Badge>
											)}
										</div>
									</TableCell>{" "}
									<TableCell className="text-right py-4 px-8 align-top">
										<ModerationActions post={post} />
									</TableCell>
								</TableRow>
							))}
							{flaggedPosts.length === 0 && (
								<TableRow>
									<TableCell
										colSpan={4}
										className="text-center py-16 text-muted-foreground italic"
									>
										<div className="flex flex-col items-center gap-2">
											<CheckCircle className="h-8 w-8 text-emerald-500/50" />
											<p>All clear! No flagged content found.</p>
										</div>
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
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
	color: "blue" | "emerald" | "amber" | "destructive";
}) {
	const colorMap = {
		blue: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 border-blue-100 dark:border-blue-900/30",
		emerald:
			"text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/30",
		amber:
			"text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border-amber-100 dark:border-amber-900/30",
		destructive:
			"text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border-red-100 dark:border-red-900/30",
	};

	return (
		<Card className="shadow-sm bg-card group hover:shadow-md transition-all duration-300 hover:-translate-y-1 border-border/50">
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
				<CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
					{title}
				</CardTitle>
				<div className={`p-2 rounded-lg border ${colorMap[color]}`}>
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
