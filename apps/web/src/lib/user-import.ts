import { parseUserCsv } from "./csv-parser";
import db from "./prisma";

/**
 * Imports users into the PreRegisteredUser table from a CSV string.
 * This function handles both parsing and transactional persistence.
 *
 * It uses a Prisma transaction to ensure all records are correctly inserted or updated.
 *
 * @param csvContent - The string content of the uploaded CSV file.
 * @returns An array containing the processed PreRegisteredUser records.
 * @throws Error if the CSV parsing fails or if the database operation fails.
 */
export async function importUsersFromCsv(csvContent: string) {
	// Step 1: Parse the CSV content using our parser utility.
	// This will throw an error if the headers are missing or the format is invalid.
	const importedUsers = parseUserCsv(csvContent);

	// Step 2: Use a transaction to perform all database operations.
	// This ensures "all or nothing" consistency.
	return await db.$transaction(async (tx) => {
		const results = [];

		for (const user of importedUsers) {
			// Use upsert to handle both new imports and updates to existing pre-registered emails.
			// This matches the goal of pre-registering users to assign roles.
			const preRegistered = await tx.preRegisteredUser.upsert({
				where: { email: user.email },
				update: {
					firstName: user.firstName,
					lastName: user.lastName,
					role: user.role,
				},
				create: {
					email: user.email,
					firstName: user.firstName,
					lastName: user.lastName,
					role: user.role,
				},
			});

			results.push(preRegistered);
		}

		return results;
	});
}
