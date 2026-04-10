import React, { useEffect } from "react";
import { BackHandler, Pressable, StyleSheet, Text, View } from "react-native";
import { useReader } from "../components/ReaderContext";
import BookReaderScreen from "../screens/BookReaderScreen";

export default function ReaderOverlay() {
    const { reader, closeReader } = useReader();

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
            style={[styles.overlay, !reader.visible && styles.hidden]}
        >
            <View style={styles.topBar}>
                <Pressable onPress={closeReader} hitSlop={12} style={styles.closeBtn}>
                    <Text style={styles.closeText}>Close</Text>
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
        backgroundColor: "#fffdf8",
        zIndex: 999,
    },
    hidden: {
        opacity: 0,
    },
    topBar: {
        height: 44,
        justifyContent: "center",
        alignItems: "flex-end",
        paddingHorizontal: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: "#e7e0d6",
        backgroundColor: "#fffdf8",
    },
    content: {
        flex: 1,
    },
    closeBtn: {
        paddingVertical: 6,
        paddingHorizontal: 10,
    },
    closeText: {
        color: "#0a6cff",
        fontSize: 16,
        fontWeight: "600",
    },
});
