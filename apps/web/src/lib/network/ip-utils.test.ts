import { describe, expect, it } from "vitest";
import { getClientIp } from "./ip-utils";

describe("ip-utils", () => {
	describe("getClientIp", () => {
		it("should return null when no headers are present", () => {
			const headers = new Headers();
			expect(getClientIp(headers)).toBeNull();
		});

		it("should return IP from x-forwarded-for", () => {
			const headers = new Headers();
			headers.set("x-forwarded-for", "192.168.1.1");
			expect(getClientIp(headers)).toBe("192.168.1.1");
		});

		it("should return the first IP from x-forwarded-for list", () => {
			const headers = new Headers();
			headers.set("x-forwarded-for", "192.168.1.1, 10.0.0.1, 172.16.0.1");
			expect(getClientIp(headers)).toBe("192.168.1.1");
		});

		it("should skip trusted proxies in x-forwarded-for from the right", () => {
			const headers = new Headers();
			headers.set("x-forwarded-for", "192.168.1.1, 10.0.0.1, 172.16.0.1");
			const config = {
				trustedProxies: ["172.16.0.1", "10.0.0.1"],
			};
			expect(getClientIp(headers, config)).toBe("192.168.1.1");
		});

		it("should support IPv6 addresses", () => {
			const headers = new Headers();
			const ipv6 = "2001:db8:85a3:8d3:1319:8a2e:370:7348";
			headers.set("x-forwarded-for", ipv6);
			expect(getClientIp(headers)).toBe(ipv6);
		});

		it("should support custom proxy header", () => {
			const headers = new Headers();
			headers.set("x-client-ip", "1.2.3.4");
			const config = {
				proxyHeader: "x-client-ip",
			};
			expect(getClientIp(headers, config)).toBe("1.2.3.4");
		});

		it("should fallback to x-real-ip if x-forwarded-for is missing", () => {
			const headers = new Headers();
			headers.set("x-real-ip", "5.6.7.8");
			expect(getClientIp(headers)).toBe("5.6.7.8");
		});

		it("should fallback to remote-addr if other headers are missing", () => {
			const headers = new Headers();
			headers.set("remote-addr", "9.10.11.12");
			expect(getClientIp(headers)).toBe("9.10.11.12");
		});

		it("should ignore invalid IPs in x-forwarded-for", () => {
			const headers = new Headers();
			headers.set("x-forwarded-for", "invalid-ip, 1.1.1.1");
			expect(getClientIp(headers)).toBe("1.1.1.1");
		});

		it("should return the leftmost IP if all in x-forwarded-for are trusted", () => {
			const headers = new Headers();
			headers.set("x-forwarded-for", "1.1.1.1, 2.2.2.2");
			const config = {
				trustedProxies: ["1.1.1.1", "2.2.2.2"],
			};
			expect(getClientIp(headers, config)).toBe("1.1.1.1");
		});

		it("should normalize IPv6 addresses with port numbers", () => {
			const headers = new Headers();
			headers.set("x-forwarded-for", "[2001:db8:85a3:8d3:1319:8a2e:370:7348]:443");
			expect(getClientIp(headers)).toBe("2001:db8:85a3:8d3:1319:8a2e:370:7348");
		});

		it("should normalize IPv4-mapped IPv6 addresses", () => {
			const headers = new Headers();
			headers.set("x-forwarded-for", "::ffff:192.168.1.1");
			expect(getClientIp(headers)).toBe("192.168.1.1");
		});

		it("should support CIDR ranges for trusted proxies", () => {
			const headers = new Headers();
			headers.set("x-forwarded-for", "192.168.1.1, 10.0.0.5, 172.16.0.10");
			const config = {
				trustedProxies: ["10.0.0.0/8", "172.16.0.0/12"],
			};
			expect(getClientIp(headers, config)).toBe("192.168.1.1");
		});

		it("should support IPv6 CIDR ranges for trusted proxies", () => {
			const headers = new Headers();
			headers.set("x-forwarded-for", "2001:db8::1, fd00::1");
			const config = {
				trustedProxies: ["fd00::/8"],
			};
			expect(getClientIp(headers, config)).toBe("2001:db8::1");
		});
	});
});
