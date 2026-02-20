import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import type { User } from "better-auth";

export async function POST(req: Request) {
	try {
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const body = await req.json();
		const { bio } = body;

		const user = session.user as User & { username?: string };

		// Data to update
		const updateData: { bio?: string } = {};

		// Bio can be updated by anyone
		if (typeof bio === "string") {
			updateData.bio = bio;
		}

		if (Object.keys(updateData).length === 0) {
			return NextResponse.json({ message: "No changes to update" });
		}

		const updatedUser = await db.user.update({
			where: { id: session.user.id },
			data: updateData,
		});

		return NextResponse.json({
			message: "Profile updated successfully",
			user: updatedUser,
		});
	} catch (error) {
		console.error("[PROFILE_UPDATE]", error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}
