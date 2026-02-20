import type { ReactNode } from "react";
import { create } from "zustand";

/**
 * Zustand store state for global modal management.
 */
interface ModalStore {
	title: string | null;
	description: string | null;
	body: ReactNode | null;
	isOpen: boolean;
	onOpen: (params: {
		title: string;
		description: string;
		body: ReactNode;
	}) => void;
	onClose: () => void;
}

/**
 * Global store for managing a single dynamic shadcn/ui Dialog.
 */
export const useModalStore = create<ModalStore>((set) => ({
	title: null,
	description: null,
	body: null,
	isOpen: false,
	onOpen: ({ title, description, body }) =>
		set({ isOpen: true, title, description, body }),
	onClose: () =>
		set({ isOpen: false, title: null, description: null, body: null }),
}));
