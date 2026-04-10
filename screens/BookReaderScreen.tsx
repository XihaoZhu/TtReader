// /src/screens/BookReaderScreen.tsx
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, TouchableWithoutFeedback, Pressable } from "react-native";
import { RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../App";
import * as FileSystem from "expo-file-system/legacy";

import Reader from "../components/Reader";
import TranslationBubble from "../components/TranslationBubble";
import { lookupLocalWord } from "../services/WordDictionary";
import { getSavedWords, saveWord, removeWord } from "../services/CasheService";
import { saveProgress, getProgress } from "../utils/ReadingProgress";
import { translate } from "../services/TranslationService";


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
    const [phonetic, setPhonetic] = useState<string | null>(null);
    const [isWord, setIsWord] = useState(true);

    const openBubble = (text: string) => {
        setCurrentText(text);
        setTranslation([]);
        setPhonetic(null);
        setBubbleVisible(true);;
    };

    // short press on word
    const handleWordPress = async (word: string) => {
        openBubble(word);
        setIsWord(true);

        const result = await lookupLocalWord(word);

        if (result) {
            setTranslation(result.translation)
            setPhonetic(result.phonetic || null);
        } else {
            setTranslation(["No local result"]);
        }
    };

    // long press on sentence
    const handleSentenceLongPress = async (sentence: string) => {
        setIsWord(false);
        try {
            openBubble(sentence);
            setTranslation(["Translating..."]);
            const translated = await translate(sentence);
            setTranslation(translated);
        } catch (err) {
            console.log("FULL ERROR:", err);
        }
    };
    // #endregion

    // #region Words saving logic
    const [savedWords, setSavedWords] = useState<string[]>([]);

    useEffect(() => {
        loadSavedWords();
    }, []);

    const loadSavedWords = async () => {
        const words = await getSavedWords();
        setSavedWords(words.map(w => w.word));
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

    // #region last read progress
    const [lastReadLine, setLastReadLine] = useState(0);

    useEffect(() => {
        (async () => {
            const progress = await getProgress(filePath);
            setLastReadLine(progress ? progress.lineIndex : 0);
        })();
    }, [filePath]);
    // #endregion

    return (
        <Pressable onPress={() => {
            if (bubbleVisible) {
                setBubbleVisible(false);
            }
        }}
            style={{ width: "100%", height: "100%" }}
        >
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
                            initialIndex={lastReadLine}
                            filePath={filePath}
                        />

                        <TranslationBubble
                            visible={bubbleVisible}
                            text={currentText}
                            translation={translation}
                            isSaved={isSaved}
                            phonetic={phonetic}
                            onSave={handleSave}
                            onRemove={handleRemove}
                            isWord={isWord}
                        />
                    </>
                )}
            </View>
        </Pressable>);
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    title: {
        alignSelf: "center",
        fontSize: 24,
        fontWeight: "bold",
        padding: 16,
    },
});