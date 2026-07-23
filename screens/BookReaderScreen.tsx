// /src/screens/BookReaderScreen.tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { useReader } from "../components/ReaderContext";


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
    const { readerTheme, reader } = useReader();

    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        const loadReaderState = async () => {
            setLoading(true);
            try {
                const [text, progress] = await Promise.all([
                    FileSystem.readAsStringAsync(filePath),
                    getProgress(filePath),
                ]);
                if (cancelled) return;

                const lineIndex = progress ? progress.lineIndex : 0;
                setContent(text);
                setLastReadLine(lineIndex);
                lastVisibleLineRef.current = lineIndex;
            } catch (err) {
                if (!cancelled) {
                    console.error(err);
                    setContent("");
                    setLastReadLine(0);
                    lastVisibleLineRef.current = 0;
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        loadReaderState();

        return () => {
            cancelled = true;
        };
    }, [filePath]);

    // #region Bubble logic
    const [bubbleVisible, setBubbleVisible] = useState(false);
    const [currentText, setCurrentText] = useState("");
    const [translation, setTranslation] = useState<string[]>([]);
    const [phonetic, setPhonetic] = useState<string | null>(null);
    const [isWord, setIsWord] = useState(true);

    const openBubble = useCallback((text: string) => {
        setCurrentText(text);
        setTranslation([]);
        setPhonetic(null);
        setBubbleVisible(true);
    }, []);

    const handleWordPress = useCallback(async (word: string) => {
        openBubble(word);
        setIsWord(true);

        const result = await lookupLocalWord(word);

        if (result) {
            setTranslation(result.translation);
            setPhonetic(result.phonetic || null);
        } else {
            setTranslation(["No local result"]);
        }
    }, [openBubble]);

    const handleSentenceLongPress = useCallback(async (sentence: string) => {
        setIsWord(false);
        try {
            openBubble(sentence);
            setTranslation(["Translating..."]);
            const translated = await translate(sentence);
            setTranslation(translated);
        } catch (err) {
            console.log("FULL ERROR:", err);
        }
    }, [openBubble]);
    // #endregion

    // #region Words saving logic
    const savedWordItems = useSavedWordsStore((s) => s.words);
    const savedWords = useMemo(() => savedWordItems.map((w) => w.word), [savedWordItems]);
    const saveWord = useSavedWordsStore((s) => s.saveWord);
    const removeWord = useSavedWordsStore((s) => s.removeWord);
    const isSaved = useSavedWordsStore((s) => s.hasWord(currentText));

    const handleSave = useCallback(() => {
        saveWord(currentText);
    }, [currentText, saveWord]);

    const handleRemove = useCallback(() => {
        removeWord(currentText);
    }, [currentText, removeWord]);

    const closeBubble = useCallback(() => {
        setBubbleVisible(false);
    }, []);

    const handleVisibleLineChange = useCallback((lineIndex: number) => {
        lastVisibleLineRef.current = lineIndex;
    }, []);
    // #endregion

    // #region last read progress
    const [lastReadLine, setLastReadLine] = useState(0);
    const lastVisibleLineRef = useRef(0);
    const previousReaderVisibleRef = useRef(false);

    useEffect(() => {
        if (reader.visible) {
            previousReaderVisibleRef.current = true;
            return;
        }

        if (previousReaderVisibleRef.current) {
            previousReaderVisibleRef.current = false;
            void saveProgress(filePath, lastVisibleLineRef.current);
        }
    }, [reader.visible, filePath]);

    useEffect(() => {
        return () => {
            void saveProgress(filePath, lastVisibleLineRef.current);
        };
    }, [filePath]);
    // #endregion

    return (
        <Pressable
            onPress={() => {
                if (bubbleVisible) {
                    setBubbleVisible(false);
                }
            }}
            style={{ flex: 1, backgroundColor: readerTheme.background }}
        >
            <View style={styles.container}>
                {loading ? (
                    <View style={styles.loadingWrap}>
                        <ActivityIndicator size="large" color={readerTheme.accent} />
                    </View>
                ) : (
                    <>
                        <Text style={[styles.title, { color: readerTheme.text }]}>{title}</Text>

                        <Reader
                            key={filePath}
                            content={content}
                            onWordPress={handleWordPress}
                            onSentenceLongPress={handleSentenceLongPress}
                            bubbleVisible={bubbleVisible}
                            onCloseBubble={closeBubble}
                            savedWords={savedWords}
                            initialIndex={lastReadLine}
                            filePath={filePath}
                            isVisible={reader.visible}
                            onVisibleLineChange={handleVisibleLineChange}
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
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    loadingWrap: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    title: {
        alignSelf: "center",
        fontSize: 16,
        fontWeight: "700",
        letterSpacing: 0.2,
        paddingTop: 12,
        paddingBottom: 10,
        paddingHorizontal: 16,
    },
});
