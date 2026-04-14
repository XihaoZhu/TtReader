import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Pressable } from "react-native";
import { useReader } from "./ReaderContext";

interface Props {
    visible: boolean;
    text: string;
    translation: string[];
    phonetic?: string | null;
    onSave: () => void;
    onRemove: () => void;
    isSaved: boolean;
    isWord: boolean;
}

export default function TranslationBubble({
    visible,
    text,
    translation,
    onSave,
    onRemove,
    phonetic,
    isSaved,
    isWord,
}: Props) {
    const { readerTheme } = useReader();

    if (!visible) return null;

    return (
        <Pressable onPress={() => { }}>
            <View style={[styles.container, { backgroundColor: readerTheme.card, borderColor: readerTheme.border }]}>
                <View style={styles.row}>
                    <Text
                        style={[
                            styles.word,
                            { color: readerTheme.text, backgroundColor: readerTheme.background, borderColor: readerTheme.border },
                        ]}
                    >
                        {text}
                    </Text>

                    <TouchableOpacity
                        onPress={isSaved ? onRemove : onSave}
                        style={styles.buttonContainer}
                    >
                        {isWord && (
                            <Text style={[styles.button, { color: readerTheme.accent }]}>
                                {isSaved ? "Saved" : "Save"}
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>
                {phonetic && <Text style={[styles.phonetic, { color: readerTheme.muted }]}>{phonetic}</Text>}
                {isWord ? (
                    translation.map((t, i) => (
                        <Text key={i} style={[styles.wordTranslation, { color: readerTheme.text }]}>
                            {t}
                        </Text>
                    ))
                ) : (
                    <Text style={[styles.sentenceTranslation, { color: readerTheme.text }]}>{translation[0]}</Text>
                )}
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        paddingTop: 14,
        paddingHorizontal: 16,
        paddingBottom: 22,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopLeftRadius: 18,
        borderTopRightRadius: 18,
        shadowColor: "#000",
        shadowOpacity: 0.12,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: -10 },
        elevation: 12,
    },
    word: {
        fontSize: 18,
        fontWeight: "800",
        flexShrink: 1,
        borderWidth: StyleSheet.hairlineWidth,
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 6,
    },
    wordTranslation: {
        fontSize: 16,
        lineHeight: 22,
    },
    sentenceTranslation: {
        marginTop: 8,
        fontSize: 16,
        lineHeight: 22,
    },
    buttonContainer: {
        marginLeft: 8,
    },
    button: {
        fontSize: 20,
        fontWeight: "800",
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 8,
    },
    phonetic: {
        fontSize: 14,
        marginBottom: 8,
    },
});
