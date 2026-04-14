import React from "react";
import {
    View,
    Text,
    Modal,
    TouchableWithoutFeedback,
    TouchableOpacity,
    StyleSheet,
} from "react-native";
import { useReader } from "./ReaderContext";

interface Props {
    visible: boolean;
    word: string;
    translation: string[];
    phonetic?: string | null;
    onClose: () => void;
    onDelete: () => void;
}

export default function WordDetailModal({
    visible,
    word,
    translation,
    onClose,
    onDelete,
    phonetic,
}: Props) {
    const { readerTheme } = useReader();

    return (
        <Modal visible={visible} transparent animationType="fade">
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback>
                        <View style={[styles.bubble, { backgroundColor: readerTheme.card, borderColor: readerTheme.border }]}>
                            <Text style={[styles.word, { color: readerTheme.text }]}>{word}</Text>

                            {phonetic && <Text style={[styles.phonetic, { color: readerTheme.muted }]}>{phonetic}</Text>}

                            {translation.map((t, i) => (
                                <Text key={i} style={[styles.translation, { color: readerTheme.text }]}>
                                    {t}
                                </Text>
                            ))}

                            <View style={[styles.actions, { borderTopColor: readerTheme.border }]}>
                                <TouchableOpacity onPress={onDelete}>
                                    <Text style={[styles.delete, { color: readerTheme.accent }]}>Delete</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(17,24,39,0.42)",
        justifyContent: "center",
        alignItems: "center",
    },
    bubble: {
        width: "85%",
        borderRadius: 20,
        paddingHorizontal: 20,
        paddingVertical: 18,
        shadowColor: "#000",
        shadowOpacity: 0.16,
        shadowRadius: 28,
        shadowOffset: { width: 0, height: 18 },
        elevation: 10,
        borderWidth: StyleSheet.hairlineWidth,
    },
    word: {
        fontSize: 24,
        fontWeight: "600",
        marginBottom: 6,
    },
    phonetic: {
        fontSize: 14,
        marginBottom: 12,
    },
    translation: {
        fontSize: 16,
        lineHeight: 22,
        marginBottom: 6,
    },
    actions: {
        marginTop: 16,
        paddingTop: 12,
        borderTopWidth: StyleSheet.hairlineWidth,
        flexDirection: "row",
        justifyContent: "flex-end",
    },
    delete: {
        fontSize: 15,
        fontWeight: "500",
    },
});
