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

export default async function Home() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) {
		redirect("/");
	}

	const posts = await db.post.findMany({
		where: {
			OR: [
				{ status: "PUBLISHED" },
				{ authorId: session.user.id }, // Users can see their own pending/flagged posts
			],
		},
		take: 10,
		include: {
			author: {
				select: {
					id: true,
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
	const isStaff =
		session.user.role === "ADMIN" || session.user.role === "MODERATOR";

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
