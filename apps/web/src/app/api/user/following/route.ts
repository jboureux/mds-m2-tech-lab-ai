import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/lib/prisma";

export async function GET() {
	try {
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const following = await db.follow.findMany({
			where: {
				followerId: session.user.id,
			},
			include: {
				following: {
					select: {
						id: true,
						name: true,
						username: true,
						image: true,
						role: true,
						bio: true,
					},
				},
			},
		});

		return NextResponse.json(following.map((f) => f.following));
	} catch (error) {
		console.error("[USER_FOLLOWING_GET]", error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}
