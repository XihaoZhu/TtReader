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
    const [books, setBooks] = useState<Book[]>([]);

    useEffect(() => {
        loadBooks();
    }, []);

    const loadBooks = async () => {

        const assets = [
            require("../assets/books/book1.txt"),
        ];

        const loadedBooks: Book[] = [];

        for (let i = 0; i < assets.length; i++) {
            const asset = Asset.fromModule(assets[i]);
            await asset.downloadAsync();

            loadedBooks.push({
                id: String(i),
                title: `Book ${i + 1}`,
                uri: asset.localUri || asset.uri,
            });
        }

        setBooks(loadedBooks);
    };

    const openBook = (book: BookItem) => {
        navigation.navigate("BookReader", {
            filePath: book.uri,
            title: book.name,
        });
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
                    <View style={styles.bookItem}>
                        <Text style={styles.bookName}>{item.name}</Text>
                        <View style={styles.actions}>
                            <TouchableOpacity onPress={() => openBook(item)}>
                                <Text style={styles.openBtn}>Open</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => removeBook(item.id)}>
                                <Text style={styles.removeBtn}>Remove</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f7' },
    importBtn: {
        backgroundColor: '#007aff',
        margin: 16,
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
    },
    bookItem: {
        backgroundColor: '#fff',
        padding: 14,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 2,
    },
    bookName: { fontSize: 16, fontWeight: '500', color: '#222' },
    actions: { flexDirection: 'row', marginTop: 8, justifyContent: 'flex-end' },
    openBtn: { color: '#007aff', marginRight: 16 },
    removeBtn: { color: '#ff3b30' },
});