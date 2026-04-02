// /src/services/CacheService.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "SAVED_WORDS";

export interface SavedWord {
    word: string;
    createdAt: number;
}

function normalizeWord(word: string) {
    return word.toLowerCase().trim();
}

export async function getSavedWords(): Promise<SavedWord[]> {
    const data = await AsyncStorage.getItem(KEY);
    return data ? JSON.parse(data) : [];
}

export async function saveWord(word: string) {
    const normalized = normalizeWord(word);

    const words = await getSavedWords();
    if (!words.some(w => w.word === normalized)) {
        const newWords = [
            ...words,
            { word, createdAt: Date.now() }
        ];
        await AsyncStorage.setItem(KEY, JSON.stringify(newWords));
    }
}

export async function removeWord(word: string) {
    const normalized = normalizeWord(word);

    const words = await getSavedWords();
    const newWords = words.filter(w => w.word !== normalized);
    await AsyncStorage.setItem(KEY, JSON.stringify(newWords));
}