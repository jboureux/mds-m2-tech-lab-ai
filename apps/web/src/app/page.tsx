import { PostCard } from "@/components/social/post-card";
import { PostEditor } from "@/components/social/post-editor";
import { auth } from "@/lib/auth";
import { checkPostingPermission } from "@/lib/permissions";
import db from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function Home() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) {
		redirect("/login");
	}

	const posts = await db.post.findMany({
		where: {
			OR: [
				{ status: "PUBLISHED" },
				{ authorId: session.user.id } // Users can see their own pending/flagged posts
			]
		},
		include: {
			author: {
				select: {
					name: true,
					image: true,
					role: true,
				},
			},
			_count: {
				select: {
					comments: true,
				},
			},
		},
		orderBy: {
			createdAt: "desc",
		},
	});

	const { isAllowed, reason } = await checkPostingPermission(session);

	return (
		<div className="flex min-h-screen flex-col bg-slate-50 dark:bg-black font-sans">
			<header className="sticky top-0 z-40 w-full border-b bg-white/80 dark:bg-black/80 backdrop-blur-md">
				<div className="container mx-auto flex h-16 items-center justify-between px-4 max-w-4xl">
					<div className="flex items-center gap-2">
						<div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">M</div>
						<span className="text-xl font-bold tracking-tight">My Digital Scoop</span>
					</div>
					<div className="flex items-center gap-4">
						<span className="text-sm font-medium hidden sm:inline-block">{session.user.name}</span>
						<div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-800" />
					</div>
				</div>
			</header>

			<main className="container mx-auto max-w-2xl px-4 py-8 space-y-8">
				<section>
					<PostEditor 
						user={{
							name: session.user.name,
							image: session.user.image ?? null
						}} 
						isAllowedToPost={isAllowed} 
						restrictionReason={reason}
					/>
				</section>

				<section className="space-y-6">
					<div className="flex items-center justify-between">
						<h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Recent Activity</h2>
					</div>
					
					{posts.length === 0 ? (
						<div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-xl border border-dashed">
							<p className="text-muted-foreground">No posts yet. Be the first to share something!</p>
						</div>
					) : (
						<div className="grid gap-6">
							{posts.map((post) => (
								<PostCard key={post.id} post={post} />
							))}
						</div>
					)}
				</section>
			</main>
		</div>
	);
}
