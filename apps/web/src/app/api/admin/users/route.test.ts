import { Role } from "@prisma/client";
import { describe, expect, it, vi } from "vitest";
import { auth } from "@/lib/auth";
import { preRegisterUser } from "@/lib/user-management";
import { POST } from "./route";

// Mock dependencies
vi.mock("next/headers", () => ({
	headers: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
	auth: {
		api: {
			getSession: vi.fn(),
		},
	},
}));

vi.mock("@/lib/user-management", () => ({
	preRegisterUser: vi.fn(),
}));

describe("API: POST /api/admin/users", () => {
	it("should return 401 if no session is found", async () => {
		vi.mocked(auth.api.getSession).mockResolvedValue(null);

		const req = new Request("http://localhost/api/admin/users", {
			method: "POST",
		});

		const response = await POST(req);
		const data = await response.json();

		expect(response.status).toBe(401);
		expect(data.error).toBe("Unauthorized");
	});

	it("should return 403 if user is not an admin", async () => {
		vi.mocked(auth.api.getSession).mockResolvedValue({
			user: { role: "USER" },
			session: {},
			// biome-ignore lint/suspicious/noExplicitAny: Mocking session
		} as any);

		const req = new Request("http://localhost/api/admin/users", {
			method: "POST",
		});

		const response = await POST(req);
		const data = await response.json();

		expect(response.status).toBe(403);
		expect(data.error).toContain("Admin access required");
	});

	it("should return 400 if email is invalid", async () => {
		vi.mocked(auth.api.getSession).mockResolvedValue({
			user: { role: "ADMIN" },
			session: {},
			// biome-ignore lint/suspicious/noExplicitAny: Mocking session
		} as any);

		const req = new Request("http://localhost/api/admin/users", {
			method: "POST",
			body: JSON.stringify({ email: "invalid-email" }),
		});

		const response = await POST(req);
		const data = await response.json();

		expect(response.status).toBe(400);
		expect(data.error).toContain("valid email address is required");
	});

	it("should return 400 if role is invalid", async () => {
		vi.mocked(auth.api.getSession).mockResolvedValue({
			user: { role: "ADMIN" },
			session: {},
			// biome-ignore lint/suspicious/noExplicitAny: Mocking session
		} as any);

		const req = new Request("http://localhost/api/admin/users", {
			method: "POST",
			body: JSON.stringify({ email: "test@example.com", role: "GHOST" }),
		});

		const response = await POST(req);
		const data = await response.json();

		expect(response.status).toBe(400);
		expect(data.error).toContain("Invalid role provided");
	});

	it("should successfully create a user and return 200", async () => {
		vi.mocked(auth.api.getSession).mockResolvedValue({
			user: { role: "ADMIN" },
			session: {},
			// biome-ignore lint/suspicious/noExplicitAny: Mocking session
		} as any);

		const mockUser = {
			id: "1",
			email: "newuser@example.com",
			firstName: "New",
			lastName: "User",
			role: Role.MODERATOR,
		};
		// biome-ignore lint/suspicious/noExplicitAny: Mocking return value
		vi.mocked(preRegisterUser).mockResolvedValue(mockUser as any);

		const req = new Request("http://localhost/api/admin/users", {
			method: "POST",
			body: JSON.stringify({
				email: "newuser@example.com",
				firstName: "New",
				lastName: "User",
				role: "MODERATOR",
			}),
		});

		const response = await POST(req);
		const data = await response.json();

		expect(response.status).toBe(200);
		expect(data.user).toEqual(mockUser);
		expect(preRegisterUser).toHaveBeenCalledWith({
			email: "newuser@example.com",
			firstName: "New",
			lastName: "User",
			role: Role.MODERATOR,
		});
	});
});
