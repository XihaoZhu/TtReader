// /src/screens/BookReaderScreen.tsx
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, TouchableWithoutFeedback } from "react-native";
import { RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../App";
import * as FileSystem from "expo-file-system/legacy";

import Reader from "../components/Reader";
import TranslationBubble from "../components/TranslationBubble";
import { lookupLocalWord } from "../services/WordDictionary";


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


    const [bubbleVisible, setBubbleVisible] = useState(false);
    const [currentText, setCurrentText] = useState("");
    const [translation, setTranslation] = useState<string[]>([]);
    const [clickDisabled, setClickDisabled] = useState(false);

    // short press on word
    const handleWordPress = async (word: string) => {
        setCurrentText(word);
        setBubbleVisible(true);
        setClickDisabled(true);

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
        setClickDisabled(true);

        // temproray mock
        setTranslation(["Sentence translation coming soon..."]);
    };

    return (
        <TouchableWithoutFeedback onPress={() => {
            if (bubbleVisible) {
                setClickDisabled(false)
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
                        />

                        <TranslationBubble
                            visible={bubbleVisible}
                            text={currentText}
                            translation={translation}
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