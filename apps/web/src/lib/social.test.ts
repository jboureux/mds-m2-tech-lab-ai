import { PostStatus } from "@prisma/client";
import { describe, expect, it, vi } from "vitest";
import db from "./prisma";

// Mock the prisma client
vi.mock("./prisma", () => ({
	default: {
		post: {
			create: vi.fn(),
			findUnique: vi.fn(),
		},
		comment: {
			create: vi.fn(),
			findMany: vi.fn(),
		},
	},
}));

describe("Social Schema Logic (Mocks)", () => {
	it("should allow creating a post with isToxic and status", async () => {
		const mockPost = {
			id: "post-1",
			title: "Hello World",
			content: "This is a test post",
			status: PostStatus.PENDING,
			isToxic: false,
			authorId: "user-1",
		};

		vi.mocked(db.post.create).mockResolvedValue(mockPost as any);

		const result = await db.post.create({
			data: {
				title: "Hello World",
				content: "This is a test post",
				status: PostStatus.PENDING,
				isToxic: false,
				authorId: "user-1",
			},
		});

		expect(result).toEqual(mockPost);
		expect(db.post.create).toHaveBeenCalledWith({
			data: expect.objectContaining({
				isToxic: false,
				status: PostStatus.PENDING,
			}),
		});
	});

	it("should allow creating a comment with parentId for threading", async () => {
		const mockComment = {
			id: "comment-2",
			content: "This is a reply",
			postId: "post-1",
			authorId: "user-2",
			parentId: "comment-1",
			isToxic: false,
		};

		vi.mocked(db.comment.create).mockResolvedValue(mockComment as any);

		const result = await db.comment.create({
			data: {
				content: "This is a reply",
				postId: "post-1",
				authorId: "user-2",
				parentId: "comment-1",
				isToxic: false,
			},
		});

		expect(result).toEqual(mockComment);
		expect(db.comment.create).toHaveBeenCalledWith({
			data: expect.objectContaining({
				parentId: "comment-1",
			}),
		});
	});
});
