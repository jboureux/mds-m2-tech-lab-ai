import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getClientIp, isIpInAllowedRanges } from "@/lib/network/ip-utils";
import db from "@/lib/prisma";

// In-memory cache for CIDR ranges
let cachedAllowedRanges: string[] | null = null;
let lastCacheUpdate = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Fetches allowed IP ranges from the database with a simple in-memory cache.
 */
async function getAllowedRanges() {
	const now = Date.now();

	// Return cached value if it's still fresh
	if (cachedAllowedRanges && now - lastCacheUpdate < CACHE_TTL) {
		return cachedAllowedRanges;
	}

	try {
		// Fetch from DB
		const allowedIps = await db.allowedIP.findMany({
			select: { cidr: true },
		});

		cachedAllowedRanges = allowedIps.map((item) => item.cidr);
		lastCacheUpdate = now;
		return cachedAllowedRanges;
	} catch (error) {
		// Log error but don't crash the middleware
		console.error("[Middleware] Failed to fetch allowed IP ranges:", error);

		// Return stale cache if available, otherwise empty list
		return cachedAllowedRanges || [];
	}
}

export async function proxy(request: NextRequest) {
	// 1. Detect Client IP using the utility from issue #15
	const ip = getClientIp(request.headers);

	let networkLocation: "on-campus" | "off-campus" = "off-campus";

	if (ip) {
		// 2. Fetch Allowed Ranges from DB (with 5m caching as per GEMINI.md)
		const allowedRanges = await getAllowedRanges();

		// 3. Verify IP against campus ranges
		const isOnCampus = isIpInAllowedRanges(ip, allowedRanges);
		networkLocation = isOnCampus ? "on-campus" : "off-campus";
	}

	// 4. Inject network location into the request headers
	const requestHeaders = new Headers(request.headers);
	requestHeaders.set("x-network-location", networkLocation);
	if (ip) {
		requestHeaders.set("x-client-ip", ip);
	}

	// Create response with modified request headers
	const response = NextResponse.next({
		request: {
			headers: requestHeaders,
		},
	});

	// Also inject into response headers for visibility/debugging
	response.headers.set("x-network-location", networkLocation);
	if (ip) {
		response.headers.set("x-client-ip", ip);
	}

	return response;
}

export const config = {
	matcher: [
		/*
		 * Match all request paths except for:
		 * - api/auth (Better-Auth handles its own logic)
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 */
		"/((?!api/auth|_next/static|_next/image|favicon.ico).*)",
	],
};
