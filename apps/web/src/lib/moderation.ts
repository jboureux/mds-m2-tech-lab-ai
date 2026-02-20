import * as toxicity from "@tensorflow-models/toxicity";
import "@tensorflow/tfjs";
import { Filter } from "bad-words";
import db from "@/lib/prisma";

let filter: Filter | null = null;
let toxicityModel: toxicity.ToxicityClassifier | null = null;
const TOXICITY_THRESHOLD = 0.8;

/**
 * Initializes and returns the bad-words filter, adding custom banned words from the database.
 */
async function getFilter() {
	if (!filter) {
		filter = new Filter();
		try {
			const bannedWords = await db.bannedWord.findMany();
			if (bannedWords.length > 0) {
				filter.addWords(...bannedWords.map((bw) => bw.word));
			}
		} catch (error) {
			console.error("[MODERATION] Failed to load banned words from DB:", error);
			// Continue with default filter even if DB load fails
		}
	}
	return filter;
}

/**
 * Initializes and returns the toxicity model.
 */
export async function loadToxicityModel() {
	if (toxicityModel) return toxicityModel;
	try {
		console.log("[MODERATION] Loading toxicity model...");
		toxicityModel = await toxicity.load(TOXICITY_THRESHOLD, []);
		console.log("[MODERATION] Toxicity model loaded.");
		return toxicityModel;
	} catch (error) {
		console.error("[MODERATION] Failed to load toxicity model:", error);
		return null;
	}
}

/**
 * Checks if the content is toxic using the TensorFlow.js model.
 * Returns true if toxic, false otherwise.
 */
export async function checkToxicity(content: string): Promise<boolean> {
	if (!content || !content.trim()) return false;

	const model = await loadToxicityModel();
	if (!model) return false;

	try {
		const predictions = await model.classify([content]);
		console.log(
			"[MODERATION] Toxicity predictions:",
			JSON.stringify(predictions, null, 2),
		);
		// Check if any prediction is a match (true)
		return predictions.some((prediction) =>
			prediction.results.some((result) => result.match),
		);
	} catch (error) {
		console.error("[MODERATION] Error checking toxicity:", error);
		return false;
	}
}

/**
 * Validates if the content contains any profane words.
 * Returns true if the content is clean, false if it contains bad words.
 */
export async function validateContent(content: string): Promise<boolean> {
	if (!content || !content.trim()) return true;
	const f = await getFilter();
	return !f.isProfane(content);
}

/**
 * Cleans the content by replacing profane words with placeholders.
 */
export async function cleanContent(content: string): Promise<string> {
	if (!content || !content.trim()) return content;
	const f = await getFilter();
	return f.clean(content);
}

/**
 * Resets the filter instance (primarily for testing).
 */
export function _resetFilter() {
	filter = null;
}

/**
 * Resets the toxicity model instance (primarily for testing).
 */
export function _resetToxicityModel() {
	toxicityModel = null;
}
