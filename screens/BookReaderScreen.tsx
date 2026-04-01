// /src/screens/BookReaderScreen.tsx
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, TouchableWithoutFeedback } from "react-native";
import { RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../App";
import * as FileSystem from "expo-file-system/legacy";

import Reader from "../components/Reader";
import TranslationBubble from "../components/TranslationBubble";
import { lookupLocalWord } from "../services/WordDictionary";
import { getSavedWords, saveWord, removeWord } from "../services/CasheService";


type BookReaderRouteProp = RouteProp<RootStackParamList, "BookReader">;

interface Props {
    route: BookReaderRouteProp;
}

export default function BookReaderScreen({ route }: Props) {
    const { filePath, title } = route.params;

    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadContent();
    }, []);

    const loadContent = async () => {
        try {
            const text = await FileSystem.readAsStringAsync(filePath);
            setContent(text);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // #region Bubble logic
    const [bubbleVisible, setBubbleVisible] = useState(false);
    const [currentText, setCurrentText] = useState("");
    const [translation, setTranslation] = useState<string[]>([]);

    // short press on word
    const handleWordPress = async (word: string) => {
        setCurrentText(word);
        setBubbleVisible(true);

        const result = await lookupLocalWord(word);

        if (result) {
            setTranslation(result.translation);
        } else {
            setTranslation(["No local result"]);
        }
    };

    // long press on sentence
    const handleSentenceLongPress = async (sentence: string) => {
        setCurrentText(sentence);
        setBubbleVisible(true);

        // temproray mock
        setTranslation(["Sentence translation coming soon..."]);
    };
    // #endregion

    // #region Words saving logic
    const [savedWords, setSavedWords] = useState<string[]>([]);

    useEffect(() => {
        loadSavedWords();
    }, []);

    const loadSavedWords = async () => {
        const words = await getSavedWords();
        setSavedWords(words);
    };

    const handleSave = async () => {
        await saveWord(currentText.toLowerCase());
        loadSavedWords();
    };

    const handleRemove = async () => {
        await removeWord(currentText.toLowerCase());
        loadSavedWords();
    };

    const isSaved = savedWords.includes(currentText.toLowerCase());
    // #endregion

    return (
        <TouchableWithoutFeedback onPress={() => {
            if (bubbleVisible) {
                setBubbleVisible(false);
            }
        }}>
            <View style={styles.container}>
                {loading ? (
                    <ActivityIndicator size="large" />
                ) : (
                    <>
                        <Text style={styles.title}>{title}</Text>

                        <Reader
                            content={content}
                            onWordPress={handleWordPress}
                            onSentenceLongPress={handleSentenceLongPress}
                            bubbleVisible={bubbleVisible}
                            onCloseBubble={() => setBubbleVisible(false)}
                            savedWords={savedWords}
                        />

                        <TranslationBubble
                            visible={bubbleVisible}
                            text={currentText}
                            translation={translation}
                            isSaved={isSaved}
                            onSave={handleSave}
                            onRemove={handleRemove}
                        />
                    </>
                )}
            </View>
        </TouchableWithoutFeedback>);
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        padding: 16,
    },
});