import { ReactionType } from "@prisma/client";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { checkPostingPermission } from "@/lib/permissions";
import db from "@/lib/prisma";

export async function POST(
	req: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	const { id: commentId } = await params;
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
		const { type = ReactionType.LIKE } = await req.json().catch(() => ({}));

		const existingLike = await db.commentLike.findUnique({
			where: {
				userId_commentId: {
					userId: session.user.id,
					commentId,
				},
			},
		});

		if (existingLike) {
			if (existingLike.type === type) {
				// Unlike
				await db.commentLike.delete({
					where: {
						userId_commentId: {
							userId: session.user.id,
							commentId,
						},
					},
				});
				return NextResponse.json({ liked: false });
			} else {
				// Change reaction type
				await db.commentLike.update({
					where: {
						userId_commentId: {
							userId: session.user.id,
							commentId,
						},
					},
					data: { type },
				});
				return NextResponse.json({ liked: true, type });
			}
		} else {
			// Like
			await db.commentLike.create({
				data: {
					userId: session.user.id,
					commentId,
					type,
				},
			});
			return NextResponse.json({ liked: true, type });
		}
	} catch (error) {
		console.error("[COMMENT_LIKE]", error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}
