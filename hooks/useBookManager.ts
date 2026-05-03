import { useState, useEffect, useRef } from 'react';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { Asset } from 'expo-asset';
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
const BOOTSTRAP_KEY = 'WELCOME_BOOK_BOOTSTRAPPED';
const GUIDE_FILE_NAME = 'TT Reader Welcome Guide.txt';
const GUIDE_ASSET = require('../assets/welcome.txt');

export const useBookManager = () => {
    const [bookList, setBookList] = useState<BookItem[]>([]);
    const [isReady, setIsReady] = useState(false);
    const bootstrapAttemptedRef = useRef(false);

    useEffect(() => {
        bootstrapLibrary();
    }, []);

    const persistBooks = async (nextList: BookItem[]) => {
        setBookList(nextList);
        await AsyncStorage.setItem(BOOK_LIST_KEY, JSON.stringify(nextList));
    };

    const loadBooks = async () => {
        const listRaw = await AsyncStorage.getItem(BOOK_LIST_KEY);
        const books: BookItem[] = listRaw ? JSON.parse(listRaw) : [];
        setBookList(books);
        return books;
    };

    const importBookFromUri = async (uri: string, name: string) => {
        const ext = name.split('.').pop()?.toLowerCase();
        if (ext !== 'txt') {
            throw new Error('Only TXT files are supported');
        }

        const destUri = `${FileSystem.documentDirectory}${name}`;
        await FileSystem.copyAsync({ from: uri, to: destUri });

        const newBook: BookItem = {
            id: uuidv4(),
            name,
            uri: destUri,
            type: 'txt',
            addedAt: Date.now(),
        };

        await persistBooks([...bookList, newBook]);
    };

    const importBundledGuide = async () => {
        const guideAsset = Asset.fromModule(GUIDE_ASSET);
        await guideAsset.downloadAsync();

        const sourceUri = guideAsset.localUri ?? guideAsset.uri;
        if (!sourceUri) {
            throw new Error('Unable to resolve bundled guide asset');
        }

        await importBookFromUri(sourceUri, GUIDE_FILE_NAME);
    };

    const bootstrapLibrary = async () => {
        if (bootstrapAttemptedRef.current) {
            return;
        }
        bootstrapAttemptedRef.current = true;

        try {
            const books = await loadBooks();
            if (books.length > 0) {
                return;
            }

            const bootstrapDone = await AsyncStorage.getItem(BOOTSTRAP_KEY);
            if (bootstrapDone) {
                return;
            }

            await importBundledGuide();
            await AsyncStorage.setItem(BOOTSTRAP_KEY, 'true');
        } catch (err) {
            console.warn('Failed to bootstrap welcome book', err);
        } finally {
            setIsReady(true);
        }
    };

    const importBook = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'text/plain',
            });

            if (result.canceled) return;

            const { uri, name } = result.assets[0];
            await importBookFromUri(uri, name);
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
        await persistBooks(newList);
    };

    return {
        bookList,
        importBook,
        removeBook,
        loadBooks,
        isReady,
    };
};
