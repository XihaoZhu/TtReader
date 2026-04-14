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
    const { openReader, readerTheme } = useReader();

    const openBook = (book: BookItem) => {
        openReader(book.uri, book.name);
    };

    // #region real books import
    const { bookList, importBook, removeBook } = useBookManager();


    // #endregion
    return (
        <View style={[styles.container, { backgroundColor: readerTheme.background }]}>
            <TouchableOpacity style={[styles.importBtn, { backgroundColor: readerTheme.accent }]} onPress={importBook}>
                <Text style={{ color: 'white', fontWeight: 'bold' }}>Import Book</Text>
            </TouchableOpacity>

            <FlatList
                data={bookList}
                keyExtractor={item => item.id}
                contentContainerStyle={{ padding: 16 }}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={[
                            styles.bookItem,
                            { backgroundColor: readerTheme.card, borderColor: readerTheme.border },
                        ]}
                        activeOpacity={0.8}
                        onPress={() => openBook(item)}
                    >
                        <Text style={[styles.bookName, { color: readerTheme.text }]}>{item.name}</Text>

                        <View style={styles.actions}>
                            <TouchableOpacity
                                onPress={() => removeBook(item.id)}
                            >
                                <Text style={[styles.removeBtn, { color: readerTheme.accent }]}>Remove</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    importBtn: {
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
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 10 },
        elevation: 3,
        borderWidth: StyleSheet.hairlineWidth,
    },
    bookName: { fontSize: 16, fontWeight: "600" },
    actions: { flexDirection: 'row', marginTop: 8, justifyContent: 'flex-end' },
    removeBtn: { fontWeight: "600" },
});
