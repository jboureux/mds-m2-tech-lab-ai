import * as tf from "@tensorflow/tfjs";
import * as toxicity from "@tensorflow-models/toxicity";

// Minimum confidence threshold for predictions
const THRESHOLD = 0.5;

// Shared promises to ensure models are loaded only once
let modelPromise: Promise<toxicity.ToxicityClassifier> | null = null;
let translatorPromise: Promise<any> | null = null;

/**
 * Loads the translation pipeline.
 */
export async function getTranslator() {
	if (!translatorPromise) {
		console.log("[TOXICITY] Loading translation model (FR -> EN)...");
		try {
			const { pipeline } = await import("@xenova/transformers");
			translatorPromise = pipeline("translation", "Xenova/opus-mt-fr-en");
		} catch (error) {
			console.error("[TOXICITY] Failed to load translation model:", error);
			translatorPromise = null;
			throw error;
		}
	}
	return translatorPromise;
}

/**
 * Loads the toxicity model. Singleton pattern ensures it's loaded only once.
 */
export async function getToxicityModel() {
	if (!modelPromise) {
		console.log("[TOXICITY] Initializing model...");
		try {
			// Try to load the native node backend for performance
			try {
				console.log("[TOXICITY] Attempting to load native Node.js backend...");
				// Use createRequire to safely load native modules in ESM environment
				const { createRequire } = await import("node:module");
				const require = createRequire(import.meta.url);
				require("@tensorflow/tfjs-node");
				console.log("[TOXICITY] Native Node.js backend loaded successfully.");
			} catch (e) {
				console.warn(
					"[TOXICITY] Native Node.js backend failed to load, falling back to CPU backend. Performance may be affected.",
				);
				// Log the error message for debugging, but don't re-throw
				const errorMsg = e instanceof Error ? e.message : String(e);
				console.log(`[TOXICITY] Backend load details: ${errorMsg}`);
				
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
 * Translates content to English if it looks like French (or just always for safety in this context).
 * Returns true if any label exceeds the threshold.
 */
export async function checkToxicity(content: string): Promise<boolean> {
	if (!content || !content.trim()) return false;

	try {
		let textToScan = content;

		// Local Translation (Async)
		try {
			const translator = await getTranslator();
			console.log("[TOXICITY] Translating content to English for better detection...");
			const output = await translator(content, {
				src_lang: "fra_Latn",
				tgt_lang: "eng_Latn",
			});
			textToScan = output[0].translation_text;
			console.log(`[TOXICITY] Translated text: "${textToScan}"`);
		} catch (e) {
			console.error("[TOXICITY] Translation failed, scanning original text:", e);
		}

		const model = await getToxicityModel();
		console.log(
			`[TOXICITY] Scanning content: "${textToScan.substring(0, 50)}${textToScan.length > 50 ? "..." : ""}"`,
		);
		const predictions = await model.classify([textToScan]);

		const results = predictions.map((p) => ({
			label: p.label,
			match: p.results[0].match,
			probability: (p.results[0].probabilities[1] * 100).toFixed(2),
		}));

		const toxicResults = results.filter((r) => r.match);

		if (toxicResults.length > 0) {
			console.log(
				`[TOXICITY] 🚩 TOXIC content detected! Matches: ${toxicResults.map((r) => `${r.label} (${r.probability}%)`).join(", ")}`,
			);
		} else {
			const topProb = Math.max(...results.map((r) => Number.parseFloat(r.probability)));
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
