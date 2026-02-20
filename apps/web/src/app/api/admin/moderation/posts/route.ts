import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/lib/prisma";

export async function GET(_req: Request) {
	try {
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

		const flaggedPosts = await db.post.findMany({
			where: {
				status: "FLAGGED",
			},
			include: {
				author: {
					select: {
						id: true,
						name: true,
						email: true,
						image: true,
					},
				},
			},
			orderBy: {
				createdAt: "desc",
			},
		});

		return NextResponse.json(flaggedPosts);
	} catch (error) {
		console.error(
			"[API/Admin/Moderation/Posts] Failed to fetch flagged posts:",
			error,
		);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}
