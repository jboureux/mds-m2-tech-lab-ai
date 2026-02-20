import type { Role } from "@prisma/client";
import db from "./prisma";

/**
 * Manually adds or updates a user in the PreRegisteredUser table.
 * This is used for admin manual user creation.
 *
 * @param data - The user data to pre-register.
 * @returns The created or updated PreRegisteredUser record.
 */
export async function preRegisterUser(data: {
	email: string;
	name?: string;
	role?: Role;
}) {
	const { email, name, role = "USER" } = data;

	return await db.preRegisteredUser.upsert({
		where: { email: email.toLowerCase() },
		update: {
			name,
			role,
		},
		create: {
			email: email.toLowerCase(),
			name,
			role,
		},
	});
}
