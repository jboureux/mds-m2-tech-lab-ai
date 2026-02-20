import type { User } from "better-auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AsidePanel } from "@/components/social/aside-panel";
import { SocialHeader } from "@/components/social/header";
import { PostFeed } from "@/components/social/post-feed";
import { ProfileForm } from "@/components/social/profile-form";
import { SocialSidebar } from "@/components/social/sidebar";
import { auth } from "@/lib/auth";
import db from "@/lib/prisma";

export default async function ProfilePage() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) {
		redirect("/");
	}

	const user = session.user as User & { username?: string };

	if (user.username) {
		redirect(`/u/${user.username}`);
	}

	// If no username, show the profile form to allow setting it
	const posts = await db.post.findMany({
		where: {
			authorId: session.user.id,
		},
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

	const isStaff =
		session.user.role === "ADMIN" || session.user.role === "MODERATOR";

	return (
		<div className="flex min-h-screen flex-col bg-[#F4F2EE] dark:bg-[#000000] font-sans selection:bg-blue-100 dark:selection:bg-blue-900/40">
			<SocialHeader />

			<div className="container mx-auto max-w-7xl px-4 py-8 flex items-start gap-6 lg:gap-8">
				<SocialSidebar hideCard />

				<main className="flex-1 max-w-2xl mx-auto lg:mx-0 space-y-6">
					<ProfileForm user={session.user as User} />

					<div className="space-y-4">
						<h2 className="text-xl font-black px-1">Your Scoops</h2>
						<PostFeed
							initialPosts={JSON.parse(JSON.stringify(posts))}
							isStaff={isStaff}
							authorId={session.user.id}
						/>
					</div>
				</main>

				<AsidePanel hideCard />
			</div>
		</div>
	);
}
