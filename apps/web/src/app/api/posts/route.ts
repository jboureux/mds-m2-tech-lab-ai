import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
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

		const post = await db.post.create({
			data: {
				content,
				authorId: session.user.id,
				status: "PUBLISHED",
			},
		});

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
							status: "FLAGGED",
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

	try {
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		console.log(
			`[API_POSTS_GET] Fetching posts for user ${session?.user.email || "guest"} with limit ${limit}, cursor ${cursor}, authorId ${authorId}`,
		);

		const posts = await db.post.findMany({
			where: authorId
				? {
						authorId,
						status:
							session?.user.id === authorId ||
							session?.user.role === "ADMIN" ||
							session?.user.role === "MODERATOR"
								? undefined
								: "PUBLISHED",
					}
				: {
						OR: [
							{ status: "PUBLISHED" },
							...(session ? [{ authorId: session.user.id }] : []),
						],
					},
			take: limit,
			skip: cursor ? 1 : 0,
			cursor: cursor ? { id: cursor } : undefined,
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
