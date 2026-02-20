import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
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

		// Basic word blocklist check (simple implementation)
		const bannedWords = await db.bannedWord.findMany();
		const hasBannedWords = bannedWords.some((bw) =>
			content.toLowerCase().includes(bw.word.toLowerCase()),
		);

		if (hasBannedWords) {
			return NextResponse.json(
				{ error: "Post contains forbidden content." },
				{ status: 400 },
			);
		}

		const post = await db.post.create({
			data: {
				content,
				authorId: session.user.id,
				status: "PUBLISHED", // Default to published for now, will add moderation later
			},
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
	const limit = Number.parseInt(searchParams.get("limit") || "10", 10);
	const cursor = searchParams.get("cursor") || undefined;

	try {
		const posts = await db.post.findMany({
			where: {
				status: "PUBLISHED",
			},
			take: limit,
			skip: cursor ? 1 : 0,
			cursor: cursor ? { id: cursor } : undefined,
			include: {
				author: {
					select: {
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
