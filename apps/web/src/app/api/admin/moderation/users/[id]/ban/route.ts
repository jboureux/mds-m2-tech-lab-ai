import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
	req: Request,
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

		const body = await req.json();
		const { reason, durationInDays } = body;

		let banExpires = null;
		if (durationInDays) {
			const now = new Date();
			banExpires = new Date(
				now.getTime() + durationInDays * 24 * 60 * 60 * 1000,
			);
		}

		const user = await prisma.user.update({
			where: {
				id,
			},
			data: {
				banned: true,
				banReason: reason,
				banExpires,
			},
		});

		return NextResponse.json({ message: "User banned", user });
	} catch (error) {
		console.error(
			"[API/Admin/Moderation/Users/Ban] Failed to ban user:",
			error,
		);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}
