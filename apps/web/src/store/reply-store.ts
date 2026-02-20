import { create } from "zustand";

interface ReplyState {
	replyingToId: string | null;
	setReplyingTo: (id: string | null) => void;
	cancelReply: () => void;
}

export const useReplyStore = create<ReplyState>((set) => ({
	replyingToId: null,
	setReplyingTo: (id) => set({ replyingToId: id }),
	cancelReply: () => set({ replyingToId: null }),
}));
