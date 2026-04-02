
export function splitIntoSentences(text: string): string[] {
    if (!text) return [];

    const rawSentences = text
        .replace(/\n+/g, " ")
        .split(/(?<=[.!?。！？])\s+/)

    return rawSentences
        .map(s => s.trim())
        .filter(s => s.length > 0);
}