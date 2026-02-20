import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getClientIp, isIpInAllowedRanges } from "@/lib/network/ip-utils";

// In-memory cache for CIDR ranges
let cachedAllowedRanges: string[] | null = null;
let lastCacheUpdate = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Fetches allowed IP ranges via internal API with a simple in-memory cache.
 * Using fetch instead of direct Prisma because Middleware runs in Edge Runtime
 * where direct Prisma client initialization might fail or have overhead.
 */
async function getAllowedRanges(origin: string) {
	const now = Date.now();

	// Return cached value if it's still fresh
	if (cachedAllowedRanges && now - lastCacheUpdate < CACHE_TTL) {
		return cachedAllowedRanges;
	}

	try {
		// Fetch from our internal API (which runs in Node.js and has Prisma access)
		const response = await fetch(`${origin}/api/network/allowed-ips`, {
			next: { revalidate: 300 }, // 5 minutes revalidation
		});

		if (response.ok) {
			cachedAllowedRanges = await response.json();
			lastCacheUpdate = now;
		}

		return cachedAllowedRanges || [];
	} catch (error) {
		// Log error but don't crash the middleware
		console.error("[Middleware] Failed to fetch allowed IP ranges:", error);

		// Return stale cache if available, otherwise empty list
		return cachedAllowedRanges || [];
	}
}

export default async function middleware(request: NextRequest) {
	// Skip proxy logic for API network route to avoid infinite loop
	if (request.nextUrl.pathname.startsWith("/api/network/allowed-ips")) {
		return NextResponse.next();
	}

	// 1. Detect Client IP using the utility from issue #15
	const ip = getClientIp(request.headers);

	let networkLocation: "on-campus" | "off-campus" = "off-campus";

	if (ip) {
		// 2. Fetch Allowed Ranges via internal API (with caching)
		const allowedRanges = await getAllowedRanges(request.nextUrl.origin);

		// 3. Verify IP against campus ranges
		const isOnCampus = isIpInAllowedRanges(ip, allowedRanges);
		networkLocation = isOnCampus ? "on-campus" : "off-campus";
	}

	// 4. Inject headers into the request context
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
		 * - api/network/allowed-ips (internal API)
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 */
		"/((?!api/auth|api/network/allowed-ips|_next/static|_next/image|favicon.ico).*)",
	],
};
