import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ImportUsersDialog } from "@/components/admin/import-users-dialog";
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
	const [users, preRegistered] = await Promise.all([
		db.user.findMany({
			orderBy: { createdAt: "desc" },
			take: 20,
		}),
		db.preRegisteredUser.findMany({
			orderBy: { createdAt: "desc" },
			take: 20,
		}),
	]);

	return (
		<div className="container mx-auto py-12 px-4 space-y-10 max-w-7xl">
			{/* Page Header */}
			<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
				<div className="space-y-1">
					<h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
						User Management
					</h1>
					<p className="text-muted-foreground text-lg">
						Review active accounts and pre-register new members to the network.
					</p>
				</div>
				<ImportUsersDialog />
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
				{/* Recent Users Card */}
				<Card className="shadow-sm border-muted">
					<CardHeader className="bg-muted/10">
						<CardTitle>Active Network Users</CardTitle>
						<CardDescription>
							List of accounts that have successfully logged in.
						</CardDescription>
					</CardHeader>
					<CardContent className="pt-6">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>User</TableHead>
									<TableHead>Role</TableHead>
									<TableHead className="text-right">Joined</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{users.map((user) => (
									<TableRow key={user.id} className="group">
										<TableCell>
											<div className="flex flex-col">
												<span className="font-semibold text-sm">
													{user.name || "Anonymous"}
												</span>
												<span className="text-xs text-muted-foreground">
													{user.email}
												</span>
											</div>
										</TableCell>
										<TableCell>
											<Badge
												variant={
													user.role === "ADMIN" ? "destructive" : "secondary"
												}
												className="capitalize"
											>
												{user.role.toLowerCase()}
											</Badge>
										</TableCell>
										<TableCell className="text-right text-xs text-muted-foreground">
											{new Date(user.createdAt).toLocaleDateString()}
										</TableCell>
									</TableRow>
								))}
								{users.length === 0 && (
									<TableRow>
										<TableCell
											colSpan={3}
											className="text-center py-8 text-muted-foreground"
										>
											No active users found.
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
					</CardContent>
				</Card>

				{/* Pre-registered Users Card */}
				<Card className="shadow-sm border-muted">
					<CardHeader className="bg-muted/10">
						<CardTitle>Pre-registered Registry</CardTitle>
						<CardDescription>
							Authorized members who can access the network.
						</CardDescription>
					</CardHeader>
					<CardContent className="pt-6">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Authorized Identity</TableHead>
									<TableHead>Role</TableHead>
									<TableHead className="text-right">Imported</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{preRegistered.map((user) => (
									<TableRow key={user.id} className="group">
										<TableCell>
											<div className="flex flex-col">
												<span className="font-semibold text-sm">
													{user.name || "N/A"}
												</span>
												<span className="text-xs text-muted-foreground">
													{user.email}
												</span>
											</div>
										</TableCell>
										<TableCell>
											<Badge variant="outline" className="capitalize">
												{user.role.toLowerCase()}
											</Badge>
										</TableCell>
										<TableCell className="text-right text-xs text-muted-foreground">
											{new Date(user.createdAt).toLocaleDateString()}
										</TableCell>
									</TableRow>
								))}
								{preRegistered.length === 0 && (
									<TableRow>
										<TableCell
											colSpan={3}
											className="text-center py-8 text-muted-foreground"
										>
											Registry is empty. Use the <strong>Import</strong> utility
											to authorize members.
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
