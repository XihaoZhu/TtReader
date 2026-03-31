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

    const openBook = (book: Book) => {
        navigation.navigate("BookReader", {
            filePath: book.uri,
            title: book.title,
        });
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={books}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.item}
                        onPress={() => openBook(item)}
                    >
                        <Text style={styles.title}>{item.title}</Text>
                        <Text style={styles.path}>{item.uri}</Text>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16 },
    item: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#ccc",
    },
    title: { fontSize: 18, fontWeight: "bold" },
    path: { fontSize: 12, color: "gray" },
});