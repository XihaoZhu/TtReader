
import React from "react";
import { View, Text, StyleSheet, TouchableWithoutFeedback, TouchableOpacity, Pressable } from "react-native";


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

    if (!visible) return null;

    return (
        <Pressable onPress={() => { }}>
            <View style={styles.container}>
                <View style={styles.row}>
                    <Text style={styles.word}>{text}</Text>

                    <TouchableOpacity
                        onPress={isSaved ? onRemove : onSave}
                        style={styles.buttonContainer}
                    >
                        {isWord && (
                            <Text style={styles.button}>
                                {isSaved ? "★ Saved" : "☆ Save"}
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>
                {phonetic && (
                    <Text style={styles.phonetic}>{phonetic}</Text>
                )}
                {isWord ? (
                    translation.map((t, i) => (
                        <Text key={i} style={styles.wordTranslation}>
                            {t}
                        </Text>
                    ))
                ) : (
                    <Text style={styles.sentenceTranslation}>{translation[0]}</Text>
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
        backgroundColor: "#fffdf8",
        paddingTop: 14,
        paddingHorizontal: 16,
        paddingBottom: 22,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderColor: "#e7e0d6",
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
        color: "#111827",
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: "#e7e0d6",
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 6,
        backgroundColor: "#fbf7ef",
    },
    wordTranslation: {
        fontSize: 16,
        color: "#374151",
        lineHeight: 22,
    },
    sentenceTranslation: {
        marginTop: 8,
        fontSize: 16,
        color: "#374151",
        lineHeight: 22,
    },
    buttonContainer: {
        marginLeft: 8,
    },
    button: {
        fontSize: 20,
        color: "#0a6cff",
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
        color: "#6b7280",
        marginBottom: 8,
    },
});
