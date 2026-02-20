"use client";

import { useEffect, useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { useModalStore } from "@/store/modal-store";

/**
 * Global provider for rendering a single dynamic Dialog.
 */
export function ModalProvider() {
	const [isMounted, setIsMounted] = useState(false);
	const { isOpen, onClose, title, description, body } = useModalStore();

	useEffect(() => {
		setIsMounted(true);
	}, []);

	if (!isMounted) {
		return null;
	}

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-[500px] border-none shadow-2xl p-0 overflow-hidden bg-background">
				<DialogHeader className="p-8 pb-0">
					{title && (
						<DialogTitle className="text-3xl font-black tracking-tight">
							{title}
						</DialogTitle>
					)}
					{description && (
						<DialogDescription className="text-muted-foreground font-medium pt-1">
							{description}
						</DialogDescription>
					)}
				</DialogHeader>
				{body}
			</DialogContent>
		</Dialog>
	);
}
