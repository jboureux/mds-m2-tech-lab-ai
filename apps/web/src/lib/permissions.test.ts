import { headers } from "next/headers";
import { describe, expect, it, vi } from "vitest";
import { checkPostingPermission } from "./permissions";

vi.mock("next/headers", () => ({
	headers: vi.fn(),
}));

describe("checkPostingPermission", () => {
	it("should return isAllowed: false if no session", async () => {
		const result = await checkPostingPermission(null);
		expect(result.isAllowed).toBe(false);
		expect(result.reason).toBe("Unauthorized");
	});

	it("should return isAllowed: false if user is banned", async () => {
		const session = {
			// biome-ignore lint/suspicious/noExplicitAny: mocking session for tests
			user: { role: "ADMIN", banned: true, banExpires: null } as any,
			// biome-ignore lint/suspicious/noExplicitAny: mocking session for tests
			session: {} as any,
		};

		// biome-ignore lint/suspicious/noExplicitAny: mocking headers for tests
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
			// biome-ignore lint/suspicious/noExplicitAny: mocking session for tests
			user: { role: "ADMIN", banned: true, banExpires: expiredDate } as any,
			// biome-ignore lint/suspicious/noExplicitAny: mocking session for tests
			session: {} as any,
		};

		// biome-ignore lint/suspicious/noExplicitAny: mocking headers for tests
		(headers as any).mockResolvedValue(
			new Map([["x-network-location", "on-campus"]]),
		);

		const result = await checkPostingPermission(session);
		expect(result.isAllowed).toBe(true);
	});

	it("should return isAllowed: true for ADMIN regardless of location", async () => {
		const session = {
			// biome-ignore lint/suspicious/noExplicitAny: mocking session for tests
			user: { role: "ADMIN", banned: false } as any,
			// biome-ignore lint/suspicious/noExplicitAny: mocking session for tests
			session: {} as any,
		};

		// biome-ignore lint/suspicious/noExplicitAny: mocking headers for tests
		(headers as any).mockResolvedValue(
			new Map([["x-network-location", "off-campus"]]),
		);

		const result = await checkPostingPermission(session);
		expect(result.isAllowed).toBe(true);
	});

	it("should return isAllowed: true for MODERATOR regardless of location", async () => {
		const session = {
			// biome-ignore lint/suspicious/noExplicitAny: mocking session for tests
			user: { role: "MODERATOR", banned: false } as any,
			// biome-ignore lint/suspicious/noExplicitAny: mocking session for tests
			session: {} as any,
		};

		// biome-ignore lint/suspicious/noExplicitAny: mocking headers for tests
		(headers as any).mockResolvedValue(
			new Map([["x-network-location", "off-campus"]]),
		);

		const result = await checkPostingPermission(session);
		expect(result.isAllowed).toBe(true);
	});

	it("should return isAllowed: true for USER on-campus", async () => {
		const session = {
			// biome-ignore lint/suspicious/noExplicitAny: mocking session for tests
			user: { role: "USER", banned: false } as any,
			// biome-ignore lint/suspicious/noExplicitAny: mocking session for tests
			session: {} as any,
		};

		// biome-ignore lint/suspicious/noExplicitAny: mocking headers for tests
		(headers as any).mockResolvedValue(
			new Map([["x-network-location", "on-campus"]]),
		);

		const result = await checkPostingPermission(session);
		expect(result.isAllowed).toBe(true);
	});

	it("should return isAllowed: false for USER off-campus", async () => {
		const session = {
			// biome-ignore lint/suspicious/noExplicitAny: mocking session for tests
			user: { role: "USER", banned: false } as any,
			// biome-ignore lint/suspicious/noExplicitAny: mocking session for tests
			session: {} as any,
		};

		// biome-ignore lint/suspicious/noExplicitAny: mocking headers for tests
		(headers as any).mockResolvedValue(
			new Map([["x-network-location", "off-campus"]]),
		);

		const result = await checkPostingPermission(session);
		expect(result.isAllowed).toBe(false);
		expect(result.reason).toContain("campus");
	});
});
