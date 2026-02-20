import { describe, expect, it, vi } from "vitest";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { GET } from "./route";

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

vi.mock("@/lib/prisma", () => ({
	prisma: {
		post: {
			findMany: vi.fn(),
		},
	},
}));

describe("API: GET /api/admin/moderation/posts", () => {
	it("should return 401 if no session is found", async () => {
		vi.mocked(auth.api.getSession).mockResolvedValue(null);

		const response = await GET(new Request("http://localhost"));
		const data = await response.json();

		expect(response.status).toBe(401);
		expect(data.error).toBe("Unauthorized");
	});

	it("should return 403 if user is not admin or moderator", async () => {
		vi.mocked(auth.api.getSession).mockResolvedValue({
			user: { role: "USER" },
			session: {},
		} as any);

		const response = await GET(new Request("http://localhost"));
		const data = await response.json();

		expect(response.status).toBe(403);
		expect(data.error).toContain("Admin or Moderator access required");
	});

	it("should return flagged posts for authorized user", async () => {
		vi.mocked(auth.api.getSession).mockResolvedValue({
			user: { role: "MODERATOR" },
			session: {},
		} as any);

		const mockPosts = [
			{
				id: "1",
				content: "toxic",
				status: "FLAGGED",
				author: { name: "User 1" },
			},
		];
		vi.mocked(prisma.post.findMany).mockResolvedValue(mockPosts as any);

		const response = await GET(new Request("http://localhost"));
		const data = await response.json();

		expect(response.status).toBe(200);
		expect(data).toEqual(mockPosts);
		expect(prisma.post.findMany).toHaveBeenCalledWith(
			expect.objectContaining({
				where: { status: "FLAGGED" },
			}),
		);
	});
});
