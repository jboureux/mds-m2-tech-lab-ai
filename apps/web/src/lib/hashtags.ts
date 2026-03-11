/**
 * Extracts hashtags from a given text.
 * A hashtag starts with # followed by alphanumeric characters.
 * It does not include the # symbol in the result.
 */
export function extractHashtags(text: string): string[] {
	if (!text) return [];
	
	// Regex: find # followed by alphanumeric or underscore
	// We avoid matching # at the end of a word or standalone #
	const hashtagRegex = /#(\w+)/g;
	const matches = text.matchAll(hashtagRegex);
	
	const hashtags = new Set<string>();
	for (const match of matches) {
		const tag = match[1].toLowerCase();
		if (tag) {
			hashtags.add(tag);
		}
	}
	
	return Array.from(hashtags);
}
