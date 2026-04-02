
export function splitIntoSentences(text: string): string[] {
    if (!text) return [];

    const paragraphs = text.split(/\n\s*\n/);

    const sentences: string[] = [];

    paragraphs.forEach(p => {
        const trimmed = p.trim();
        if (!trimmed) {

            sentences.push("");
            return;
        }

        const sents = trimmed
            .split(/(?<=[.!?。！？])\s+/)
            .map(s => s.trim())
            .filter(s => s.length > 0);

        sentences.push(...sents);

        sentences.push("");
    });

    return sentences;
}