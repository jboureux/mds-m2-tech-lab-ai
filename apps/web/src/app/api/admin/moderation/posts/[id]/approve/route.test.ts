import { describe, expect, it, vi } from "vitest";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
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

vi.mock("@/lib/prisma", () => ({
	prisma: {
		post: {
			update: vi.fn(),
		},
	},
}));

describe("API: POST /api/admin/moderation/posts/[id]/approve", () => {
	it("should successfully approve a post", async () => {
		vi.mocked(auth.api.getSession).mockResolvedValue({
			user: { role: "ADMIN" },
			session: {},
		} as any);

		const mockPost = { id: "1", status: "PUBLISHED" };
		vi.mocked(prisma.post.update).mockResolvedValue(mockPost as any);

		const params = Promise.resolve({ id: "1" });
		const response = await POST(new Request("http://localhost"), { params });
		const data = await response.json();

		expect(response.status).toBe(200);
		expect(data.message).toBe("Post approved");
		expect(prisma.post.update).toHaveBeenCalledWith({
			where: { id: "1" },
			data: { status: "PUBLISHED", isToxic: false },
		});
	});
});
