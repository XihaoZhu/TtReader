// /src/services/CacheService.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "SAVED_WORDS";

function normalizeWord(word: string) {
    return word.toLowerCase().trim();
}

export async function getSavedWords(): Promise<string[]> {
    const data = await AsyncStorage.getItem(KEY);
    return data ? JSON.parse(data) : [];
}

export async function saveWord(word: string) {
    const normalized = normalizeWord(word);

    const words = await getSavedWords();
    if (!words.includes(normalized)) {
        const newWords = [...words, normalized];
        await AsyncStorage.setItem(KEY, JSON.stringify(newWords));
    }
}

export async function removeWord(word: string) {
    const normalized = normalizeWord(word);

    const words = await getSavedWords();
    const newWords = words.filter(w => w !== normalized);
    await AsyncStorage.setItem(KEY, JSON.stringify(newWords));
}