import { create } from "zustand";

/**
 * Modal types available in the application.
 */
export type ModalType = "create-user" | "import-users";

/**
 * Data associated with specific modals.
 */
// biome-ignore lint/complexity/noBannedTypes: Placeholder for future data
type ModalData = {};

/**
 * Zustand store state for global modal management.
 */
interface ModalStore {
	type: ModalType | null;
	data: ModalData;
	isOpen: boolean;
	onOpen: (type: ModalType, data?: ModalData) => void;
	onClose: () => void;
}

/**
 * Global store for managing shadcn/ui Dialogs across the application.
 * This allows opening any modal from any component without prop drilling.
 */
export const useModalStore = create<ModalStore>((set) => ({
	type: null,
	data: {},
	isOpen: false,
	onOpen: (type, data = {}) => set({ isOpen: true, type, data }),
	onClose: () => set({ type: null, isOpen: false }),
}));
