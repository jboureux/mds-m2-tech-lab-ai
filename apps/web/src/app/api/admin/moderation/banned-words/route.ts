import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/lib/prisma";

export async function GET() {
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
		const bannedWords = await db.bannedWord.findMany({
			orderBy: { word: "asc" },
		});
		return NextResponse.json(bannedWords);
	} catch (error) {
		console.error("[API/Admin/Moderation/BannedWords] Failed to fetch:", error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}

export async function POST(req: Request) {
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
		const { word } = await req.json();

		if (!word || !word.trim()) {
			return NextResponse.json({ error: "Word is required" }, { status: 400 });
		}

		const existing = await db.bannedWord.findUnique({
			where: { word: word.trim().toLowerCase() },
		});

		if (existing) {
			return NextResponse.json(
				{ error: "Word already in blocklist" },
				{ status: 400 },
			);
		}

		const bannedWord = await db.bannedWord.create({
			data: {
				word: word.trim().toLowerCase(),
			},
		});

		return NextResponse.json(bannedWord);
	} catch (error) {
		console.error(
			"[API/Admin/Moderation/BannedWords] Failed to create:",
			error,
		);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}
