import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { campusNetworkCache } from "@/lib/network/cidr-cache";
import { getClientIp } from "@/lib/network/ip-utils";

/**
 * Ensures allowed IP ranges are cached and fresh.
 * Fetches via internal API to avoid Prisma overhead in Middleware.
 */
async function refreshAllowedRangesCache(origin: string) {
	if (!campusNetworkCache.isExpired() && !campusNetworkCache.isEmpty()) {
		return;
	}

	try {
		// Fetch from our internal API (which runs in Node.js and has Prisma access)
		const response = await fetch(`${origin}/api/network/allowed-ips`, {
			next: {
				revalidate: 300, // 5 minutes revalidation
				tags: ["allowed-ips"],
			},
		} as RequestInit & { next: { revalidate: number; tags: string[] } });

		if (response.ok) {
			const ranges: string[] = await response.json();
			campusNetworkCache.setRanges(ranges);
		}
	} catch (error) {
		// Log error but don't crash the middleware
		console.error(
			"[Middleware] Failed to refresh allowed IP ranges cache:",
			error,
		);
	}
}

export default async function middleware(request: NextRequest) {
	// Skip proxy logic for API network route to avoid infinite loop
	if (request.nextUrl.pathname.startsWith("/api/network/allowed-ips")) {
		return NextResponse.next();
	}

	// 1. Detect Client IP
	const ip = getClientIp(request.headers);

	let networkLocation: "on-campus" | "off-campus" = "off-campus";

	if (ip) {
		// 2. Ensure Allowed Ranges are cached (with TTL)
		await refreshAllowedRangesCache(request.nextUrl.origin);

		// 3. Verify IP against campus ranges using the efficient pre-parsed cache
		const isOnCampus = campusNetworkCache.check(ip);
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
