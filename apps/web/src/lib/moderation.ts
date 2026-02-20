import { Filter } from "bad-words";
import db from "@/lib/prisma";

let filter: Filter | null = null;

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
 * Asynchronously checks a post for toxicity and updates its status if flagged.
 * This is intended to be fire-and-forget.
 */
export async function checkAndFlagPost(
	postId: string,
	content: string,
): Promise<void> {
	console.log(`[MODERATION] Starting async scan for post ${postId}...`);
	try {
		const { checkToxicity } = await import("@/lib/toxicity");
		const isToxic = await checkToxicity(content);

		if (isToxic) {
			console.log(`[MODERATION] Post ${postId} FLAGGED for toxicity.`);
			await db.post.update({
				where: { id: postId },
				data: {
					isToxic: true,
					status: "FLAGGED",
				},
			});
		}
		console.log(`[MODERATION] Async scan completed for post ${postId}.`);
	} catch (error) {
		console.error(`[MODERATION] Failed to process post ${postId}:`, error);
	}
}
