"use client";

import { useEffect, useState } from "react";
import { CreateUserDialog } from "@/components/admin/create-user-dialog";
import { ImportUsersDialog } from "@/components/admin/import-users-dialog";

/**
 * Global provider for rendering modals based on the Zustand store.
 * Prevents hydration errors by only rendering on the client.
 */
export function ModalProvider() {
	const [isMounted, setIsMounted] = useState(false);

	useEffect(() => {
		setIsMounted(true);
	}, []);

	if (!isMounted) {
		return null;
	}

	return (
		<>
			<CreateUserDialog />
			<ImportUsersDialog />
		</>
	);
}
