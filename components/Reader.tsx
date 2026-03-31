import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { splitIntoSentences } from "../utils/SentenceSplitter";
import { splitIntoWords } from "../utils/WordSplitter";
import { lookupLocalWord } from "../services/WordDictionary";

interface Props {
    content: string;
}

export default function Reader({ content }: Props) {
    const sentences = useMemo(() => splitIntoSentences(content), [content]);

    const [selectedWordPos, setSelectedWordPos] = useState<{ sIndex: number; wIndex: number } | null>(null);
    const [selectedSentenceIndex, setSelectedSentenceIndex] = useState<number | null>(null);
    const handleWordPress = (sIndex: number, wIndex: number, word: string) => {
        setSelectedWordPos({ sIndex, wIndex });
        setSelectedSentenceIndex(null);
        test(word);

        console.log("Clicked word:", word, "at sentence:", sIndex, "word index:", wIndex);
    };

    const handleSentenceLongPress = (sIndex: number, sentence: string) => {
        setSelectedSentenceIndex(sIndex);
        setSelectedWordPos(null);

        console.log("Long pressed sentence:", sentence, "index:", sIndex);
    };

    async function test(word: string) {

        const result = await lookupLocalWord(word);

        if (result) {
            console.log("找到翻译:", result.translation);
        } else {
            console.log("词典里没有该单词");
        }
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.textWrapper}>
                {sentences.map((sentence, sIndex) => (
                    <View key={sIndex} style={styles.sentence}>
                        {splitIntoWords(sentence).map((word, wIndex) => {
                            const isWordSelected =
                                selectedWordPos?.sIndex === sIndex && selectedWordPos?.wIndex === wIndex;
                            const isSentenceSelected = selectedSentenceIndex === sIndex;

                            return (
                                <Text
                                    key={wIndex}
                                    onPress={() => handleWordPress(sIndex, wIndex, word)}
                                    onLongPress={() => handleSentenceLongPress(sIndex, sentence)}
                                    style={[
                                        styles.word,
                                        isWordSelected && styles.selectedWord,
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
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    textWrapper: { padding: 16, flexDirection: "row", flexWrap: "wrap" },
    sentence: { flexDirection: "row", flexWrap: "wrap" },
    word: { fontSize: 16, lineHeight: 24 },
    selectedWord: { backgroundColor: "#ffe58a" },
    selectedSentence: { backgroundColor: "#ffd6a5" },
});