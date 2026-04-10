import React, { useState } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import { lookupLocalWord } from "../services/WordDictionary";
import WordDetailModal from "../components/WordDetailModal";
import { SavedWord, useSavedWordsStore } from "../stores/savedWordsStore";

export default function WordListScreen() {
    const words = useSavedWordsStore(s => s.words);
    const removeWord = useSavedWordsStore(s => s.removeWord);


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
        <View style={styles.container}>
            <FlatList
                data={[...words].sort((a, b) => b.createdAt - a.createdAt)}
                keyExtractor={(item) => item.word}
                style={styles.listContent}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.itemCard}
                        activeOpacity={0.7}
                        onPress={() => handlePress(item.word)}
                    >
                        <Text style={styles.itemText}>{item.word}</Text>
                    </TouchableOpacity>
                )}
            />
            <WordDetailModal
                visible={visible}
                word={selectedWord || ""}
                translation={translation}
                phonetic={phonetic}
                onClose={() => {
                    setVisible(false)
                    setSelectedWord(null);
                    setTranslation([]);
                    setPhonetic(null);
                }
                }
                onDelete={handleDelete}
            />
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f3f0ea",
    },
    listContent: {
        paddingHorizontal: 16,
        paddingTop: 14,
        paddingBottom: 48,
    },

    itemCard: {
        backgroundColor: "#fffdf8",

        alignItems: "flex-start",

        paddingVertical: 14,
        paddingHorizontal: 16,

        borderRadius: 16,

        marginBottom: 12,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: "#e7e0d6",

        // 阴影（iOS）
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 10 },

        // Android
        elevation: 3,
    },

    itemText: {
        fontSize: 17,
        color: "#111827",
        fontWeight: "600",
    },
});
