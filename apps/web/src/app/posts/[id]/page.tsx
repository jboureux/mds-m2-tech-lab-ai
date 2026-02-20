import { ChevronLeft } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Comment } from "@/components/social/comment";
import { CommentForm } from "@/components/social/comment-form";
import { SocialHeader } from "@/components/social/header";
import { PostCard } from "@/components/social/post-card";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { checkPostingPermission } from "@/lib/permissions";
import db from "@/lib/prisma";

interface PostPageProps {
	params: Promise<{
		id: string;
	}>;
}

export default async function PostPage({ params }: PostPageProps) {
	const { id } = await params;
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) {
		redirect("/login");
	}

	const post = await db.post.findUnique({
		where: { id },
		include: {
			author: {
				select: {
					id: true,
					name: true,
					email: true,
					image: true,
					role: true,
				},
			},
			comments: {
				where: {
					parentId: null, // Get top-level comments first
				},
				include: {
					author: {
						select: {
							name: true,
							image: true,
							role: true,
						},
					},
					replies: {
						include: {
							author: {
								select: {
									name: true,
									image: true,
									role: true,
								},
							},
							replies: {
								include: {
									author: {
										select: {
											name: true,
											image: true,
											role: true,
										},
									},
								},
							},
						},
					},
				},
				orderBy: {
					createdAt: "desc",
				},
			},
			_count: {
				select: {
					comments: true,
				},
			},
		},
	});

	if (!post) {
		notFound();
	}

	// Security check: only author or admin/mod can see non-published posts
	const isAuthor = post.authorId === session.user.id;
	const isStaff = ["ADMIN", "MODERATOR"].includes(session.user.role as string);
	if (post.status !== "PUBLISHED" && !isAuthor && !isStaff) {
		notFound();
	}

	const { isAllowed, reason } = await checkPostingPermission(session);

	return (
		<div className="flex min-h-screen flex-col bg-[#F4F2EE] dark:bg-[#000000] font-sans">
			<SocialHeader />

			<main className="container mx-auto max-w-2xl px-4 py-8 space-y-6">
				<Button
					variant="ghost"
					size="sm"
					asChild
					className="-ml-2 gap-2 text-muted-foreground hover:text-blue-600 transition-colors"
				>
					<Link href="/feed">
						<ChevronLeft className="h-4 w-4" />
						Back to Feed
					</Link>
				</Button>

				<article>
					<PostCard post={post} isStaff={isStaff} />
				</article>

				<section className="bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-sm space-y-6">
					<div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-4">
						<h2 className="font-black text-lg">
							Discussion ({post._count.comments})
						</h2>
					</div>

					<CommentForm
						postId={post.id}
						user={{
							name: session.user.name,
							image: session.user.image ?? null,
						}}
						isAllowedToComment={isAllowed}
						restrictionReason={reason}
					/>

					<div className="space-y-4">
						{post.comments.length === 0 ? (
							<div className="text-center py-10 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-dashed">
								<p className="text-muted-foreground italic text-sm font-medium">
									No comments yet. Be the first to reply!
								</p>
							</div>
						) : (
							post.comments.map((comment) => (
								<Comment
									key={comment.id}
									comment={comment as any}
									currentUser={{
										name: session.user.name,
										image: session.user.image ?? null,
									}}
									isAllowedToComment={isAllowed}
									restrictionReason={reason}
									isStaff={isStaff}
								/>
							))
						)}
					</div>
				</section>
			</main>
		</div>
	);
}
