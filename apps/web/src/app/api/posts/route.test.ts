import type { Post } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { auth } from "@/lib/auth";
import { checkPostingPermission } from "@/lib/permissions";
import db from "@/lib/prisma";
import { GET, POST } from "./route";

vi.mock("@/lib/prisma", () => ({
	default: {
		post: {
			findMany: vi.fn(),
			create: vi.fn(),
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

describe("API: POST /api/posts", () => {
	beforeEach(() => {
		vi.mocked(db.bannedWord.findMany).mockResolvedValue([]);
	});

	it("should return 401 if not authenticated", async () => {
		vi.mocked(auth.api.getSession).mockResolvedValue(null);

		const req = new Request("http://localhost/api/posts", {
			method: "POST",
			body: JSON.stringify({ content: "test" }),
		});

		const response = await POST(req);
		expect(response.status).toBe(401);
	});

	it("should return 400 if content is missing", async () => {
		vi.mocked(auth.api.getSession).mockResolvedValue({
			user: { id: "user-1" },
		} as any);
		vi.mocked(checkPostingPermission).mockResolvedValue({ isAllowed: true });

		const req = new Request("http://localhost/api/posts", {
			method: "POST",
			body: JSON.stringify({ content: "" }),
		});

		const response = await POST(req);
		expect(response.status).toBe(400);
	});

	it("should return 400 if content contains bad words", async () => {
		vi.mocked(auth.api.getSession).mockResolvedValue({
			user: { id: "user-1" },
		} as any);
		vi.mocked(checkPostingPermission).mockResolvedValue({ isAllowed: true });

		const req = new Request("http://localhost/api/posts", {
			method: "POST",
			body: JSON.stringify({ content: "You are an ass" }), // 'ass' is a bad word
		});

		const response = await POST(req);
		expect(response.status).toBe(400);
		const data = await response.json();
		expect(data.error).toContain("forbidden content");
	});

	it("should create post if content is clean", async () => {
		vi.mocked(auth.api.getSession).mockResolvedValue({
			user: { id: "user-1" },
		} as any);
		vi.mocked(checkPostingPermission).mockResolvedValue({ isAllowed: true });

		vi.mocked(db.post.create).mockResolvedValue({
			id: "post-1",
			content: "Clean content",
			authorId: "user-1",
		} as any);

		const req = new Request("http://localhost/api/posts", {
			method: "POST",
			body: JSON.stringify({ content: "Clean content" }),
		});

		const response = await POST(req);
		expect(response.status).toBe(200);
		const data = await response.json();
		expect(data.id).toBe("post-1");
	});
});
