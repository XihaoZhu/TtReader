import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { splitIntoWords } from "../utils/WordSplitter";
import { splitIntoSentences } from "../utils/SentenceSplitter";
import { saveProgress, getProgress } from "../utils/ReadingProgress";

const contentCache = new Map<string, string[]>();

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

    // #region Selection state
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
    // #endregion


    // #region memorize location
    const sentences = useMemo(() => {
        if (contentCache.has(content)) {
            return contentCache.get(content)!;
        }

        const result = splitIntoSentences(content);
        contentCache.set(content, result);

        return result;
    }, [content]);



    const renderLine = ({ item: sentence, index: sentenceIndex }: { item: string; index: number }) => {
        const sentenceWords = splitIntoWords(sentence);
        return (
            <Text style={styles.line}>
                {sentenceWords.map((word, wIndex) => {
                    const isWordSelected =
                        selectedWordPos?.sIndex === sentenceIndex && selectedWordPos?.wIndex === wIndex;
                    const isWordSaved = (w: string) => savedWords.includes(w)
                    const isSentenceSelected = selectedSentenceIndex === sentenceIndex;

                    return (
                        <Text
                            key={wIndex}
                            onPress={() => {
                                if (bubbleVisible) { onCloseBubble(); return; }
                                handleWordPress(sentenceIndex, wIndex, cleanWord(word));
                            }}
                            onLongPress={() => handleSentenceLongPress(sentenceIndex, sentence)}
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
            data={sentences}
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