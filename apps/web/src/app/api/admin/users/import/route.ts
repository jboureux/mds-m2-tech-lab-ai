import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { importUsersFromCsv } from "@/lib/user-import";

export async function POST(req: Request) {
	try {
		// 1. Authenticate and check for ADMIN role
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		if (session.user.role !== "ADMIN") {
			return NextResponse.json(
				{ error: "Forbidden: Admin access required" },
				{ status: 403 },
			);
		}

		// 2. Get the CSV file from FormData
		const formData = await req.formData();
		const file = formData.get("file") as File;

		if (!file) {
			return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
		}

		if (!file.name.endsWith(".csv")) {
			return NextResponse.json(
				{ error: "Invalid file format. Please upload a CSV file." },
				{ status: 400 },
			);
		}

		// 3. Read file content
		const csvContent = await file.text();

		// 4. Import users
		const result = await importUsersFromCsv(csvContent);

		return NextResponse.json({
			message: `Successfully imported ${result.length} users.`,
			count: result.length,
		});
	} catch (error) {
		console.error("[API] Failed to import users:", error);
		const errorMessage =
			error instanceof Error ? error.message : "Internal Server Error";
		return NextResponse.json({ error: errorMessage }, { status: 500 });
	}
}
