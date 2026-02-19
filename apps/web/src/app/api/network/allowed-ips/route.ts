import { NextResponse } from "next/server";
import db from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 300; // 5 minutes

export async function GET() {
	try {
		const allowedIps = await db.allowedIP.findMany({
			select: { cidr: true },
		});

		const cidrs = allowedIps.map((item) => item.cidr);

		return NextResponse.json(cidrs, {
			headers: {
				"Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
			},
		});
	} catch (error) {
		console.error("[API] Failed to fetch allowed IP ranges:", error);
		return NextResponse.json([], { status: 500 });
	}
}
