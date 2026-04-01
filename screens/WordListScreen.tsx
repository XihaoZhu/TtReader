import React, { useCallback, useEffect, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { View, Text, FlatList } from "react-native";
import { getSavedWords } from "../services/CasheService";

export default function WordListScreen() {
    const [words, setWords] = useState<string[]>([]);

    useFocusEffect(
        useCallback(() => {
            load();
        }, [])
    );

    const load = async () => {
        const data = await getSavedWords();
        setWords(data);
    };

    return (
        <View style={{ flex: 1, padding: 16 }}>
            <FlatList
                data={words}
                keyExtractor={(item, index) => item + index}
                renderItem={({ item }) => (
                    <Text style={{ fontSize: 18, marginBottom: 8 }}>
                        {item}
                    </Text>
                )}
            />
        </View>
    );
}