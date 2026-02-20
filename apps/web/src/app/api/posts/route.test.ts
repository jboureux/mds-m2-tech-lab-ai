import type { Post } from "@prisma/client";
import { describe, expect, it, vi } from "vitest";
import { auth } from "@/lib/auth";
import db from "@/lib/prisma";
import { GET } from "./route";

vi.mock("@/lib/prisma", () => ({
	default: {
		post: {
			findMany: vi.fn(),
		},
		bannedWord: {
			findMany: vi.fn(),
		},
	},
}));

vi.mock("@/lib/auth", () => ({
	auth: {
		api: {
			getSession: vi.fn(),
		},
	},
}));

vi.mock("@/lib/permissions", () => ({
	checkPostingPermission: vi.fn(),
}));

vi.mock("next/headers", () => ({
	headers: vi.fn(() => Promise.resolve(new Headers())),
}));

describe("API: GET /api/posts", () => {
	it("should return paginated posts", async () => {
		const mockPosts = [
			{ id: "1", content: "Post 1", createdAt: new Date() },
			{ id: "2", content: "Post 2", createdAt: new Date() },
		] as Post[];

		vi.mocked(auth.api.getSession).mockResolvedValue(null);
		vi.mocked(db.post.findMany).mockResolvedValue(mockPosts);

		const req = new Request("http://localhost/api/posts?limit=2");
		const response = await GET(req);
		const data = await response.json();

		expect(response.status).toBe(200);
		expect(data.items).toHaveLength(2);
		expect(data.nextCursor).toBe("2");
		expect(db.post.findMany).toHaveBeenCalledWith(
			expect.objectContaining({
				take: 2,
				skip: 0,
				cursor: undefined,
			}),
		);
	});

	it("should handle cursor pagination", async () => {
		const mockPosts = [
			{ id: "3", content: "Post 3", createdAt: new Date() },
		] as Post[];

		vi.mocked(auth.api.getSession).mockResolvedValue(null);
		vi.mocked(db.post.findMany).mockResolvedValue(mockPosts);

		const req = new Request("http://localhost/api/posts?limit=1&cursor=2");
		const response = await GET(req);
		const data = await response.json();

		expect(response.status).toBe(200);
		expect(data.items).toHaveLength(1);
		expect(data.nextCursor).toBe("3");
		expect(db.post.findMany).toHaveBeenCalledWith(
			expect.objectContaining({
				take: 1,
				skip: 1,
				cursor: { id: "2" },
			}),
		);
	});

	it("should return null nextCursor if fewer items than limit", async () => {
		const mockPosts = [
			{ id: "1", content: "Post 1", createdAt: new Date() },
		] as Post[];

		vi.mocked(auth.api.getSession).mockResolvedValue(null);
		vi.mocked(db.post.findMany).mockResolvedValue(mockPosts);

		const req = new Request("http://localhost/api/posts?limit=10");
		const response = await GET(req);
		const data = await response.json();

		expect(data.nextCursor).toBeNull();
	});
});
