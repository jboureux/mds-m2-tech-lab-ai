import { Comment } from "@/components/social/comment";
import { PostCard } from "@/components/social/post-card";
import { auth } from "@/lib/auth";
import db from "@/lib/prisma";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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
					name: true,
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
	const isStaff = ["ADMIN", "MODERATOR"].includes((session.user as any).role);
	if (post.status !== "PUBLISHED" && !isAuthor && !isStaff) {
		notFound();
	}

	return (
		<div className="flex min-h-screen flex-col bg-slate-50 dark:bg-black font-sans">
			<header className="sticky top-0 z-40 w-full border-b bg-white/80 dark:bg-black/80 backdrop-blur-md">
				<div className="container mx-auto flex h-16 items-center justify-between px-4 max-w-4xl">
					<Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
						<div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">M</div>
						<span className="text-xl font-bold tracking-tight">My Digital Scoop</span>
					</Link>
				</div>
			</header>

			<main className="container mx-auto max-w-2xl px-4 py-8 space-y-8">
				<Button variant="ghost" size="sm" asChild className="-ml-2 gap-2 text-muted-foreground">
					<Link href="/">
						<ChevronLeft className="h-4 w-4" />
						Back to Feed
					</Link>
				</Button>

				<article>
					<PostCard post={post} />
				</article>

				<section className="space-y-6">
					<div className="flex items-center justify-between border-b pb-4">
						<h2 className="font-semibold text-lg">Discussion ({post._count.comments})</h2>
					</div>

					<div className="space-y-4">
						{post.comments.length === 0 ? (
							<p className="text-center py-10 text-muted-foreground italic text-sm">
								No comments yet. Be the first to reply!
							</p>
						) : (
							post.comments.map((comment) => (
								<Comment key={comment.id} comment={comment as any} />
							))
						)}
					</div>
				</section>
			</main>
		</div>
	);
}
