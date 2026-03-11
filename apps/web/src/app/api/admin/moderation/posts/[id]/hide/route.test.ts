import { describe, expect, it, vi } from "vitest";
import { auth } from "@/lib/auth";
import db from "@/lib/prisma";
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
	default: {
		post: {
			update: vi.fn(),
		},
	},
}));

describe("API: POST /api/admin/moderation/posts/[id]/hide", () => {
	it("should successfully hide a post", async () => {
		vi.mocked(auth.api.getSession).mockResolvedValue({
			user: { role: "ADMIN" },
			session: {},
		} as any);

		const mockPost = { id: "1", status: "HIDDEN" };
		vi.mocked(db.post.update).mockResolvedValue(mockPost as any);

		const params = Promise.resolve({ id: "1" });
		const response = await POST(new Request("http://localhost"), { params });
		const data = await response.json();

		expect(response.status).toBe(200);
		expect(data.message).toBe("Post hidden");
		expect(db.post.update).toHaveBeenCalledWith({
			where: { id: "1" },
			data: { status: "HIDDEN" },
		});
	});
});
