import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	_resetFilter,
	checkAndFlagPost,
	cleanContent,
	validateContent,
} from "./moderation";
import db from "./prisma";
import { checkToxicity } from "./toxicity";

// Mock prisma
vi.mock("./prisma", () => ({
	default: {
		bannedWord: {
			findMany: vi.fn(),
		},
		post: {
			update: vi.fn(),
		},
	},
}));

// Mock toxicity library
vi.mock("./toxicity", () => ({
	checkToxicity: vi.fn(),
	_resetModel: vi.fn(),
}));

describe("Moderation Library", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		_resetFilter(); // Ensure each test starts with a fresh filter
	});

	describe("Bad Words Filter", () => {
		it("should return true for clean content", async () => {
			vi.mocked(db.bannedWord.findMany).mockResolvedValue([]);
			const result = await validateContent("This is a clean message.");
			expect(result).toBe(true);
		});

		it("should return false for content with default bad words", async () => {
			vi.mocked(db.bannedWord.findMany).mockResolvedValue([]);
			// 'ass' is a default bad word in the library
			const result = await validateContent("Don't be an ass.");
			expect(result).toBe(false);
		});

		it("should return false for content with custom banned words from DB", async () => {
			vi.mocked(db.bannedWord.findMany).mockResolvedValue([
				{
					id: "1",
					word: "custombadword",
					createdAt: new Date(),
					updatedAt: new Date(),
				},
			]);

			const result = await validateContent("This message has a custombadword.");
			expect(result).toBe(false);
		});

		it("should return false for content with bad words that have different casing", async () => {
			vi.mocked(db.bannedWord.findMany).mockResolvedValue([]);
			const result = await validateContent("You are an ASS.");
			expect(result).toBe(false);
		});

		it("should clean profane content", async () => {
			vi.mocked(db.bannedWord.findMany).mockResolvedValue([]);
			const result = await cleanContent("Don't be an ass.");
			expect(result).toContain("***");
			expect(result).not.toContain("ass");
		});

		it("should handle empty or whitespace content", async () => {
			expect(await validateContent("")).toBe(true);
			expect(await validateContent("   ")).toBe(true);
			expect(await cleanContent("")).toBe("");
		});
	});

	describe("checkAndFlagPost", () => {
		it("should check toxicity and flag post if toxic", async () => {
			vi.mocked(checkToxicity).mockResolvedValue(true);
			const postId = "post-123";
			const content = "This is toxic content";

			await checkAndFlagPost(postId, content);

			expect(checkToxicity).toHaveBeenCalledWith(content);
			expect(db.post.update).toHaveBeenCalledWith({
				where: { id: postId },
				data: {
					isToxic: true,
					status: "FLAGGED",
				},
			});
		});

		it("should check toxicity and NOT flag post if safe", async () => {
			vi.mocked(checkToxicity).mockResolvedValue(false);
			const postId = "post-456";
			const content = "This is safe content";

			await checkAndFlagPost(postId, content);

			expect(checkToxicity).toHaveBeenCalledWith(content);
			expect(db.post.update).not.toHaveBeenCalled();
		});

		it("should handle errors gracefully without throwing", async () => {
			vi.mocked(checkToxicity).mockRejectedValue(new Error("AI check failed"));
			const postId = "post-789";
			const content = "Content causing error";

			// Should not throw
			await expect(checkAndFlagPost(postId, content)).resolves.not.toThrow();

			// Should log error (mock console.error if needed, here just checking it doesn't crash)
		});
	});
});
