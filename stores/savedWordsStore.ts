import { create } from "zustand";

export type SavedWord = {
  word: string;
  createdAt: number;
};

function normalizeWord(word: string) {
  return word.toLowerCase().trim();
}

type SavedWordsState = {
  words: SavedWord[];
  saveWord: (word: string) => void;
  removeWord: (word: string) => void;
  hasWord: (word: string) => boolean;
};

export const useSavedWordsStore = create<SavedWordsState>((set, get) => ({
  words: [],
  saveWord: (word) => {
    const normalized = normalizeWord(word);
    if (!normalized) return;

    set((state) => {
      if (state.words.some((w) => w.word === normalized)) return state;
      return {
        words: [...state.words, { word: normalized, createdAt: Date.now() }],
      };
    });
  },
  removeWord: (word) => {
    const normalized = normalizeWord(word);
    if (!normalized) return;

    set((state) => ({
      words: state.words.filter((w) => w.word !== normalized),
    }));
  },
  hasWord: (word) => {
    const normalized = normalizeWord(word);
    if (!normalized) return false;
    return get().words.some((w) => w.word === normalized);
  },
}));

