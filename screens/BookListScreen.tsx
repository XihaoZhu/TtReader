// /src/screens/BookListScreen.tsx
import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";
import * as FileSystem from "expo-file-system";
import { Asset } from "expo-asset";
import { useBookManager } from "../hooks/useBookManager";
import { useReader } from "../components/ReaderContext";

type NavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    "BookList"
>;

interface Props {
    navigation: NavigationProp;
}

interface Book {
    id: string;
    title: string;
    uri: string;
}

type BookItem = {
    id: string;
    name: string;
    uri: string;
    type: "txt";
    addedAt: number;
};

export default function BookListScreen({ navigation }: Props) {
    const { openReader } = useReader();

    const openBook = (book: BookItem) => {
        openReader(book.uri, book.name);
    };

    // #region real books import
    const { bookList, importBook, removeBook } = useBookManager();


    // #endregion
    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.importBtn} onPress={importBook}>
                <Text style={{ color: 'white', fontWeight: 'bold' }}>Import Book</Text>
            </TouchableOpacity>

            <FlatList
                data={bookList}
                keyExtractor={item => item.id}
                contentContainerStyle={{ padding: 16 }}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.bookItem}
                        activeOpacity={0.8}
                        onPress={() => openBook(item)}
                    >
                        <Text style={styles.bookName}>{item.name}</Text>

                        <View style={styles.actions}>
                            <TouchableOpacity
                                onPress={() => removeBook(item.id)}
                            >
                                <Text style={styles.removeBtn}>Remove</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f3f0ea" },
    importBtn: {
        backgroundColor: "#0a6cff",
        margin: 16,
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOpacity: 0.12,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 8 },
        elevation: 4,
    },
    bookItem: {
        backgroundColor: "#fffdf8",
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 10 },
        elevation: 3,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: "#e7e0d6",
    },
    bookName: { fontSize: 16, fontWeight: "600", color: "#1f2937" },
    actions: { flexDirection: 'row', marginTop: 8, justifyContent: 'flex-end' },
    removeBtn: { color: "#d92d20", fontWeight: "600" },
});
