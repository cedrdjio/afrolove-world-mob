import { create } from 'zustand';

/** Bridges the emoji picker (a separate route) back to the chat composer:
 *  the picked emoji is queued here and consumed by ChatScreen's draft. */
interface ChatComposerState {
  pendingEmoji: string | null;
  setPendingEmoji: (emoji: string | null) => void;
}

export const useChatComposerStore = create<ChatComposerState>((set) => ({
  pendingEmoji: null,
  setPendingEmoji: (pendingEmoji) => set({ pendingEmoji }),
}));
