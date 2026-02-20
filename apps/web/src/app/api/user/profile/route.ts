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
		const { name, username, bio } = body;

		const user = session.user as User & { username?: string };
		const isStandardMember = user.role === "USER";

		// Data to update
		const updateData: { bio?: string; name?: string; username?: string } = {};

		// Bio can be updated by anyone
		if (typeof bio === "string") {
			updateData.bio = bio;
		}

		// Name and Username can only be updated by non-standard members
		if (!isStandardMember) {
			if (typeof name === "string" && name.trim()) {
				updateData.name = name;
			}

			if (typeof username === "string" && username.trim()) {
				const targetUsername = slugify(username);

				if (!targetUsername) {
					return NextResponse.json(
						{ error: "Invalid username" },
						{ status: 400 },
					);
				}

				// Check if username is already taken by another user
				if (targetUsername !== user.username) {
					const existingUser = await db.user.findUnique({
						where: { username: targetUsername },
					});

					if (existingUser) {
						return NextResponse.json(
							{ error: "Username already taken" },
							{ status: 400 },
						);
					}
					updateData.username = targetUsername;
				}
			}
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
