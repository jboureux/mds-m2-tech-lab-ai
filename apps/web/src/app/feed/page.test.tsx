import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Page from "./page";

// Mock the components used in the page
vi.mock("@/components/social/header", () => ({
	SocialHeader: () => <div data-testid="header">Header</div>,
}));
vi.mock("@/components/social/sidebar", () => ({
	SocialSidebar: () => <div data-testid="sidebar">Sidebar</div>,
}));
vi.mock("@/components/social/aside-panel", () => ({
	AsidePanel: () => <div data-testid="aside">Aside</div>,
}));
vi.mock("@/components/social/post-editor", () => ({
	PostEditor: () => <div data-testid="editor">Editor</div>,
}));
vi.mock("@/components/social/post-feed", () => ({
	PostFeed: () => <div data-testid="feed">Feed</div>,
}));

// Mock auth and permissions
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
		post: {
			findMany: vi.fn(),
		},
	},
}));

vi.mock("next/headers", () => ({
	headers: vi.fn().mockResolvedValue(new Map()),
}));

describe("Home Page", () => {
	it("should render successfully", async () => {
		const { auth } = await import("@/lib/auth");
		const { checkPostingPermission } = await import("@/lib/permissions");
		const db = (await import("@/lib/prisma")).default;

		vi.mocked(auth.api.getSession).mockResolvedValue({
			user: { name: "Test User", id: "1", role: "USER", image: null },
		} as any);
		vi.mocked(checkPostingPermission).mockResolvedValue({ isAllowed: true });
		vi.mocked(db.post.findMany).mockResolvedValue([]);

		const page = await Page();
		render(page);
		expect(screen.getByTestId("editor")).toBeDefined();
		expect(screen.getByTestId("feed")).toBeDefined();
	});
});
