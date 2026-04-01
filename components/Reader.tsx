import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
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

export default function Reader({ content, onWordPress, onSentenceLongPress, bubbleVisible, onCloseBubble, savedWords }: Props) {
    const sentences = useMemo(() => splitIntoSentences(content), [content]);


    //#region Selection Logic
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
    //#endregion



    return (
        <ScrollView style={styles.container}
            onTouchStart={() => {
                setSelectedWordPos(null);
                setSelectedSentenceIndex(null);
            }}
        >
            <View style={styles.textWrapper}>
                {sentences.map((sentence, sIndex) => (
                    <View key={sIndex} style={styles.sentence}>
                        {splitIntoWords(sentence).map((word, wIndex) => {
                            const isWordSelected =
                                selectedWordPos?.sIndex === sIndex && selectedWordPos?.wIndex === wIndex;
                            const isSentenceSelected = selectedSentenceIndex === sIndex;
                            const isWordSaved = (word: string) => savedWords.includes(word);

                            return (
                                <Text
                                    key={wIndex}
                                    onPress={() => {
                                        if (bubbleVisible) {
                                            onCloseBubble();
                                            return
                                        }
                                        handleWordPress(sIndex, wIndex, word)
                                    }}
                                    onLongPress={() => { handleSentenceLongPress(sIndex, sentence); }}
                                    style={[
                                        styles.word,
                                        isWordSelected && styles.selectedWord,
                                        isWordSaved(word) && styles.savedWord,
                                        isSentenceSelected && styles.selectedSentence,
                                    ]}
                                >
                                    {word + " "}
                                </Text>
                            );
                        })}
                    </View>
                ))}
            </View>
        </ScrollView >
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    textWrapper: { padding: 16, flexDirection: "row", flexWrap: "wrap" },
    sentence: { flexDirection: "row", flexWrap: "wrap" },
    word: { fontSize: 16, lineHeight: 24 },
    selectedWord: { backgroundColor: "#ffe58a" },
    selectedSentence: { backgroundColor: "#ffd6a5" },
    savedWord: {
        color: "#52c41a",
        fontWeight: "bold",
    },
});