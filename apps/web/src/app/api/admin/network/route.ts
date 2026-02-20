import ipaddr from "ipaddr.js";
import { revalidateTag } from "next/cache";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/lib/prisma";

/**
 * GET /api/admin/network
 * Retrieve all allowed IP ranges.
 * Restricted to users with the ADMIN role.
 */
export async function GET() {
	try {
		// 1. Authenticate and check for ADMIN role
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const adminSession = session as typeof session & { user: { role: string } };

		if (adminSession.user.role !== "ADMIN") {
			return NextResponse.json(
				{ error: "Forbidden: Admin access required" },
				{ status: 403 },
			);
		}

		// 2. Fetch all ranges
		const ranges = await db.allowedIP.findMany({
			orderBy: { createdAt: "desc" },
		});

		return NextResponse.json(ranges);
	} catch (error) {
		console.error("[API/Admin/Network] Failed to fetch ranges:", error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}

/**
 * POST /api/admin/network
 * Create a new allowed CIDR range.
 * Restricted to users with the ADMIN role.
 *
 * Body schema:
 * {
 *   "cidr": "string" (required, valid CIDR),
 *   "description": "string" (optional)
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

		const adminSession = session as typeof session & { user: { role: string } };

		if (adminSession.user.role !== "ADMIN") {
			return NextResponse.json(
				{ error: "Forbidden: Admin access required" },
				{ status: 403 },
			);
		}

		// 2. Parse request body
		const body = await req.json();
		const { cidr, description } = body;

		// 3. Validation
		if (!cidr) {
			return NextResponse.json(
				{ error: "CIDR range is required." },
				{ status: 400 },
			);
		}

		// Validate CIDR format using ipaddr.js
		try {
			if (cidr.includes("/")) {
				ipaddr.parseCIDR(cidr);
			} else {
				ipaddr.process(cidr);
			}
		} catch (_e) {
			return NextResponse.json(
				{ error: "Invalid CIDR format. (e.g., 192.168.1.0/24)" },
				{ status: 400 },
			);
		}

		// 4. Check for duplicates
		const existing = await db.allowedIP.findUnique({
			where: { cidr },
		});

		if (existing) {
			return NextResponse.json(
				{ error: `CIDR range ${cidr} already exists.` },
				{ status: 409 },
			);
		}

		// 5. Create the record
		const newRange = await db.allowedIP.create({
			data: { cidr, description },
		});

		// 6. Invalidate caches
		revalidateTag("allowed-ips", "default");

		return NextResponse.json({
			message: `CIDR range ${cidr} successfully added.`,
			range: newRange,
		});
	} catch (error) {
		console.error("[API/Admin/Network] Failed to add range:", error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}

/**
 * DELETE /api/admin/network
 * Remove an allowed CIDR range.
 * Restricted to users with the ADMIN role.
 *
 * Query param: ?id=xxx
 */
export async function DELETE(req: Request) {
	try {
		// 1. Authenticate and check for ADMIN role
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const adminSession = session as typeof session & { user: { role: string } };

		if (adminSession.user.role !== "ADMIN") {
			return NextResponse.json(
				{ error: "Forbidden: Admin access required" },
				{ status: 403 },
			);
		}

		// 2. Get ID from query param
		const { searchParams } = new URL(req.url);
		const id = searchParams.get("id");

		if (!id) {
			return NextResponse.json(
				{ error: "Range ID is required." },
				{ status: 400 },
			);
		}

		// 3. Delete the record
		const deletedRange = await db.allowedIP.delete({
			where: { id },
		});

		// 4. Invalidate caches
		revalidateTag("allowed-ips", "default");

		return NextResponse.json({
			message: `CIDR range ${deletedRange.cidr} successfully removed.`,
		});
	} catch (error) {
		console.error("[API/Admin/Network] Failed to remove range:", error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}

/**
 * PATCH /api/admin/network
 * Manually trigger cache revalidation for allowed IP ranges.
 * Restricted to users with the ADMIN role.
 */
export async function PATCH() {
	try {
		// 1. Authenticate and check for ADMIN role
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const adminSession = session as typeof session & { user: { role: string } };

		if (adminSession.user.role !== "ADMIN") {
			return NextResponse.json(
				{ error: "Forbidden: Admin access required" },
				{ status: 403 },
			);
		}

		// 2. Invalidate caches
		revalidateTag("allowed-ips", "default");

		return NextResponse.json({
			message: "Network cache successfully revalidated.",
		});
	} catch (error) {
		console.error("[API/Admin/Network] Failed to revalidate cache:", error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}
