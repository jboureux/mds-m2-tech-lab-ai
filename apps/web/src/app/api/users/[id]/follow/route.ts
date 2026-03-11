import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/lib/prisma";

export async function POST(
	_req: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	const { id: followingId } = await params;
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const followerId = session.user.id;

	if (followerId === followingId) {
		return NextResponse.json(
			{ error: "You cannot follow yourself" },
			{ status: 400 },
		);
	}

	try {
		// Check if user to follow exists
		const userToFollow = await db.user.findUnique({
			where: { id: followingId },
		});

		if (!userToFollow) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		const follow = await db.follow.upsert({
			where: {
				followerId_followingId: {
					followerId,
					followingId,
				},
			},
			update: {}, // Nothing to update if already following
			create: {
				followerId,
				followingId,
			},
		});

		return NextResponse.json({ success: true, follow });
	} catch (error) {
		console.error("[FOLLOW_POST]", error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}

export async function DELETE(
	_req: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	const { id: followingId } = await params;
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const followerId = session.user.id;

	try {
		await db.follow.delete({
			where: {
				followerId_followingId: {
					followerId,
					followingId,
				},
			},
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		// If record not found, still return success or handle specifically
		console.error("[FOLLOW_DELETE]", error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}
