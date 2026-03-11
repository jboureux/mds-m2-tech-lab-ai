import type { User } from "better-auth";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { PostFeed } from "@/components/social/post-feed";
import { ProfileForm } from "@/components/social/profile-form";
import { AsidePanel } from "@/components/social/server/aside-panel";
import { SocialHeader } from "@/components/social/server/header";
import { SocialSidebar } from "@/components/social/server/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { auth } from "@/lib/auth";
import db from "@/lib/prisma";

export default async function UserProfilePage({
	params,
}: {
	params: Promise<{ username: string }>;
}) {
	const { username } = await params;
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) {
		redirect("/");
	}

	const user = await db.user.findUnique({
		where: { username },
	});

	if (!user) {
		return notFound();
	}

	const isOwnProfile = session.user.id === user.id;
	const isStaff =
		session.user.role === "ADMIN" || session.user.role === "MODERATOR";

	const initialPosts = await db.post.findMany({
		where: {
			authorId: user.id,
			status: isOwnProfile || isStaff ? undefined : "PUBLISHED",
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
		},
		orderBy: [{ createdAt: "desc" }, { id: "desc" }],
	});

	const likedPosts = isOwnProfile
		? await db.post.findMany({
				where: {
					likes: {
						some: {
							userId: session.user.id,
						},
					},
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
							likes: true,
						},
					},
					likes: {
						where: {
							userId: session.user.id,
						},
						select: {
							type: true,
						},
					},
				},
				orderBy: [{ createdAt: "desc" }, { id: "desc" }],
			})
		: [];

	return (
		<div className="flex min-h-screen flex-col bg-[#F4F2EE] dark:bg-[#000000] font-sans selection:bg-blue-100 dark:selection:bg-blue-900/40">
			<SocialHeader />

			<div className="container mx-auto max-w-7xl px-4 py-8 flex items-start gap-6 lg:gap-8">
				<SocialSidebar hideCard />

				<main className="flex-1 max-w-2xl mx-auto lg:mx-0 space-y-6">
					<ProfileForm
						user={user as unknown as User}
						isOwnProfile={isOwnProfile}
					/>

					<div className="space-y-4">
						{isOwnProfile ? (
							<Tabs defaultValue="posts" className="w-full">
								<TabsList className="w-full bg-white dark:bg-zinc-900 border-none h-12 p-1 rounded-xl shadow-sm">
									<TabsTrigger
										value="posts"
										className="flex-1 rounded-lg font-black text-[10px] uppercase tracking-wider"
									>
										Your Scoops
									</TabsTrigger>
									<TabsTrigger
										value="liked"
										className="flex-1 rounded-lg font-black text-[10px] uppercase tracking-wider"
									>
										Liked Scoops
									</TabsTrigger>
								</TabsList>
								<TabsContent value="posts" className="mt-6">
									<PostFeed
										initialPosts={JSON.parse(JSON.stringify(initialPosts))}
										currentUserId={session.user.id}
										isStaff={isStaff}
										authorId={user.id}
									/>
								</TabsContent>
								<TabsContent value="liked" className="mt-6">
									<PostFeed
										initialPosts={JSON.parse(JSON.stringify(likedPosts))}
										currentUserId={session.user.id}
										isStaff={isStaff}
										likedByMe={true}
									/>
								</TabsContent>
							</Tabs>
						) : (
							<>
								<h2 className="text-xl font-black px-1">
									{user.name}'s Scoops
								</h2>
								<PostFeed
									initialPosts={JSON.parse(JSON.stringify(initialPosts))}
									currentUserId={session.user.id}
									isStaff={isStaff}
									authorId={user.id}
								/>
							</>
						)}
					</div>
				</main>

				<AsidePanel hideCard />
			</div>
		</div>
	);
}
