import { useState, useEffect } from 'react';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

export type BookItem = {
    id: string;
    name: string;
    uri: string;
    type: 'txt';
    addedAt: number;
};

const BOOK_LIST_KEY = 'MY_BOOK_LIST';

export const useBookManager = () => {
    const [bookList, setBookList] = useState<BookItem[]>([]);

    useEffect(() => {
        loadBooks();
    }, []);

    const loadBooks = async () => {
        const listRaw = await AsyncStorage.getItem(BOOK_LIST_KEY);
        const books: BookItem[] = listRaw ? JSON.parse(listRaw) : [];
        setBookList(books);
    };

    // 导入书籍
    const importBook = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['text/plain', 'application/epub+zip'], // txt + epub
            });

            if (result.canceled) return;

            const { uri, name } = result.assets[0];

            const ext = name.split('.').pop()?.toLowerCase();
            if (!ext || !['txt'].includes(ext)) {
                alert('Only TXT files are supported');
                return;
            }

            const destUri = `${FileSystem.documentDirectory}${name}`;
            await FileSystem.copyAsync({ from: uri, to: destUri });

            const newBook: BookItem = {
                id: uuidv4(),
                name,
                uri: destUri,
                type: ext as 'txt',
                addedAt: Date.now(),
            };

            const newList = [...bookList, newBook];
            setBookList(newList);
            await AsyncStorage.setItem(BOOK_LIST_KEY, JSON.stringify(newList));

        } catch (err) {
            console.error(err);
            alert('Failed to import book');
        }
    };


    const removeBook = async (id: string, deleteFile = false) => {
        const bookToRemove = bookList.find(b => b.id === id);
        if (!bookToRemove) return;

        if (deleteFile) {
            await FileSystem.deleteAsync(bookToRemove.uri, { idempotent: true });
        }

        const newList = bookList.filter(b => b.id !== id);
        setBookList(newList);
        await AsyncStorage.setItem(BOOK_LIST_KEY, JSON.stringify(newList));
    };

    return {
        bookList,
        importBook,
        removeBook,
        loadBooks,
    };
};