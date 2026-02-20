import { describe, expect, it, vi } from "vitest";
import { CidrCache } from "./cidr-cache";

describe("CidrCache", () => {
	it("should initialize empty and expired", () => {
		const cache = new CidrCache();
		expect(cache.isEmpty()).toBe(true);
		expect(cache.isExpired()).toBe(true);
		expect(cache.size()).toBe(0);
	});

	it("should store and match exact IP address", () => {
		const cache = new CidrCache();
		cache.setRanges(["192.168.1.1"]);

		expect(cache.isEmpty()).toBe(false);
		expect(cache.size()).toBe(1);
		expect(cache.check("192.168.1.1")).toBe(true);
		expect(cache.check("192.168.1.2")).toBe(false);
	});

	it("should store and match within CIDR range", () => {
		const cache = new CidrCache();
		cache.setRanges(["192.168.1.0/24", "10.0.0.0/8"]);

		expect(cache.check("192.168.1.50")).toBe(true);
		expect(cache.check("10.5.5.5")).toBe(true);
		expect(cache.check("172.16.0.1")).toBe(false);
	});

	it("should match IPv6 CIDR range", () => {
		const cache = new CidrCache();
		cache.setRanges(["2001:db8::/32"]);

		expect(cache.check("2001:db8::1")).toBe(true);
		expect(cache.check("2001:db9::1")).toBe(false);
	});

	it("should handle mixed IPv4 and IPv6", () => {
		const cache = new CidrCache();
		cache.setRanges(["192.168.1.0/24", "2001:db8::/32"]);

		expect(cache.check("192.168.1.1")).toBe(true);
		expect(cache.check("2001:db8::1")).toBe(true);
	});

	it("should respect TTL expiration", () => {
		vi.useFakeTimers();
		const ttlMs = 5 * 60 * 1000;
		const cache = new CidrCache(ttlMs);
		const _now = Date.now();

		cache.setRanges(["192.168.1.1"]);
		expect(cache.isExpired()).toBe(false);

		// Advance time by 4 minutes (not expired)
		vi.advanceTimersByTime(4 * 60 * 1000);
		expect(cache.isExpired()).toBe(false);

		// Advance time past 5 minutes (expired)
		vi.advanceTimersByTime(1 * 60 * 1000 + 1);
		expect(cache.isExpired()).toBe(true);

		vi.useRealTimers();
	});

	it("should handle invalid CIDR ranges gracefully", () => {
		const cache = new CidrCache();
		cache.setRanges(["invalid-cidr", "1.2.3.0/24"]);

		expect(cache.size()).toBe(1); // Only valid CIDR is cached
		expect(cache.check("1.2.3.4")).toBe(true);
	});

	it("should handle invalid check IP address gracefully", () => {
		const cache = new CidrCache();
		cache.setRanges(["1.2.3.0/24"]);
		expect(cache.check("not-an-ip")).toBe(false);
	});

	it("should clear the cache", () => {
		const cache = new CidrCache();
		cache.setRanges(["1.1.1.1"]);
		expect(cache.size()).toBe(1);

		cache.clear();
		expect(cache.size()).toBe(0);
		expect(cache.isExpired()).toBe(true);
		expect(cache.check("1.1.1.1")).toBe(false);
	});

	it("should handle IPv4-mapped IPv6 normalization", () => {
		const cache = new CidrCache();
		cache.setRanges(["192.168.1.1"]);
		// Check with IPv4-mapped IPv6
		expect(cache.check("::ffff:192.168.1.1")).toBe(true);
	});
});
