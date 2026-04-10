// /src/screens/BookReaderScreen.tsx
import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Pressable } from "react-native";
import { RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../App";
import * as FileSystem from "expo-file-system/legacy";

import Reader from "../components/Reader";
import TranslationBubble from "../components/TranslationBubble";
import { lookupLocalWord } from "../services/WordDictionary";
import { saveProgress, getProgress } from "../utils/ReadingProgress";
import { translate } from "../services/TranslationService";
import { useSavedWordsStore } from "../stores/savedWordsStore";


type BookReaderRouteProp = RouteProp<RootStackParamList, "BookReader">;

interface RouteProps {
    route: BookReaderRouteProp;
}

interface DirectProps {
    filePath: string;
    title: string;
}

type Props = RouteProps | DirectProps;

export default function BookReaderScreen(props: Props) {
    const { filePath, title } = "route" in props ? props.route.params : props;

    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(true);

    const loadContent = async () => {
        setLoading(true);
        try {
            const text = await FileSystem.readAsStringAsync(filePath);
            setContent(text);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadContent();
    }, [filePath]);

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
    const savedWordItems = useSavedWordsStore((s) => s.words);
    const savedWords = useMemo(() => savedWordItems.map((w) => w.word), [savedWordItems]);
    const saveWord = useSavedWordsStore((s) => s.saveWord);
    const removeWord = useSavedWordsStore((s) => s.removeWord);
    const isSaved = useSavedWordsStore((s) => s.hasWord(currentText));

    const handleSave = () => {
        saveWord(currentText);
    };

    const handleRemove = () => {
        removeWord(currentText);
    };
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
            style={{ flex: 1 }}
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
    container: { flex: 1, backgroundColor: "#fffdf8" },
    title: {
        alignSelf: "center",
        fontSize: 16,
        fontWeight: "700",
        letterSpacing: 0.2,
        color: "#374151",
        paddingTop: 12,
        paddingBottom: 10,
        paddingHorizontal: 16,
    },
});
