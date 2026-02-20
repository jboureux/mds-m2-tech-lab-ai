import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { checkPostingPermission } from "@/lib/permissions";
import db from "@/lib/prisma";

export async function POST(
	req: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	const { id: postId } = await params;
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
		const { content, parentId } = await req.json();

		if (!content?.trim()) {
			return NextResponse.json(
				{ error: "Comment content is required" },
				{ status: 400 },
			);
		}

		// Basic word blocklist check
		const bannedWords = await db.bannedWord.findMany();
		const hasBannedWords = bannedWords.some((bw) =>
			content.toLowerCase().includes(bw.word.toLowerCase()),
		);

		if (hasBannedWords) {
			return NextResponse.json(
				{ error: "Comment contains forbidden content." },
				{ status: 400 },
			);
		}

		const comment = await db.comment.create({
			data: {
				content,
				postId,
				authorId: session.user.id,
				parentId,
			},
			include: {
				author: {
					select: {
						name: true,
						image: true,
						role: true,
					},
				},
			},
		});

		return NextResponse.json(comment);
	} catch (error) {
		console.error("[COMMENT_CREATE]", error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}
