import * as toxicity from "@tensorflow-models/toxicity";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { _resetModel, checkToxicity, getToxicityModel } from "./toxicity";

// Mock @tensorflow/tfjs-node to avoid native module errors in unit tests
vi.mock("@tensorflow/tfjs-node", () => ({
	default: {},
}));

// Mock @xenova/transformers
vi.mock("@xenova/transformers", () => ({
	pipeline: vi.fn().mockResolvedValue(() => [
		{
			translation_text: "Translated text",
		},
	]),
}));

// Mock @tensorflow-models/toxicity
vi.mock("@tensorflow-models/toxicity", () => ({
	load: vi.fn(),
}));

describe("Toxicity Library", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		_resetModel(); // Reset the singleton before each test
	});

	it("should load the model exactly once", async () => {
		const mockModel = {
			classify: vi.fn().mockResolvedValue([]),
		};
		vi.mocked(toxicity.load).mockResolvedValue(mockModel as any);

		// First call should trigger load
		await getToxicityModel();
		expect(toxicity.load).toHaveBeenCalledTimes(1);

		// Second call should return cached promise
		await getToxicityModel();
		expect(toxicity.load).toHaveBeenCalledTimes(1);
	});

	it("should return true when content is toxic", async () => {
		const mockModel = {
			classify: vi.fn().mockResolvedValue([
				{
					label: "toxicity",
					results: [
						{ match: true, probabilities: new Float32Array([0.1, 0.9]) },
					],
				},
			]),
		};
		vi.mocked(toxicity.load).mockResolvedValue(mockModel as any);

		const result = await checkToxicity("This is toxic content");
		expect(result).toBe(true);
		expect(mockModel.classify).toHaveBeenCalledWith(["Translated text"]);
	});

	it("should return false when content is safe", async () => {
		const mockModel = {
			classify: vi.fn().mockResolvedValue([
				{
					label: "toxicity",
					results: [
						{ match: false, probabilities: new Float32Array([0.9, 0.1]) },
					],
				},
			]),
		};
		vi.mocked(toxicity.load).mockResolvedValue(mockModel as any);

		const result = await checkToxicity("This is safe content");
		expect(result).toBe(false);
		expect(mockModel.classify).toHaveBeenCalledWith(["Translated text"]);
	});

	it("should handle model loading errors gracefully", async () => {
		vi.mocked(toxicity.load).mockRejectedValue(new Error("Load failed"));
		const result = await checkToxicity("Test content");
		expect(result).toBe(false);
	});

	it("should handle classification errors gracefully", async () => {
		const mockModel = {
			classify: vi.fn().mockRejectedValue(new Error("Classify failed")),
		};
		vi.mocked(toxicity.load).mockResolvedValue(mockModel as any);

		const result = await checkToxicity("Test content");
		expect(result).toBe(false);
	});

	it("should return false for empty content", async () => {
		const result = await checkToxicity("");
		expect(result).toBe(false);
		expect(toxicity.load).not.toHaveBeenCalled();
	});
});
