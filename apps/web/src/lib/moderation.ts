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
