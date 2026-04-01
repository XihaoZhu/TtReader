import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { splitIntoSentences } from "../utils/SentenceSplitter";
import { splitIntoWords } from "../utils/WordSplitter";

interface Props {
    content: string;
    onWordPress: (word: string) => void;
    onSentenceLongPress: (sentence: string) => void;
    bubbleVisible: boolean;
    onCloseBubble: () => void;
    savedWords: string[];
}

export default function Reader({
    content,
    onWordPress,
    onSentenceLongPress,
    bubbleVisible,
    onCloseBubble,
    savedWords,
}: Props) {
    const sentences = useMemo(() => splitIntoSentences(content), [content]);

    const [selectedWordPos, setSelectedWordPos] = useState<{ sIndex: number; wIndex: number } | null>(null);
    const [selectedSentenceIndex, setSelectedSentenceIndex] = useState<number | null>(null);

    const handleWordPress = (sIndex: number, wIndex: number, word: string) => {
        setSelectedWordPos({ sIndex, wIndex });
        setSelectedSentenceIndex(null);
        onWordPress(word);
    };

    const handleSentenceLongPress = (sIndex: number, sentence: string) => {
        setSelectedSentenceIndex(sIndex);
        setSelectedWordPos(null);
        onSentenceLongPress(sentence);
    };

    function cleanWord(word: string) {
        return word.replace(/^[\p{P}\p{S}]+|[\p{P}\p{S}]+$/gu, "");
    }

    function normalizeWord(word: string) {
        return word.replace(/[^a-zA-Z]/g, "").toLowerCase();
    }

    const lines = useMemo(() => content.split(/\r?\n/), [content]);

    const renderLine = ({ item: line, index: lineIndex }: { item: string; index: number }) => {
        const sentenceWords = splitIntoWords(line); // 不拆句，按空格/标点切单词
        return (
            <Text style={styles.line}>
                {sentenceWords.map((word, wIndex) => {
                    const isWordSelected =
                        selectedWordPos?.sIndex === lineIndex && selectedWordPos?.wIndex === wIndex;
                    const isWordSaved = (word: string) => savedWords.includes(word);
                    const isSentenceSelected = selectedSentenceIndex === lineIndex;

                    return (
                        <Text
                            key={wIndex}
                            onPress={() => {
                                if (bubbleVisible) { onCloseBubble(); return; }
                                handleWordPress(lineIndex, wIndex, cleanWord(word));
                            }}
                            onLongPress={() => handleSentenceLongPress(lineIndex, line)}
                            style={[
                                styles.word,
                                isWordSelected && styles.selectedWord,
                                isWordSaved(normalizeWord(cleanWord(word))) && styles.savedWord,
                                isSentenceSelected && styles.selectedSentence,
                            ]}
                        >
                            {word + " "}
                        </Text>
                    );
                })}
            </Text>
        );
    };

    return (
        <FlatList
            style={styles.container}
            data={lines}
            renderItem={renderLine}
            keyExtractor={(_, index) => index.toString()}
            onTouchStart={() => {
                setSelectedWordPos(null);
                setSelectedSentenceIndex(null);
            }}
            initialNumToRender={20}
            windowSize={21}
        />
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginHorizontal: 16,
    },
    sentence: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 16, marginBottom: 4 },
    word: { fontSize: 16, lineHeight: 24 },
    selectedWord: { backgroundColor: "#ffe58a" },
    selectedSentence: { backgroundColor: "#ffd6a5" },
    savedWord: { color: "#52c41a", fontWeight: "bold" },
    line: {
        fontSize: 16,
        lineHeight: 24,
        flexDirection: "row",
        flexWrap: "wrap"
    },
});