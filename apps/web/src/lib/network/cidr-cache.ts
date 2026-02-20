import ipaddr from "ipaddr.js";

type ParsedRange =
	| {
			type: "cidr";
			range: [ipaddr.IPv4 | ipaddr.IPv6, number];
	  }
	| {
			type: "exact";
			address: ipaddr.IPv4 | ipaddr.IPv6;
	  };

/**
 * Efficiently caches and checks IP addresses against CIDR ranges.
 * Pre-parses CIDR strings and caches them in a Map to avoid redundant parsing.
 */
export class CidrCache {
	private ranges: Map<string, ParsedRange> = new Map();
	private expiresAt = 0;
	private ttl: number;

	/**
	 * @param ttlMs - Time to live in milliseconds (default: 5 minutes)
	 */
	constructor(ttlMs: number = 5 * 60 * 1000) {
		this.ttl = ttlMs;
	}

	/**
	 * Updates the cache with a new set of CIDR ranges or exact IPs.
	 *
	 * @param rangeStrings - Array of CIDR strings (e.g., "192.168.1.0/24") or exact IPs
	 */
	setRanges(rangeStrings: string[]): void {
		// Clear old ranges for a fresh state
		this.ranges.clear();

		for (const str of rangeStrings) {
			try {
				if (str.includes("/")) {
					this.ranges.set(str, {
						type: "cidr" as const,
						range: ipaddr.parseCIDR(str),
					});
				} else {
					this.ranges.set(str, {
						type: "exact" as const,
						address: ipaddr.process(str),
					});
				}
			} catch (_e) {
				// Skip invalid range strings
			}
		}

		this.expiresAt = Date.now() + this.ttl;
	}

	/**
	 * Returns true if the cache has expired or was never set.
	 */
	isExpired(): boolean {
		return Date.now() >= this.expiresAt;
	}

	/**
	 * Returns true if the cache is empty.
	 */
	isEmpty(): boolean {
		return this.ranges.size === 0;
	}

	/**
	 * Checks if an IP address is within any of the cached ranges.
	 *
	 * @param ip - The IP address to check
	 * @returns true if the IP is allowed, false otherwise
	 */
	check(ip: string): boolean {
		if (this.ranges.size === 0) return false;

		try {
			const addr = ipaddr.process(ip);
			const addrKind = addr.kind();
			const addrStr = addr.toString();

			for (const item of this.ranges.values()) {
				try {
					if (item.type === "cidr") {
						// match() throws if kind mismatch (IPv4 vs IPv6)
						if (item.range[0].kind() === addrKind) {
							if (addr.match(item.range)) return true;
						}
					} else {
						// toString() handles IPv4-mapped normalization
						if (addrStr === item.address.toString()) return true;
					}
				} catch (_e) {
					// Skip single range check failure and continue
				}
			}
		} catch (_e) {
			// Invalid input IP format
		}
		return false;
	}

	/**
	 * Returns the current count of cached ranges.
	 */
	size(): number {
		return this.ranges.size;
	}

	/**
	 * Clears the cache and resets expiration.
	 */
	clear(): void {
		this.ranges.clear();
		this.expiresAt = 0;
	}
}

// Singleton instance for global app use (e.g., in Middleware)
export const campusNetworkCache = new CidrCache();
