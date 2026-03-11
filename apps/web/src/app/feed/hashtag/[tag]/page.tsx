import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AsidePanel } from "@/components/social/aside-panel";
import { SocialHeader } from "@/components/social/header";
import { PostFeed } from "@/components/social/post-feed";
import { SocialSidebar } from "@/components/social/sidebar";
import { auth } from "@/lib/auth";
import db from "@/lib/prisma";
import { Hash } from "lucide-react";

export default async function HashtagFeedPage({
	params,
}: {
	params: Promise<{ tag: string }>;
}) {
	const { tag } = await params;
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) {
		redirect("/");
	}

	const isStaff =
		session.user.role === "ADMIN" || session.user.role === "MODERATOR";

	const initialPosts = await db.post.findMany({
		where: {
			hashtags: {
				some: {
					name: tag.toLowerCase(),
				},
			},
			status: isStaff ? undefined : "PUBLISHED",
		},
		take: 20,
		include: {
			author: {
				select: {
					id: true,
					name: true,
					username: true,
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
		orderBy: [{ createdAt: "desc" }, { id: "desc" }],
	});

	return (
		<div className="flex min-h-screen flex-col bg-[#F4F2EE] dark:bg-[#000000] font-sans">
			<SocialHeader />

			<div className="container mx-auto max-w-7xl px-4 py-8 flex items-start gap-6 lg:gap-8">
				<SocialSidebar />

				<main className="flex-1 max-w-2xl mx-auto lg:mx-0 space-y-6">
					<div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border-none flex items-center gap-4">
						<div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl">
							<Hash className="h-8 w-8 text-blue-600" />
						</div>
						<div>
							<h1 className="text-2xl font-black">#{tag}</h1>
							<p className="text-sm text-muted-foreground">
								Discover all scoops tagged with #{tag}
							</p>
						</div>
					</div>

					<PostFeed
						initialPosts={JSON.parse(JSON.stringify(initialPosts))}
						isStaff={isStaff}
						hashtag={tag}
					/>
				</main>

				<AsidePanel />
			</div>
		</div>
	);
}
