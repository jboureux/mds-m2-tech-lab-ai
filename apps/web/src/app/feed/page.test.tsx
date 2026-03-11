import { render, screen } from "@testing-library/react";
import type { Session, User } from "better-auth";
import { describe, expect, it, vi } from "vitest";
import Page from "./page";

// Mock the components used in the page with correct paths
// Mocking as synchronous components to avoid async rendering issues in tests
vi.mock("@/components/social/server/header", () => ({
	SocialHeader: () => <div data-testid="header">Header</div>,
}));
vi.mock("@/components/social/server/sidebar", () => ({
	SocialSidebar: () => <div data-testid="sidebar">Sidebar</div>,
}));
vi.mock("@/components/social/server/aside-panel", () => ({
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
		follow: {
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
		} as unknown as { user: User; session: Session });
		vi.mocked(checkPostingPermission).mockResolvedValue({ isAllowed: true });
		vi.mocked(db.post.findMany).mockResolvedValue([]);

		// Await the Page component which is an async function
		const page = await Page({
			searchParams: Promise.resolve({ feed: "all" }),
		});

		render(page);

		expect(screen.getByTestId("editor")).toBeDefined();
		expect(screen.getByTestId("feed")).toBeDefined();
	});
});
