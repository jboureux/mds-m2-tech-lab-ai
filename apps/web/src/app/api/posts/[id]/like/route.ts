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
		const { type = ReactionType.LIKE } = await req.json().catch(() => ({}));

		const existingLike = await db.postLike.findUnique({
			where: {
				userId_postId: {
					userId: session.user.id,
					postId,
				},
			},
		});

		if (existingLike) {
			if (existingLike.type === type) {
				// Unlike
				await db.postLike.delete({
					where: {
						userId_postId: {
							userId: session.user.id,
							postId,
						},
					},
				});
				return NextResponse.json({ liked: false });
			} else {
				// Change reaction type
				await db.postLike.update({
					where: {
						userId_postId: {
							userId: session.user.id,
							postId,
						},
					},
					data: { type },
				});
				return NextResponse.json({ liked: true, type });
			}
		} else {
			// Like
			await db.postLike.create({
				data: {
					userId: session.user.id,
					postId,
					type,
				},
			});
			return NextResponse.json({ liked: true, type });
		}
	} catch (error) {
		console.error("[POST_LIKE]", error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}
