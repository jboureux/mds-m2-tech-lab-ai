"use client";

import { type ReactNode, useCallback, useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

interface UseModalOptions {
	title?: string;
	description?: string;
	className?: string;
}

/**
 * A custom hook to easily manage and render modals using shadcn/ui Dialog.
 */
export function useModal(options: UseModalOptions = {}) {
	const [isOpen, setIsOpen] = useState(false);

	const openModal = useCallback(() => setIsOpen(true), []);
	const closeModal = useCallback(() => setIsOpen(false), []);

	const Modal = ({ children }: { children: ReactNode }) => (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogContent className={options.className}>
				{(options.title || options.description) && (
					<DialogHeader>
						{options.title && <DialogTitle>{options.title}</DialogTitle>}
						{options.description && (
							<DialogDescription>{options.description}</DialogDescription>
						)}
					</DialogHeader>
				)}
				{children}
			</DialogContent>
		</Dialog>
	);

	return {
		isOpen,
		openModal,
		closeModal,
		setIsOpen,
		Modal,
	};
}
