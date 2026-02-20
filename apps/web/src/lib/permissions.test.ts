import type { Session, User } from "better-auth";
import { headers } from "next/headers";
import { describe, expect, it, vi } from "vitest";
import { checkPostingPermission } from "./permissions";

// Mock next/headers
vi.mock("next/headers", () => ({
	headers: vi.fn(),
}));

describe("checkPostingPermission", () => {
	it("should return isAllowed: false if no session is provided", async () => {
		const result = await checkPostingPermission(null);
		expect(result.isAllowed).toBe(false);
		expect(result.reason).toBe("Unauthorized");
	});

	it("should return isAllowed: false if user is banned", async () => {
		const session = {
			user: { role: "ADMIN", banned: true, banExpires: null } as any,
			session: {} as any,
		};

		(headers as any).mockResolvedValue(
			new Map([["x-network-location", "on-campus"]]),
		);

		const result = await checkPostingPermission(session);
		expect(result.isAllowed).toBe(false);
		expect(result.reason).toContain("banned");
	});

	it("should return isAllowed: true if user ban has expired", async () => {
		const expiredDate = new Date();
		expiredDate.setDate(expiredDate.getDate() - 1); // Yesterday

		const session = {
			user: { role: "ADMIN", banned: true, banExpires: expiredDate } as any,
			session: {} as any,
		};

		(headers as any).mockResolvedValue(
			new Map([["x-network-location", "on-campus"]]),
		);

		const result = await checkPostingPermission(session);
		expect(result.isAllowed).toBe(true);
	});

	it("should return isAllowed: true for ADMIN regardless of location", async () => {
		const session = {
			user: { role: "ADMIN" } as unknown as User,
			session: {} as unknown as Session,
		};

		vi.mocked(headers).mockResolvedValue(
			new Headers({ "x-network-location": "off-campus" }),
		);

		const result = await checkPostingPermission(session);
		expect(result.isAllowed).toBe(true);
	});

	it("should return isAllowed: true for VIP regardless of location", async () => {
		const session = {
			user: { role: "VIP" } as unknown as User,
			session: {} as unknown as Session,
		};

		vi.mocked(headers).mockResolvedValue(
			new Headers({ "x-network-location": "off-campus" }),
		);

		const result = await checkPostingPermission(session);
		expect(result.isAllowed).toBe(true);
	});

	it("should return isAllowed: true for USER on-campus", async () => {
		const session = {
			user: { role: "USER" } as unknown as User,
			session: {} as unknown as Session,
		};

		vi.mocked(headers).mockResolvedValue(
			new Headers({ "x-network-location": "on-campus" }),
		);

		const result = await checkPostingPermission(session);
		expect(result.isAllowed).toBe(true);
	});

	it("should return isAllowed: false for USER off-campus", async () => {
		const session = {
			user: { role: "USER" } as unknown as User,
			session: {} as unknown as Session,
		};

		vi.mocked(headers).mockResolvedValue(
			new Headers({ "x-network-location": "off-campus" }),
		);

		const result = await checkPostingPermission(session);
		expect(result.isAllowed).toBe(false);
		expect(result.reason).toContain("School Wi-Fi");
	});

	it("should default to off-campus if header is missing", async () => {
		const session = {
			user: { role: "USER" } as unknown as User,
			session: {} as unknown as Session,
		};

		vi.mocked(headers).mockResolvedValue(new Headers());

		const result = await checkPostingPermission(session);
		expect(result.isAllowed).toBe(false);
	});
});
