import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/lib/prisma";

export async function POST(
	req: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	const { id } = await params;
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

		if (!id || id === "undefined") {
			return NextResponse.json(
				{ error: "Invalid User ID provided" },
				{ status: 400 },
			);
		}

		const body = await req.json();
		const { reason, durationInDays } = body;

		let banExpires = null;
		const days = Number.parseInt(durationInDays, 10);
		if (!Number.isNaN(days) && days > 0) {
			const now = new Date();
			banExpires = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
		}

		// Update the user record directly
		// This is consistent with how other fields are managed in this project
		const user = await db.user.update({
			where: {
				id,
			},
			data: {
				banned: true,
				banReason: reason || "Violation of community guidelines",
				banExpires,
			},
		});

		return NextResponse.json({ message: "User banned successfully", user });
	} catch (error) {
		console.error(
			`[API/Admin/Moderation/Users/Ban] Failed to ban user ${id}:`,
			error,
		);
		const errorMessage =
			error instanceof Error ? error.message : "Internal Server Error";
		return NextResponse.json({ error: errorMessage }, { status: 500 });
	}
}
