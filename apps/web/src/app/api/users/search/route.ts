import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/lib/prisma";

export async function GET(req: Request) {
	const session = await auth.api.getSession({ headers: req.headers });
	if (!session) {
		return new NextResponse("Unauthorized", { status: 401 });
	}

	const { searchParams } = new URL(req.url);
	const query = searchParams.get("q");

	if (!query || query.length < 1) {
		return NextResponse.json([]);
	}

	const users = await db.user.findMany({
		where: {
			username: {
				contains: query,
				mode: "insensitive",
			},
			banned: false,
		},
		select: {
			id: true,
			username: true,
			name: true,
			image: true,
		},
		take: 10,
	});

	return NextResponse.json(users);
}
