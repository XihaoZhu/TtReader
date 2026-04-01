// /src/services/CacheService.ts

import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "SAVED_WORDS";

export async function getSavedWords(): Promise<string[]> {
    const data = await AsyncStorage.getItem(KEY);
    return data ? JSON.parse(data) : [];
}

export async function saveWord(word: string) {
    const words = await getSavedWords();
    if (!words.includes(word)) {
        const newWords = [...words, word];
        await AsyncStorage.setItem(KEY, JSON.stringify(newWords));
    }
}

export async function removeWord(word: string) {
    const words = await getSavedWords();
    const newWords = words.filter(w => w !== word);
    await AsyncStorage.setItem(KEY, JSON.stringify(newWords));
}