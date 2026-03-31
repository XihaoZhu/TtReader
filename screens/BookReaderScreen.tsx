// /src/screens/BookReaderScreen.tsx
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../App";
import { File, Directory, Paths } from 'expo-file-system';
import Reader from "../components/Reader";

type BookReaderRouteProp = RouteProp<RootStackParamList, "BookReader">;

interface Props {
    route: BookReaderRouteProp;
}

export default function BookReaderScreen({ route }: Props) {
    const { filePath, title } = route.params;

    const [content, setContent] = useState<string>("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadContent();
    }, []);

    const loadContent = async () => {
        try {
            const file = new File(filePath);

            const text = await file.text();

            setContent(text);
        } catch (err) {
            console.error("failed to load file:", err);
            setContent("Failed to load file");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            {loading ? (
                <ActivityIndicator size="large" />
            ) : (
                <>
                    <Text style={styles.title}>{title}</Text>
                    <Reader content={content} />
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scroll: { padding: 16 },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 12,
    },
    content: {
        fontSize: 16,
        lineHeight: 24,
    },
});