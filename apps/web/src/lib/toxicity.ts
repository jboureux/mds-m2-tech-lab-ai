import "@tensorflow/tfjs-node";
import * as tf from "@tensorflow/tfjs";
import * as toxicity from "@tensorflow-models/toxicity";

// Minimum confidence threshold for predictions
const THRESHOLD = 0.8;

// Shared promise to ensure model is loaded only once
let modelPromise: Promise<toxicity.ToxicityClassifier> | null = null;

/**
 * Loads the toxicity model. Singleton pattern ensures it's loaded only once.
 */
export async function getToxicityModel() {
	if (!modelPromise) {
		console.log("[TOXICITY] Initializing model with native node backend...");
		try {
			// Ensure we are ready (native backend should be registered by the import)
			await tf.ready();
			console.log(`[TOXICITY] Using backend: ${tf.getBackend()}`);

			// We pass an empty array for labels to load all available labels
			modelPromise = toxicity.load(THRESHOLD, []);
			console.log("[TOXICITY] Model loading started.");
		} catch (error) {
			console.error(
				"[TOXICITY] Failed to initialize TFJS or load model:",
				error,
			);
			throw error;
		}
	}
	return modelPromise;
}

/**
 * Checks content for toxicity.
 * Returns true if any label exceeds the threshold.
 */
export async function checkToxicity(content: string): Promise<boolean> {
	if (!content || !content.trim()) return false;

	try {
		const model = await getToxicityModel();
		const predictions = await model.classify([content]);

		// prediction structure:
		// {
		//   label: string,
		//   results: [{ match: boolean, probabilities: Float32Array }]
		// }
		// match is true if probability > threshold (which we set in load)

		return predictions.some((prediction) =>
			prediction.results.some((result) => result.match === true),
		);
	} catch (error) {
		console.error("[TOXICITY] Classification failed:", error);
		// Fail open (allow post) or closed (block post)?
		// Requirement says "Updates post status to FLAGGED if toxicity threshold met".
		// If check fails, we probably shouldn't flag it blindly, but logging is critical.
		return false;
	}
}

/**
 * Resets the model promise (primarily for testing).
 */
export function _resetModel() {
	modelPromise = null;
}
