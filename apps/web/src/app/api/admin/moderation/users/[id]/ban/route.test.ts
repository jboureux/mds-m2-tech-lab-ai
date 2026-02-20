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
		user: {
			update: vi.fn(),
		},
	},
}));

describe("API: POST /api/admin/moderation/users/[id]/ban", () => {
	it("should successfully ban a user", async () => {
		vi.mocked(auth.api.getSession).mockResolvedValue({
			user: { role: "ADMIN" },
			session: {},
		} as any);

		const mockUser = { id: "1", banned: true };
		vi.mocked(prisma.user.update).mockResolvedValue(mockUser as any);

		const req = new Request("http://localhost", {
			method: "POST",
			body: JSON.stringify({ reason: "Toxic behavior", durationInDays: 7 }),
		});
		const params = Promise.resolve({ id: "1" });

		const response = await POST(req, { params });
		const data = await response.json();

		expect(response.status).toBe(200);
		expect(data.message).toBe("User banned");
		expect(prisma.user.update).toHaveBeenCalledWith(
			expect.objectContaining({
				where: { id: "1" },
				data: expect.objectContaining({
					banned: true,
					banReason: "Toxic behavior",
					banExpires: expect.any(Date),
				}),
			}),
		);
	});
});
