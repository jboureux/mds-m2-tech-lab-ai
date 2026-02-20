import { revalidateTag } from "next/cache";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { auth } from "@/lib/auth";
import db from "@/lib/prisma";
import { DELETE, GET, PATCH, POST } from "./route";

// Mock the dependencies
vi.mock("@/lib/auth", () => ({
	auth: {
		api: {
			getSession: vi.fn(),
		},
	},
}));

vi.mock("@/lib/prisma", () => ({
	default: {
		allowedIP: {
			findMany: vi.fn(),
			findUnique: vi.fn(),
			create: vi.fn(),
			delete: vi.fn(),
			count: vi.fn(),
		},
	},
}));

vi.mock("next/cache", () => ({
	revalidateTag: vi.fn(),
}));

vi.mock("next/headers", () => ({
	headers: vi.fn(() => Promise.resolve(new Headers())),
}));

describe("Admin Network API", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	const mockAdminSession = {
		user: {
			role: "ADMIN",
		},
	};

	const mockUserSession = {
		user: {
			role: "USER",
		},
	};

	describe("GET", () => {
		it("should return 401 if not authenticated", async () => {
			(auth.api.getSession as any).mockResolvedValue(null);
			const response = await GET();
			expect(response.status).toBe(401);
		});

		it("should return 403 if not an admin", async () => {
			(auth.api.getSession as any).mockResolvedValue(mockUserSession);
			const response = await GET();
			expect(response.status).toBe(403);
		});

		it("should return ranges if admin", async () => {
			(auth.api.getSession as any).mockResolvedValue(mockAdminSession);
			const mockRanges = [{ id: "1", cidr: "1.1.1.1/32" }];
			(db.allowedIP.findMany as any).mockResolvedValue(mockRanges);

			const response = await GET();
			const data = await response.json();

			expect(response.status).toBe(200);
			expect(data).toEqual(mockRanges);
		});
	});

	describe("POST", () => {
		it("should add a new CIDR range and invalidate cache", async () => {
			(auth.api.getSession as any).mockResolvedValue(mockAdminSession);
			(db.allowedIP.findUnique as any).mockResolvedValue(null);
			(db.allowedIP.create as any).mockResolvedValue({
				id: "2",
				cidr: "192.168.1.0/24",
			});

			const req = new Request("http://localhost/api/admin/network", {
				method: "POST",
				body: JSON.stringify({ cidr: "192.168.1.0/24", description: "Test" }),
			});

			const response = await POST(req);
			const data = await response.json();

			expect(response.status).toBe(200);
			expect(data.message).toContain("successfully added");
			expect(revalidateTag).toHaveBeenCalledWith("allowed-ips", "default");
		});

		it("should return 400 for invalid CIDR", async () => {
			(auth.api.getSession as any).mockResolvedValue(mockAdminSession);

			const req = new Request("http://localhost/api/admin/network", {
				method: "POST",
				body: JSON.stringify({ cidr: "invalid-cidr" }),
			});

			const response = await POST(req);
			expect(response.status).toBe(400);
		});

		it("should return 409 if CIDR already exists", async () => {
			(auth.api.getSession as any).mockResolvedValue(mockAdminSession);
			(db.allowedIP.findUnique as any).mockResolvedValue({ id: "1" });

			const req = new Request("http://localhost/api/admin/network", {
				method: "POST",
				body: JSON.stringify({ cidr: "1.1.1.1/32" }),
			});

			const response = await POST(req);
			expect(response.status).toBe(409);
		});
	});

	describe("DELETE", () => {
		it("should remove a range and invalidate cache", async () => {
			(auth.api.getSession as any).mockResolvedValue(mockAdminSession);
			(db.allowedIP.delete as any).mockResolvedValue({
				id: "1",
				cidr: "1.1.1.1/32",
			});

			const req = new Request("http://localhost/api/admin/network?id=1", {
				method: "DELETE",
			});

			const response = await DELETE(req);
			const _data = await response.json();

			expect(response.status).toBe(200);
			expect(revalidateTag).toHaveBeenCalledWith("allowed-ips", "default");
		});
	});

	describe("PATCH", () => {
		it("should manually invalidate cache", async () => {
			(auth.api.getSession as any).mockResolvedValue(mockAdminSession);

			const response = await PATCH();
			const _data = await response.json();

			expect(response.status).toBe(200);
			expect(revalidateTag).toHaveBeenCalledWith("allowed-ips", "default");
		});
	});
});
