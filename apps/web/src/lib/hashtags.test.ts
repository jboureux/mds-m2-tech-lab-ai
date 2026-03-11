import { describe, expect, it } from "vitest";
import { extractHashtags } from "./hashtags";

describe("Hashtag Extraction", () => {
	it("should extract simple hashtags", () => {
		const text = "Hello #world #test";
		expect(extractHashtags(text)).toEqual(["world", "test"]);
	});

	it("should handle mixed case and convert to lowercase", () => {
		const text = "Coding in #TypeScript and #NextJS";
		expect(extractHashtags(text)).toEqual(["typescript", "nextjs"]);
	});

	it("should ignore duplicates", () => {
		const text = "Study #math and more #math";
		expect(extractHashtags(text)).toEqual(["math"]);
	});

	it("should handle hashtags with underscores", () => {
		const text = "Check this #deep_learning";
		expect(extractHashtags(text)).toEqual(["deep_learning"]);
	});

	it("should not extract standalone hash", () => {
		const text = "I love # but not ##";
		expect(extractHashtags(text)).toEqual([]);
	});

	it("should return empty array for text with no hashtags", () => {
		const text = "Just a plain text";
		expect(extractHashtags(text)).toEqual([]);
	});

	it("should handle empty or null input", () => {
		expect(extractHashtags("")).toEqual([]);
		// @ts-expect-error
		expect(extractHashtags(null)).toEqual([]);
	});
});
