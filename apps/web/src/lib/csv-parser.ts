import { Role } from "@prisma/client";

/**
 * Interface representing a user record from a CSV file.
 */
export interface ImportedUser {
	firstName: string;
	lastName: string;
	email: string;
	role: Role;
}

/**
 * Parses a CSV string into an array of ImportedUser objects.
 * Expects the CSV to have headers: FirstName, LastName, Email, Role.
 *
 * @param csvContent - The content of the CSV file.
 * @returns An array of ImportedUser objects.
 * @throws Error if required headers are missing or if invalid roles are found.
 */
export function parseUserCsv(csvContent: string): ImportedUser[] {
	// Normalize lines and remove empty ones
	const lines = csvContent
		.split(/\r?\n/)
		.map((line) => line.trim())
		.filter((line) => line !== "");

	if (lines.length < 2) {
		throw new Error("CSV must contain at least a header row and one data row.");
	}

	const headerLine = lines[0];
	const dataLines = lines.slice(1);

	// Split headers by comma and normalize (lowercase, trimmed)
	// Note: Simple split on comma. Doesn't handle escaped commas in quotes.
	const headers = headerLine.split(",").map((h) => h.trim().toLowerCase());

	// Map expected headers to their index
	const firstNameIndex = headers.indexOf("firstname");
	const lastNameIndex = headers.indexOf("lastname");
	const emailIndex = headers.indexOf("email");
	const roleIndex = headers.indexOf("role");

	// Validate presence of all required headers
	if (
		firstNameIndex === -1 ||
		lastNameIndex === -1 ||
		emailIndex === -1 ||
		roleIndex === -1
	) {
		throw new Error(
			`Missing required headers. Found: [${headers.join(", ")}]. Required: FirstName, LastName, Email, Role`,
		);
	}

	const validRoles = Object.values(Role);

	return dataLines.map((line, index) => {
		// Use a simple split. This is sufficient for simple CSV records.
		const values = line.split(",").map((v) => v.trim());

		// Basic column count check
		const maxIndex = Math.max(
			firstNameIndex,
			lastNameIndex,
			emailIndex,
			roleIndex,
		);
		if (values.length <= maxIndex) {
			throw new Error(
				`Line ${index + 2} is malformed or missing columns. Expected at least ${maxIndex + 1} columns.`,
			);
		}

		const email = values[emailIndex].toLowerCase();
		const roleValue = values[roleIndex].toUpperCase();

		// Validate role enum
		if (!validRoles.includes(roleValue as Role)) {
			throw new Error(
				`Invalid role at line ${index + 2}: "${roleValue}". Expected one of: ${validRoles.join(", ")}`,
			);
		}

		return {
			firstName: values[firstNameIndex],
			lastName: values[lastNameIndex],
			email,
			role: roleValue as Role,
		};
	});
}
