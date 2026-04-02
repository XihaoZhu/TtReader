import React, { useCallback, useEffect, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { View, Text, FlatList, StyleSheet, Pressable, TouchableOpacity } from "react-native";
import { getSavedWords, removeWord, SavedWord } from "../services/CasheService";
import { lookupLocalWord } from "../services/WordDictionary";
import WordDetailModal from "../components/WordDetailModal";

export default function WordListScreen() {

    const [words, setWords] = useState<SavedWord[]>([]);

    useFocusEffect(
        useCallback(() => {
            load();
        }, [])
    );

    const load = async () => {
        const data = await getSavedWords();

        const sorted = data.sort(
            (a, b) => b.createdAt - a.createdAt
        );

        setWords(sorted);
    };


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
        setWords(prev => prev.filter(w => w.word !== selectedWord));

        setVisible(false);

        await removeWord(selectedWord);
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={words}
                keyExtractor={(item, index) => item.word + index}
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
        padding: 16,
    },
    listContent: {
        paddingHorizontal: 12,
        paddingTop: 10,
        paddingBottom: 40,
    },

    itemCard: {
        backgroundColor: "#fff",

        alignItems: "center",

        paddingVertical: 14,
        paddingHorizontal: 16,

        borderRadius: 12,

        marginBottom: 10,

        // 阴影（iOS）
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },

        // Android
        elevation: 2,
    },

    itemText: {
        fontSize: 17,
        color: "#222",
    },
});