import * as toxicity from "@tensorflow-models/toxicity";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	_resetFilter,
	_resetToxicityModel,
	checkToxicity,
	cleanContent,
	validateContent,
} from "./moderation";
import db from "./prisma";

// Mock prisma
vi.mock("./prisma", () => ({
	default: {
		bannedWord: {
			findMany: vi.fn(),
		},
	},
}));

// Mock toxicity
vi.mock("@tensorflow-models/toxicity", () => ({
	load: vi.fn(),
}));

describe("Moderation Library", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		_resetFilter(); // Ensure each test starts with a fresh filter
		_resetToxicityModel(); // Ensure each test starts with a fresh toxicity model
	});

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

	describe("Toxicity Analysis", () => {
		it("should return false if toxicity model fails to load", async () => {
			vi.mocked(toxicity.load).mockRejectedValue(new Error("Failed to load"));
			const result = await checkToxicity("Some content");
			expect(result).toBe(false);
		});

		it("should return true if content is toxic", async () => {
			const mockModel = {
				classify: vi.fn().mockResolvedValue([
					{
						label: "insult",
						results: [{ match: true }],
					},
				]),
			};
			vi.mocked(toxicity.load).mockResolvedValue(mockModel as any);

			const result = await checkToxicity("You are stupid");
			expect(result).toBe(true);
		});

		it("should return false if content is safe", async () => {
			const mockModel = {
				classify: vi.fn().mockResolvedValue([
					{
						label: "insult",
						results: [{ match: false }],
					},
				]),
			};
			vi.mocked(toxicity.load).mockResolvedValue(mockModel as any);

			const result = await checkToxicity("Hello world");
			expect(result).toBe(false);
		});
	});
});
