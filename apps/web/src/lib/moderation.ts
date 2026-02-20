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
	try {
		// Dynamic import to avoid circular dependencies if any,
		// and to keep the initial bundle size smaller if this file is used on client (though it shouldn't be).
		// Actually, toxicity.ts is server-side only due to tfjs-node usage (if we had it) or just large dependencies.
		// But here it's fine to import at top level, but for safety in this tool call I'll import at top.
		// Wait, I can't easily add import at top with this replace tool unless I replace the whole file or matching header.
		// I will replace the whole file to add the import safely.
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
	} catch (error) {
		console.error(`[MODERATION] Failed to process post ${postId}:`, error);
	}
}
