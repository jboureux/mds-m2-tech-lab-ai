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
		console.log("[TOXICITY] Initializing model...");
		try {
			// Try to load the native node backend for performance
			try {
				// We use a dynamic import and require-style check to avoid crash if not found
				await import("@tensorflow/tfjs-node");
				console.log("[TOXICITY] Native Node.js backend loaded successfully.");
			} catch (e) {
				console.warn(
					"[TOXICITY] Native Node.js backend failed to load, falling back to CPU backend. Performance may be affected.",
				);
				console.error("[TOXICITY] Backend load error:", e);
				// Ensure CPU backend is used if native fails
				if (!tf.getBackend()) {
					await tf.setBackend("cpu");
				}
			}

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
		console.log(`[TOXICITY] Scanning content: "${content.substring(0, 50)}${content.length > 50 ? "..." : ""}"`);
		const predictions = await model.classify([content]);

		const results = predictions.map((p) => ({
			label: p.label,
			match: p.results[0].match,
			probability: (p.results[0].probabilities[1] * 100).toFixed(2),
		}));

		const toxicResults = results.filter((r) => r.match);
		
		if (toxicResults.length > 0) {
			console.log(`[TOXICITY] 🚩 TOXIC content detected! Matches: ${toxicResults.map(r => `${r.label} (${r.probability}%)`).join(", ")}`);
		} else {
			const topProb = Math.max(...results.map(r => parseFloat(r.probability)));
			console.log(`[TOXICITY] ✅ Content safe. (Max probability: ${topProb}%)`);
		}

		return toxicResults.length > 0;
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
