import type { User } from "better-auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/lib/prisma";
import { slugify } from "@/lib/utils";

export async function POST(req: Request) {
	try {
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const body = await req.json();
		const { id, name, username, bio } = body;

		const currentUser = session.user as User & { username?: string; role?: string };
		const isAdmin = currentUser.role === "ADMIN";

		// If no ID provided, default to current user
		const targetUserId = id || currentUser.id;
		const isUpdatingSelf = targetUserId === currentUser.id;

		// Only admins can update other users
		if (!isUpdatingSelf && !isAdmin) {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 });
		}

		// Data to update
		const updateData: { bio?: string; name?: string; username?: string } = {};

		// Bio can be updated by anyone (if it's their own profile or they are admin)
		if (typeof bio === "string") {
			updateData.bio = bio;
		}

		// Name and Username can ONLY be updated by admins via this API
		// Note: The self-service ProfileForm only sends 'bio' now.
		if (isAdmin) {
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
				const existingUser = await db.user.findFirst({
					where: {
						username: targetUsername,
						id: { not: targetUserId },
					},
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

		if (Object.keys(updateData).length === 0) {
			return NextResponse.json({ message: "No changes to update" });
		}

		const updatedUser = await db.user.update({
			where: { id: targetUserId },
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
