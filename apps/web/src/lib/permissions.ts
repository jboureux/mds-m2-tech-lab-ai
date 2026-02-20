import type { Session, User } from "better-auth";
import { headers } from "next/headers";

/**
 * Checks if the current user is allowed to perform a posting action
 * based on their role and current network location.
 *
 * @param session - The current user session
 * @returns { isAllowed: boolean, reason?: string }
 */
export async function checkPostingPermission(
	session: { user: User; session: Session } | null,
) {
	if (!session) {
		return { isAllowed: false, reason: "Unauthorized" };
	}

	const h = await headers();
	const networkLocation = h.get("x-network-location") || "off-campus";
	const { role } = session.user as User & { role: string };

	// ADMIN, MODERATOR, and VIP can always post
	if (role !== "USER") {
		return { isAllowed: true };
	}

	// Standard users (USER) can only post when on-campus
	if (networkLocation === "on-campus") {
		return { isAllowed: true };
	}

	return {
		isAllowed: false,
		reason:
			"Forbidden: Standard users must be connected to the School Wi-Fi to post content.",
	};
}

/**
 * Helper to check if a user is VIP or above
 */
export function isVipOrAbove(role: string) {
	return role === "ADMIN" || role === "MODERATOR" || role === "VIP";
}
