import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function FeedPage() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) {
		redirect("/");
	}

	return (
		<main className="flex min-h-screen flex-col items-center justify-center p-24 bg-zinc-50 dark:bg-black text-foreground antialiased">
			<div className="max-w-4xl w-full text-center space-y-6">
				<h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
					Your School Scoop
				</h1>
				<p className="text-xl text-muted-foreground">
					Stay tuned for the latest scoop from your school community. This area
					is only accessible to students and staff.
				</p>
				<div className="pt-10 flex items-center justify-center gap-4">
					<div className="h-10 w-48 bg-muted animate-pulse rounded-lg" />
					<div className="h-10 w-48 bg-muted animate-pulse rounded-lg" />
				</div>
			</div>
		</main>
	);
}
