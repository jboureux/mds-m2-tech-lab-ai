import * as toxicity from "@tensorflow-models/toxicity";
import "@tensorflow/tfjs";
import translate from "@iamtraction/google-translate";
import { Filter } from "bad-words";
import db from "@/lib/prisma";

let filter: Filter | null = null;
const TOXICITY_THRESHOLD = 0.8;

// Use a global variable to persist the model across HMR in development
declare global {
	var toxicityModel: toxicity.ToxicityClassifier | undefined;
}

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
		}
	}
	return filter;
}

/**
 * Initializes and returns the toxicity model.
 */
export async function loadToxicityModel() {
	// 1. Skip if disabled in dev
	if (
		process.env.NODE_ENV === "development" &&
		process.env.ENABLE_AI_MODERATION !== "true"
	) {
		return null;
	}

	// 2. Return cached model
	if (globalThis.toxicityModel) return globalThis.toxicityModel;

	try {
		console.log("[MODERATION] Loading toxicity model...");

		// Load Node backend if available (server-side only)
		if (typeof window === "undefined") {
			try {
				await import("@tensorflow/tfjs-node");
				console.log("[MODERATION] TensorFlow.js Node backend loaded.");
			} catch (e) {
				console.warn(
					"[MODERATION] tfjs-node not found, using default backend.",
				);
			}
		}

		globalThis.toxicityModel = await toxicity.load(TOXICITY_THRESHOLD, []);
		console.log("[MODERATION] Toxicity model loaded successfully.");
		return globalThis.toxicityModel;
	} catch (error) {
		console.error("[MODERATION] Failed to load toxicity model:", error);
		return null;
	}
}

/**
 * Checks if the content is toxic using the TensorFlow.js model.
 */
export async function checkToxicity(content: string): Promise<boolean> {
	if (!content || !content.trim()) return false;

	const model = await loadToxicityModel();
	if (!model) {
		if (process.env.NODE_ENV === "development") {
			console.log("[MODERATION] AI check skipped (Dev Mode).");
		}
		return false;
	}

	try {
		// Translation step (Model is English-only)
		let contentToCheck = content;
		try {
			const translationResult = await translate(content, { to: "en" });
			contentToCheck = translationResult.text;
		} catch (err) {
			console.error("[MODERATION] Translation failed:", err);
		}

		const predictions = await model.classify([contentToCheck]);

		const isToxic = predictions.some((prediction) =>
			prediction.results.some((result) => result.match),
		);

		if (isToxic) {
			const labels = predictions
				.filter((p) => p.results[0].match)
				.map((p) => p.label);
			console.log(`[MODERATION] Content flagged: ${labels.join(", ")}`);
		}

		return isToxic;
	} catch (error) {
		console.error("[MODERATION] Error during classification:", error);
		return false;
	}
}

/**
 * Validates if the content contains any profane words.
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
