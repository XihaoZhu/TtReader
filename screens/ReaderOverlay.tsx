import React, { useEffect } from "react";
import { BackHandler, Platform, Pressable, StatusBar, StyleSheet, Text, View } from "react-native";
import { useReader } from "../components/ReaderContext";
import BookReaderScreen from "../screens/BookReaderScreen";

export default function ReaderOverlay() {
    const { reader, closeReader, readerTheme } = useReader();

    useEffect(() => {
        if (!reader.visible) return;

        const sub = BackHandler.addEventListener("hardwareBackPress", () => {
            closeReader();
            return true;
        });

        return () => sub.remove();
    }, [reader.visible, closeReader]);

    if (!reader.filePath) return null;

    return (
        <View
            pointerEvents={reader.visible ? "auto" : "none"}
            style={[
                styles.overlay,
                { backgroundColor: readerTheme.background },
                !reader.visible && styles.hidden,
            ]}
        >
            <View style={[styles.topBar, { backgroundColor: readerTheme.background, borderBottomColor: readerTheme.border }]}>
                <Pressable onPress={closeReader} hitSlop={12} style={styles.closeBtn}>
                    <Text style={[styles.closeText, { color: readerTheme.accent }]}>Close</Text>
                </Pressable>
            </View>
            <View style={styles.content}>
                <BookReaderScreen
                    key={reader.filePath}
                    filePath={reader.filePath}
                    title={reader.title ?? ""}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 999,
    },
    hidden: {
        opacity: 0,
    },
    topBar: {
        height: 44 + (Platform.OS === "android" ? (StatusBar.currentHeight ?? 0) : 0),
        justifyContent: "center",
        alignItems: "flex-end",
        paddingHorizontal: 12,
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight ?? 0 : 0,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    content: {
        flex: 1,
    },
    closeBtn: {
        paddingVertical: 6,
        paddingHorizontal: 10,
    },
    closeText: {
        fontSize: 16,
        fontWeight: "600",
    },
});
