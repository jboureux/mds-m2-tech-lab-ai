import { AtSign, LayoutDashboard, Sparkles } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PostEditor } from "@/components/social/post-editor";
import { PostFeed } from "@/components/social/post-feed";
import { AsidePanel } from "@/components/social/server/aside-panel";
import { SocialHeader } from "@/components/social/server/header";
import { SocialSidebar } from "@/components/social/server/sidebar";
import { auth } from "@/lib/auth";
import { checkPostingPermission } from "@/lib/permissions";
import db from "@/lib/prisma";

export default async function Home(props: {
	searchParams: Promise<{ feed?: string; filter?: string }>;
}) {
	const searchParams = await props.searchParams;
	const feed = searchParams.feed || "all";
	const filter = searchParams.filter;

	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) {
		redirect("/");
	}

	const isStaff =
		session.user.role === "ADMIN" || session.user.role === "MODERATOR";
	const isTaggedFilter = filter === "tagged";

	let posts: {
		id: string;
		content: string;
		status: string;
		isToxic: boolean;
		createdAt: string | Date;
		author: {
			id: string;
			name: string | null;
			email: string;
			image: string | null;
			role: string;
		};
		_count?: {
			comments: number;
			likes: number;
		};
	}[] = [];

	const commonInclude = {
		author: {
			select: {
				id: true,
				name: true,
				email: true,
				username: true,
				image: true,
				role: true,
			},
		},
		_count: {
			select: {
				comments: true,
				likes: true,
			},
		},
		likes: session
			? {
					where: {
						userId: session.user.id,
					},
					select: {
						type: true,
					},
				}
			: false,
	};

	if (isTaggedFilter) {
		posts = await db.post.findMany({
			where: {
				tags: {
					some: {
						id: session.user.id,
					},
				},
				OR: [{ status: "PUBLISHED" }, { authorId: session.user.id }],
			},
			take: 20,
			include: commonInclude,
			orderBy: [{ createdAt: "desc" }, { id: "desc" }],
		});
	} else if (feed === "discovery") {
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
		const preferredTags = Array.from(
			new Set(userPosts.flatMap((p) => p.hashtags.map((h) => h.name))),
		);

		posts = await db.post.findMany({
			where: {
				OR: [
					{ authorId: { in: followingIds } },
					{ hashtags: { some: { name: { in: preferredTags } } } },
					{ status: "PUBLISHED" },
				],
				status: "PUBLISHED",
				createdAt: {
					gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
				},
			},
			take: 20,
			include: commonInclude,
			orderBy: [{ createdAt: "desc" }, { id: "desc" }],
		});
	} else {
		posts = await db.post.findMany({
			where: {
				OR: [{ status: "PUBLISHED" }, { authorId: session.user.id }],
			},
			take: 20,
			include: commonInclude,
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
					{!isTaggedFilter && (
						<PostEditor
							user={{
								name: session.user.name,
								image: session.user.image ?? null,
							}}
							isAllowedToPost={isAllowed}
							restrictionReason={reason}
						/>
					)}

					<div className="flex items-center border-b dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-t-xl overflow-hidden shadow-sm">
						<Link
							href="/feed"
							className={`flex-1 py-3 text-center text-[10px] font-black uppercase tracking-[0.15em] transition-all ${
								feed === "all" && !isTaggedFilter
									? "text-blue-600 bg-blue-50/50 dark:bg-blue-900/10 border-b-2 border-blue-600"
									: "text-muted-foreground hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-50 dark:hover:bg-zinc-800/50"
							}`}
						>
							<div className="flex items-center justify-center gap-2">
								<LayoutDashboard className="h-3.5 w-3.5" />
								All Scoops
							</div>
						</Link>
						<Link
							href="/feed?feed=discovery"
							className={`flex-1 py-3 text-center text-[10px] font-black uppercase tracking-[0.15em] transition-all ${
								feed === "discovery" && !isTaggedFilter
									? "text-blue-600 bg-blue-50/50 dark:bg-blue-900/10 border-b-2 border-blue-600"
									: "text-muted-foreground hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-50 dark:hover:bg-zinc-800/50"
							}`}
						>
							<div className="flex items-center justify-center gap-2">
								<Sparkles className="h-3.5 w-3.5" />
								For You
							</div>
						</Link>
						<Link
							href="/feed?filter=tagged"
							className={`flex-1 py-3 text-center text-[10px] font-black uppercase tracking-[0.15em] transition-all ${
								isTaggedFilter
									? "text-blue-600 bg-blue-50/50 dark:bg-blue-900/10 border-b-2 border-blue-600"
									: "text-muted-foreground hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-50 dark:hover:bg-zinc-800/50"
							}`}
						>
							<div className="flex items-center justify-center gap-2">
								<AtSign className="h-3.5 w-3.5" />
								Tagged In
							</div>
						</Link>
					</div>

					<PostFeed
						initialPosts={JSON.parse(JSON.stringify(posts))}
						currentUserId={session.user.id}
						isStaff={isStaff}
						taggedInMe={isTaggedFilter}
					/>
				</main>

				<AsidePanel />
			</div>
		</div>
	);
}
