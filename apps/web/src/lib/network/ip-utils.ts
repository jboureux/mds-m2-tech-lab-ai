import ipaddr from "ipaddr.js";

export interface IpDetectionConfig {
	/**
	 * Optional list of trusted proxy IP addresses or CIDR ranges.
	 * If provided, the detection will skip these IPs from the right side of the X-Forwarded-For chain.
	 * Examples: '127.0.0.1', '192.168.1.0/24', '::1'
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
 * Supports IPv4, IPv6, CIDR ranges for trusted proxies, and address normalization.
 *
 * @param headers - The request headers
 * @param config - Optional configuration for detection strategy
 * @returns The detected IP address or null if not found or invalid
 *
 * @example
 * // Expects 'remote-addr' to be injected by the web server (e.g. Nginx 'proxy_set_header Remote-Addr $remote_addr')
 * // or the runtime environment.
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
			.map((ip) => normalizeIp(ip.trim()))
			.filter((ip): ip is string => ip !== null);

		if (ips.length > 0) {
			if (trustedProxies.length === 0) {
				return ips[0];
			}

			// Traverse from right to left to find the first non-trusted IP
			for (let i = ips.length - 1; i >= 0; i--) {
				if (!isTrusted(ips[i], trustedProxies)) {
					return ips[i];
				}
			}

			// If all are trusted, return the leftmost one as a fallback
			return ips[0];
		}
	}

	// 2. Fallback to common proxy headers
	const xRealIp = headers.get("x-real-ip");
	if (xRealIp) {
		const normalized = normalizeIp(xRealIp);
		if (normalized) return normalized;
	}

	// 3. Fallback to remote-addr (often injected by load balancers or web servers)
	const remoteAddr = headers.get("remote-addr");
	if (remoteAddr) {
		const normalized = normalizeIp(remoteAddr);
		if (normalized) return normalized;
	}

	return null;
}

/**
 * Normalizes an IP address by stripping port numbers and handling IPv4-mapped IPv6 addresses.
 */
function normalizeIp(ip: string): string | null {
	let cleanIp = ip;

	// Handle IPv6 with port (e.g., [::1]:3000)
	if (ip.startsWith("[") && ip.includes("]")) {
		cleanIp = ip.split("]")[0].slice(1);
	}

	try {
		const addr = ipaddr.process(cleanIp);
		return addr.toString();
	} catch (_e) {
		return null;
	}
}

/**
 * Checks if an IP is within the list of trusted proxies or CIDR ranges.
 */
function isTrusted(ip: string, trustedProxies: string[]): boolean {
	try {
		const addr = ipaddr.process(ip);
		for (const proxy of trustedProxies) {
			if (proxy.includes("/")) {
				const range = ipaddr.parseCIDR(proxy);
				if (addr.match(range)) return true;
			} else {
				const proxyAddr = ipaddr.process(proxy);
				if (addr.toString() === proxyAddr.toString()) return true;
			}
		}
	} catch (_e) {
		// Ignore parsing errors for individual trusted proxies
	}
	return false;
}
