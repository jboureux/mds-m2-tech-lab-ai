import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/lib/prisma";

export async function DELETE(
	_req: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	const { id } = await params;
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (
		!session ||
		(session.user.role !== "ADMIN" && session.user.role !== "MODERATOR")
	) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		await db.bannedWord.delete({
			where: { id },
		});
		return NextResponse.json({ success: true });
	} catch (error) {
		console.error(
			"[API/Admin/Moderation/BannedWords] Failed to delete:",
			error,
		);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}
