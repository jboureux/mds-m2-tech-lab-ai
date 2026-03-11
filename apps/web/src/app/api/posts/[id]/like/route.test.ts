import { beforeEach, describe, expect, it, vi } from "vitest";
import { auth } from "@/lib/auth";
import { checkPostingPermission } from "@/lib/permissions";
import db from "@/lib/prisma";
import { POST } from "./route";

vi.mock("@prisma/client", () => ({
	ReactionType: {
		LIKE: "LIKE",
	},
}));

// Mock next/headers
vi.mock("next/headers", () => ({
	headers: vi.fn().mockResolvedValue({
		get: vi.fn().mockReturnValue("on-campus"),
	}),
}));

// Mock dependencies
vi.mock("@/lib/prisma", () => ({
	default: {
		postLike: {
			findUnique: vi.fn(),
			create: vi.fn(),
			delete: vi.fn(),
			update: vi.fn(),
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

describe("API: POST /api/posts/[id]/like", () => {
	const mockSession = {
		user: { id: "user-1", role: "USER" },
		session: { id: "session-1" },
	};

	beforeEach(() => {
		vi.resetAllMocks();
	});

	it("should return 401 if not authenticated", async () => {
		vi.mocked(auth.api.getSession).mockResolvedValue(null);

		const req = new Request("http://localhost/api/posts/post-1/like", {
			method: "POST",
		});
		const params = Promise.resolve({ id: "post-1" });

		const res = await POST(req, { params });
		expect(res.status).toBe(401);
	});

	it("should return 403 if permission denied (e.g. off-campus)", async () => {
		vi.mocked(auth.api.getSession).mockResolvedValue(mockSession as any);
		vi.mocked(checkPostingPermission).mockResolvedValue({
			isAllowed: false,
			reason: "Off-campus",
		});

		const req = new Request("http://localhost/api/posts/post-1/like", {
			method: "POST",
		});
		const params = Promise.resolve({ id: "post-1" });

		const res = await POST(req, { params });
		expect(res.status).toBe(403);
	});

	it("should like a post if not already liked", async () => {
		vi.mocked(auth.api.getSession).mockResolvedValue(mockSession as any);
		vi.mocked(checkPostingPermission).mockResolvedValue({ isAllowed: true });
		vi.mocked(db.postLike.findUnique).mockResolvedValue(null);

		const req = new Request("http://localhost/api/posts/post-1/like", {
			method: "POST",
			body: JSON.stringify({ type: "LIKE" }),
		});
		const params = Promise.resolve({ id: "post-1" });

		const res = await POST(req, { params });
		const data = await res.json();

		expect(res.status).toBe(200);
		expect(data.liked).toBe(true);
		expect(db.postLike.create).toHaveBeenCalledWith({
			data: {
				userId: "user-1",
				postId: "post-1",
				type: "LIKE",
			},
		});
	});

	it("should unlike a post if already liked with same type", async () => {
		vi.mocked(auth.api.getSession).mockResolvedValue(mockSession as any);
		vi.mocked(checkPostingPermission).mockResolvedValue({ isAllowed: true });
		vi.mocked(db.postLike.findUnique).mockResolvedValue({
			userId: "user-1",
			postId: "post-1",
			type: "LIKE",
		} as any);

		const req = new Request("http://localhost/api/posts/post-1/like", {
			method: "POST",
			body: JSON.stringify({ type: "LIKE" }),
		});
		const params = Promise.resolve({ id: "post-1" });

		const res = await POST(req, { params });
		const data = await res.json();

		expect(res.status).toBe(200);
		expect(data.liked).toBe(false);
		expect(db.postLike.delete).toHaveBeenCalled();
	});
});
