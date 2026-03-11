import { PostStatus, type Prisma } from "@prisma/client";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { extractHashtags } from "@/lib/hashtags";
import { checkToxicity, validateContent } from "@/lib/moderation";
import { checkPostingPermission } from "@/lib/permissions";
import db from "@/lib/prisma";

export async function POST(req: Request) {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { isAllowed, reason } = await checkPostingPermission(session);

	if (!isAllowed) {
		return NextResponse.json({ error: reason || "Forbidden" }, { status: 403 });
	}

	try {
		const { content } = await req.json();

		if (!content?.trim()) {
			return NextResponse.json(
				{ error: "Content is required" },
				{ status: 400 },
			);
		}

		// Use the improved moderation utility
		const isClean = await validateContent(content);

		if (!isClean) {
			return NextResponse.json(
				{ error: "Post contains forbidden content." },
				{ status: 400 },
			);
		}

		// Extract hashtags
		const tags = extractHashtags(content);

		const post = await db.post.create({
			data: {
				content,
				authorId: session.user.id,
				status: PostStatus.PUBLISHED,
				hashtags: {
					connectOrCreate: tags.map((tag) => ({
						where: { name: tag },
						create: { name: tag },
					})),
				},
			},
			include: {
				hashtags: true,
			},
		});

		// Extract mentions and link them to the post
		const mentionRegex = /\B@([a-z0-9_-]+)/gi;
		const mentions = content.match(mentionRegex);
		if (mentions) {
			const usernames = mentions.map((m: string) => m.slice(1));
			const taggedUsers = await db.user.findMany({
				where: {
					username: { in: usernames, mode: "insensitive" },
				},
				select: { id: true },
			});

			if (taggedUsers.length > 0) {
				await db.post.update({
					where: { id: post.id },
					data: {
						tags: {
							connect: taggedUsers.map((u) => ({ id: u.id })),
						},
					},
				});
			}
		}

		// Async toxicity check (fire and forget pattern)
		// Note: In serverless environments (like Vercel), this might be terminated early.
		// In Dockerized/long-running Node.js, this works fine.
		void checkToxicity(content).then(async (isToxic) => {
			if (isToxic) {
				console.log(`[MODERATION] Post ${post.id} flagged as toxic.`);
				try {
					await db.post.update({
						where: { id: post.id },
						data: {
							status: PostStatus.FLAGGED,
							isToxic: true,
						},
					});
				} catch (error) {
					console.error(`[MODERATION] Failed to flag post ${post.id}:`, error);
				}
			}
		});

		return NextResponse.json(post);
	} catch (error) {
		console.error("[POSTS_CREATE]", error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}

export async function GET(req: Request) {
	const { searchParams } = new URL(req.url);
	const limit = Number.parseInt(searchParams.get("limit") || "20", 10);
	const cursor = searchParams.get("cursor") || undefined;
	const authorId = searchParams.get("authorId") || undefined;
	const hashtag = searchParams.get("hashtag") || undefined;
	const feedType = searchParams.get("feedType") || "all";
	const likedByMe = searchParams.get("likedByMe") === "true";
	const taggedInMe = searchParams.get("taggedInMe") === "true";

	try {
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		console.log(
			`[API_POSTS_GET] Fetching posts for user ${session?.user.email || "guest"} with limit ${limit}, cursor ${cursor}, authorId ${authorId}, hashtag ${hashtag}, feedType ${feedType}, likedByMe ${likedByMe}, taggedInMe ${taggedInMe}`,
		);

		const isStaff =
			session?.user.role === "ADMIN" || session?.user.role === "MODERATOR";

		let where: Prisma.PostWhereInput = {};

		if (hashtag) {
			where = {
				hashtags: {
					some: {
						name: hashtag.toLowerCase(),
					},
				},
				status: isStaff ? undefined : { in: [PostStatus.PUBLISHED] },
			};
		} else if (likedByMe && session) {
			where = {
				likes: {
					some: {
						userId: session.user.id,
					},
				},
			};
		} else if (taggedInMe && session) {
			where = {
				tags: {
					some: {
						id: session.user.id,
					},
				},
			};
		} else if (authorId) {
			// Profile view rules
			where = {
				authorId,
				status: isStaff
					? undefined // Staff sees everything on a profile
					: session?.user.id === authorId
						? { in: [PostStatus.PUBLISHED, PostStatus.FLAGGED] } // Author sees their own published/flagged
						: PostStatus.PUBLISHED, // Others only see published
			};
		} else if (feedType === "discovery" && session) {
			// Personalized "For You" Feed
			// 1. Get followed users IDs
			const following = await db.follow.findMany({
				where: { followerId: session.user.id },
				select: { followingId: true },
			});
			const followingIds = following.map((f) => f.followingId);

			// 2. Get user's preferred hashtags (from their own posts)
			const userPosts = await db.post.findMany({
				where: { authorId: session.user.id },
				select: { hashtags: { select: { name: true } } },
				take: 50,
			});
			const preferredTags = Array.from(
				new Set(userPosts.flatMap((p) => p.hashtags.map((h) => h.name))),
			);

			where = {
				OR: [
					{ authorId: { in: followingIds } },
					{ hashtags: { some: { name: { in: preferredTags } } } },
					{ status: PostStatus.PUBLISHED }, // Fallback to all published
				],
				status: PostStatus.PUBLISHED,
				// Focus on recent content (last 7 days) if it's discovery
				createdAt: {
					gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
				},
			};
		} else {
			// Feed view rules (OR logic)
			const orConditions: Prisma.PostWhereInput[] = [
				{ status: PostStatus.PUBLISHED },
			];

			if (session) {
				// Logged-in users see their own flagged posts
				orConditions.push({
					authorId: session.user.id,
					status: { in: [PostStatus.PUBLISHED, PostStatus.FLAGGED] },
				});
			}

			if (isStaff) {
				// Staff see all flagged or hidden content for moderation
				orConditions.push({
					status: { in: [PostStatus.FLAGGED, PostStatus.HIDDEN] },
				});
			}

			where = { OR: orConditions };
		}

		const posts = await db.post.findMany({
			where,
			take: limit,
			skip: cursor ? 1 : 0,
			cursor: cursor ? { id: cursor } : undefined,
			include: {
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
			},
			orderBy: [{ createdAt: "desc" }, { id: "desc" }],
		});

		console.log(`[API_POSTS_GET] Found ${posts.length} posts`);

		const nextCursor =
			posts.length === limit ? posts[posts.length - 1].id : null;

		return NextResponse.json({
			items: posts,
			nextCursor,
		});
	} catch (error) {
		console.error("[POSTS_GET]", error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}
