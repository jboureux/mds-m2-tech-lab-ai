import { isIP } from "node:net";

export interface IpDetectionConfig {
	/**
	 * Optional list of trusted proxy IP addresses.
	 * If provided, the detection will skip these IPs from the right side of the X-Forwarded-For chain.
	 */
	trustedProxies?: string[];
	/**
	 * The primary header to check for forwarded IPs.
	 * Defaults to 'x-forwarded-for'.
	 */
	proxyHeader?: string;
}

/**
 * Detects the client's IP address from request headers.
 * Supports IPv4 and IPv6.
 *
 * @param headers - The request headers
 * @param config - Optional configuration for detection strategy
 * @returns The detected IP address or null if not found or invalid
 */
export function getClientIp(
	headers: Headers,
	config: IpDetectionConfig = {},
): string | null {
	const { proxyHeader = "x-forwarded-for", trustedProxies = [] } = config;

	// 1. Check the configured proxy header (usually X-Forwarded-For)
	const forwardedFor = headers.get(proxyHeader.toLowerCase());
	if (forwardedFor) {
		const ips = forwardedFor
			.split(",")
			.map((ip) => ip.trim())
			.filter((ip) => isValidIp(ip));

		if (ips.length > 0) {
			if (trustedProxies.length === 0) {
				return ips[0];
			}

			// Traverse from right to left to find the first non-trusted IP
			for (let i = ips.length - 1; i >= 0; i--) {
				if (!trustedProxies.includes(ips[i])) {
					return ips[i];
				}
			}

			// If all are trusted, return the leftmost one as a fallback
			return ips[0];
		}
	}

	// 2. Fallback to common proxy headers
	const xRealIp = headers.get("x-real-ip");
	if (xRealIp && isValidIp(xRealIp)) return xRealIp;

	// 3. Fallback to remote-addr (often injected by load balancers or web servers)
	const remoteAddr = headers.get("remote-addr");
	if (remoteAddr && isValidIp(remoteAddr)) return remoteAddr;

	return null;
}

/**
 * Validates if a string is a valid IPv4 or IPv6 address.
 */
function isValidIp(ip: string): boolean {
	return isIP(ip) !== 0;
}
