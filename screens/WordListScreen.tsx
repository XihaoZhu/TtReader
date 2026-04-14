import React, { useState } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import { lookupLocalWord } from "../services/WordDictionary";
import WordDetailModal from "../components/WordDetailModal";
import { useSavedWordsStore } from "../stores/savedWordsStore";
import { useReader } from "../components/ReaderContext";

export default function WordListScreen() {
    const { readerTheme } = useReader();
    const words = useSavedWordsStore((s) => s.words);
    const removeWord = useSavedWordsStore((s) => s.removeWord);

    const [selectedWord, setSelectedWord] = useState<string | null>(null);
    const [translation, setTranslation] = useState<string[]>([]);
    const [phonetic, setPhonetic] = useState<string | null>(null);
    const [visible, setVisible] = useState(false);

    const handlePress = async (word: string) => {
        setSelectedWord(word);

        const result = await lookupLocalWord(word);
        setTranslation(result?.translation || ["No translation"]);
        setPhonetic(result?.phonetic || null);
        setVisible(true);
    };

    const handleDelete = async () => {
        if (!selectedWord) return;
        setVisible(false);
        removeWord(selectedWord);
    };

    return (
        <View style={[styles.container, { backgroundColor: readerTheme.background }]}>
            <FlatList
                data={[...words].sort((a, b) => b.createdAt - a.createdAt)}
                keyExtractor={(item) => item.word}
                style={styles.listContent}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={[
                            styles.itemCard,
                            { backgroundColor: readerTheme.card, borderColor: readerTheme.border },
                        ]}
                        activeOpacity={0.7}
                        onPress={() => handlePress(item.word)}
                    >
                        <Text style={[styles.itemText, { color: readerTheme.text }]}>{item.word}</Text>
                    </TouchableOpacity>
                )}
            />
            <WordDetailModal
                visible={visible}
                word={selectedWord || ""}
                translation={translation}
                phonetic={phonetic}
                onClose={() => {
                    setVisible(false);
                    setSelectedWord(null);
                    setTranslation([]);
                    setPhonetic(null);
                }}
                onDelete={handleDelete}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    listContent: {
        paddingHorizontal: 16,
        paddingTop: 14,
        paddingBottom: 48,
    },
    itemCard: {
        alignItems: "flex-start",
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: StyleSheet.hairlineWidth,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 10 },
        elevation: 3,
    },
    itemText: {
        fontSize: 17,
        fontWeight: "600",
    },
});
