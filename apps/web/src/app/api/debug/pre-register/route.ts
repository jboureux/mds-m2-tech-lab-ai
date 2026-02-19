import { Role } from "@prisma/client";
import { NextResponse } from "next/server";
import db from "@/lib/prisma";

/**
 * API route to quickly pre-register a test user in development.
 */
export async function POST(req: Request) {
	if (process.env.NODE_ENV !== "development") {
		return NextResponse.json(
			{ error: "Only available in development" },
			{ status: 403 },
		);
	}

	try {
		const { email, name, role } = await req.json();

		if (!email) {
			return NextResponse.json({ error: "Email is required" }, { status: 400 });
		}

		const user = await db.preRegisteredUser.upsert({
			where: { email },
			update: {
				name: name || "Test User",
				role: (role as Role) || Role.USER,
			},
			create: {
				email,
				name: name || "Test User",
				role: (role as Role) || Role.USER,
			},
		});

		return NextResponse.json({
			message: `User ${email} pre-registered successfully`,
			user,
		});
	} catch (error) {
		console.error("[Debug API] Failed to pre-register user:", error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}
