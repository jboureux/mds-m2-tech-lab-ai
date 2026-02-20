import { beforeEach, describe, expect, it, vi } from "vitest";
import { auth } from "@/lib/auth";
import { checkPostingPermission } from "@/lib/permissions";
import db from "@/lib/prisma";
import { POST } from "./route";

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

vi.mock("@/lib/prisma", () => ({
	default: {
		bannedWord: {
			findMany: vi.fn(),
		},
		comment: {
			create: vi.fn(),
		},
	},
}));

vi.mock("next/headers", () => ({
	headers: vi.fn(() => Promise.resolve(new Headers())),
}));

describe("POST /api/posts/[id]/comments", () => {
	const postId = "post-123";
	const userId = "user-123";

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should create a threaded comment when parentId is provided", async () => {
		const session = { user: { id: userId, name: "Test User" } };
		vi.mocked(auth.api.getSession).mockResolvedValue(session as any);
		vi.mocked(checkPostingPermission).mockResolvedValue({ isAllowed: true });
		vi.mocked(db.bannedWord.findMany).mockResolvedValue([]);

		const mockComment = {
			id: "comment-456",
			content: "Reply",
			parentId: "parent-123",
		};
		vi.mocked(db.comment.create).mockResolvedValue(mockComment as any);

		const req = new Request(`http://localhost/api/posts/${postId}/comments`, {
			method: "POST",
			body: JSON.stringify({ content: "Reply", parentId: "parent-123" }),
		});

		const response = await POST(req, {
			params: Promise.resolve({ id: postId }),
		});
		const data = await response.json();

		expect(response.status).toBe(200);
		expect(data).toEqual(mockComment);
		expect(db.comment.create).toHaveBeenCalledWith({
			data: {
				content: "Reply",
				postId: postId,
				authorId: userId,
				parentId: "parent-123",
			},
			include: {
				author: {
					select: {
						name: true,
						image: true,
						role: true,
					},
				},
			},
		});
	});

	it("should return 400 if content is missing", async () => {
		const session = { user: { id: userId } };
		vi.mocked(auth.api.getSession).mockResolvedValue(session as any);
		vi.mocked(checkPostingPermission).mockResolvedValue({ isAllowed: true });

		const req = new Request(`http://localhost/api/posts/${postId}/comments`, {
			method: "POST",
			body: JSON.stringify({ content: "" }),
		});

		const response = await POST(req, {
			params: Promise.resolve({ id: postId }),
		});
		expect(response.status).toBe(400);
	});
});
