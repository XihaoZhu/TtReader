
import { Asset } from "expo-asset";
import { loadDict } from "./LoadLocalDict";

interface DictEntry {
    word: string;
    sw: string;
    translation: string[];
    phonetic: string;
}

const cache: Record<string, DictEntry[]> = {};

function normalizeWord(word: string) {
    return word.replace(/[^a-zA-Z]/g, "").toLowerCase();
}


export async function lookupLocalWord(word: string): Promise<DictEntry | null> {
    const sw = normalizeWord(word);
    if (!sw) return null;

    const firstLetter = sw[0]; // a-z


    if (!cache[firstLetter]) {
        const lines = await loadDict(firstLetter);
        cache[firstLetter] = lines.map((line) => JSON.parse(line));
    }
    const dict = cache[firstLetter];
    return dict.find((e) => e.sw.toLowerCase() === sw) || null;
}