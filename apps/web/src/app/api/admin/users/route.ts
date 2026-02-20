import { Role } from "@prisma/client";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { preRegisterUser } from "@/lib/user-management";

/**
 * POST /api/admin/users
 * Manually create (pre-register) a new user identity.
 * Restricted to users with the ADMIN role.
 *
 * Body schema:
 * {
 *   "email": "string" (required, valid email),
 *   "name": "string" (optional),
 *   "role": "ADMIN" | "MODERATOR" | "VIP" | "USER" (optional, defaults to USER)
 * }
 */
export async function POST(req: Request) {
	try {
		// 1. Authenticate and check for ADMIN role
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// TypeScript cast session as it doesn't automatically infer additional fields
		const adminSession = session as typeof session & { user: { role: string } };

		if (adminSession.user.role !== "ADMIN") {
			return NextResponse.json(
				{ error: "Forbidden: Admin access required" },
				{ status: 403 },
			);
		}

		// 2. Parse request body
		const body = await req.json();
		const { email, name, role } = body;

		// 3. Simple input validation
		if (!email || !email.includes("@")) {
			return NextResponse.json(
				{ error: "A valid email address is required." },
				{ status: 400 },
			);
		}

		// Validate role if provided
		let validatedRole: Role = Role.USER;
		if (role) {
			if (Object.values(Role).includes(role as Role)) {
				validatedRole = role as Role;
			} else {
				return NextResponse.json(
					{ error: `Invalid role provided: ${role}.` },
					{ status: 400 },
				);
			}
		}

		// 4. Manually pre-register the user
		const result = await preRegisterUser({
			email,
			name,
			role: validatedRole,
		});

		return NextResponse.json({
			message: `User ${result.email} successfully authorized.`,
			user: result,
		});
	} catch (error) {
		console.error("[API/Admin/Users] Failed to create user:", error);
		const errorMessage =
			error instanceof Error ? error.message : "Internal Server Error";
		return NextResponse.json({ error: errorMessage }, { status: 500 });
	}
}
