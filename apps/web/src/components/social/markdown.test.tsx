import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Markdown } from "./markdown";

// Mock next-themes
vi.mock("next-themes", () => ({
	useTheme: () => ({
		resolvedTheme: "light",
	}),
}));

describe("Markdown Component", () => {
	it("should render bold text correctly", () => {
		render(<Markdown content="**bold text**" />);
		const boldElement = screen.getByText("bold text");
		expect(boldElement.tagName).toBe("STRONG");
	});

	it("should render italic text correctly", () => {
		render(<Markdown content="*italic text*" />);
		const italicElement = screen.getByText("italic text");
		expect(italicElement.tagName).toBe("EM");
	});

	it("should render code blocks with syntax highlighting", () => {
		const codeContent = "```javascript\nconst x = 1;\n```";
		render(<Markdown content={codeContent} />);
		// SyntaxHighlighter might render complex structures, let's check for the code content
		expect(screen.getByText("const")).toBeDefined();
		expect(screen.getByText("x")).toBeDefined();
	});

	it("should support text coloring via HTML span", () => {
		const coloredContent = '<span style="color: red">red text</span>';
		const { container } = render(<Markdown content={coloredContent} />);
		const span = container.querySelector("span");
		expect(span).toBeDefined();
		expect(span?.getAttribute("style")).toContain("color: red");
		expect(span?.textContent).toBe("red text");
	});

	it("should sanitize dangerous HTML", () => {
		const dangerousContent = '<script>alert("xss")</script><p>safe</p>';
		const { container } = render(<Markdown content={dangerousContent} />);
		expect(container.querySelector("script")).toBeNull();
		expect(screen.getByText("safe")).toBeDefined();
	});

	it("should linkify hashtags", () => {
		render(<Markdown content="Hello #world" />);
		const link = screen.getByText("#world");
		expect(link.tagName).toBe("A");
		expect(link.getAttribute("href")).toBe("/feed/hashtag/world");
	});
});
