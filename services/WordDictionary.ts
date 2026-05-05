import { getLocalDictDatabase } from "./LoadLocalDict";

export interface DictEntry {
    word: string;
    phonetic: string;
    translation: string[];
}

interface DictRow {
    word: string;
    phonetic: string | null;
    translation: string | null;
}

function normalizeWord(word: string) {
    return word.replace(/[^a-zA-Z]/g, "").toLowerCase();
}

function parseTranslation(translation: string | null): string[] {
    if (!translation) {
        return [];
    }

    return translation
        .split("|")
        .map((item) => item.trim())
        .filter(Boolean);
}

export async function lookupLocalWord(word: string): Promise<DictEntry | null> {
    const sw = normalizeWord(word);
    if (!sw) return null;

    const db = await getLocalDictDatabase();
    const row = await db.getFirstAsync<DictRow>(
        "SELECT word, phonetic, translation FROM words WHERE word = ? COLLATE NOCASE LIMIT 1",
        sw,
    );

    if (!row) {
        return null;
    }

    return {
        word: row.word,
        phonetic: row.phonetic ?? "",
        translation: parseTranslation(row.translation),
    };
}