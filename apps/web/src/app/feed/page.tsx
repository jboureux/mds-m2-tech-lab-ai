import { LayoutDashboard, Sparkles } from "lucide-react";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AsidePanel } from "@/components/social/aside-panel";
import { SocialHeader } from "@/components/social/header";
import { PostEditor } from "@/components/social/post-editor";
import { PostFeed } from "@/components/social/post-feed";
import { SocialSidebar } from "@/components/social/sidebar";
import { auth } from "@/lib/auth";
import { checkPostingPermission } from "@/lib/permissions";
import db from "@/lib/prisma";

export default async function Home({
	searchParams,
}: {
	searchParams: Promise<{ feed?: string }>;
}) {
	const { feed = "all" } = await searchParams;
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) {
		redirect("/");
	}

	const isStaff =
		session.user.role === "ADMIN" || session.user.role === "MODERATOR";

	let posts: any[] = [];

	if (feed === "discovery") {
		// Personalized logic similar to the API route but direct DB access for initial load
		const following = await db.follow.findMany({
			where: { followerId: session.user.id },
			select: { followingId: true },
		});
		const followingIds = following.map((f) => f.followingId);

		const userPosts = await db.post.findMany({
			where: { authorId: session.user.id },
			select: { hashtags: { select: { name: true } } },
			take: 50,
		});
		const preferredTags = Array.from(new Set(userPosts.flatMap(p => p.hashtags.map(h => h.name))));

		posts = await db.post.findMany({
			where: {
				OR: [
					{ authorId: { in: followingIds } },
					{ hashtags: { some: { name: { in: preferredTags } } } },
					{ status: "PUBLISHED" }
				],
				status: "PUBLISHED",
				createdAt: {
					gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
				}
			},
			take: 20,
			include: {
				author: {
					select: { id: true, name: true, email: true, username: true, image: true, role: true },
				},
				_count: { select: { comments: true } },
			},
			orderBy: [{ createdAt: "desc" }, { id: "desc" }],
		});
	} else {
		posts = await db.post.findMany({
			where: {
				OR: [
					{ status: "PUBLISHED" },
					{ authorId: session.user.id },
				],
			},
			take: 20,
			include: {
				author: {
					select: { id: true, name: true, email: true, username: true, image: true, role: true },
				},
				_count: { select: { comments: true } },
			},
			orderBy: [{ createdAt: "desc" }, { id: "desc" }],
		});
	}

	const { isAllowed, reason } = await checkPostingPermission(session);

	return (
		<div className="flex min-h-screen flex-col bg-[#F4F2EE] dark:bg-[#000000] font-sans selection:bg-blue-100 dark:selection:bg-blue-900/40">
			<SocialHeader />

			<div className="container mx-auto max-w-7xl px-4 py-8 flex items-start gap-6 lg:gap-8">
				<SocialSidebar />

				<main className="flex-1 max-w-2xl mx-auto lg:mx-0 space-y-6">
					<PostEditor
						user={{
							name: session.user.name,
							image: session.user.image ?? null,
						}}
						isAllowedToPost={isAllowed}
						restrictionReason={reason}
					/>

					<div className="flex items-center border-b dark:border-zinc-800">
						<Link
							href="/feed"
							className={`flex-1 py-3 text-center text-xs font-black uppercase tracking-widest transition-all ${
								feed === "all"
									? "text-blue-600 border-b-2 border-blue-600"
									: "text-muted-foreground hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-50 dark:hover:bg-zinc-900/50"
							}`}
						>
							<div className="flex items-center justify-center gap-2">
								<LayoutDashboard className="h-3.5 w-3.5" />
								All Scoops
							</div>
						</Link>
						<Link
							href="/feed?feed=discovery"
							className={`flex-1 py-3 text-center text-xs font-black uppercase tracking-widest transition-all ${
								feed === "discovery"
									? "text-blue-600 border-b-2 border-blue-600"
									: "text-muted-foreground hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-50 dark:hover:bg-zinc-900/50"
							}`}
						>
							<div className="flex items-center justify-center gap-2">
								<Sparkles className="h-3.5 w-3.5" />
								For You
							</div>
						</Link>
					</div>

					<PostFeed
						initialPosts={JSON.parse(JSON.stringify(posts))}
						isStaff={isStaff}
					/>
				</main>

				<AsidePanel />
			</div>
		</div>
	);
}
