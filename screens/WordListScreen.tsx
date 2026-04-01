import React, { useEffect, useState } from "react";
import { View, Text, FlatList } from "react-native";
import { getSavedWords } from "../services/CasheService";

export default function WordListScreen() {
    const [words, setWords] = useState<string[]>([]);

    useEffect(() => {
        load();
    }, []);

    const load = async () => {
        const data = await getSavedWords();
        setWords(data);
    };

    return (
        <View style={{ flex: 1, padding: 16 }}>
            <FlatList
                data={words}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                    <Text style={{ fontSize: 18, marginBottom: 8 }}>
                        {item}
                    </Text>
                )}
            />
        </View>
    );
}