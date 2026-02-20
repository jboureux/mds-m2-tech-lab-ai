import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
	_req: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		if (session.user.role !== "ADMIN" && session.user.role !== "MODERATOR") {
			return NextResponse.json(
				{ error: "Forbidden: Admin or Moderator access required" },
				{ status: 403 },
			);
		}

		const post = await prisma.post.update({
			where: {
				id,
			},
			data: {
				status: "PUBLISHED",
				isToxic: false, // Reset toxic flag if approved manually
			},
		});

		return NextResponse.json({ message: "Post approved", post });
	} catch (error) {
		console.error(
			"[API/Admin/Moderation/Posts/Approve] Failed to approve post:",
			error,
		);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}
