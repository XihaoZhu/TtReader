
import React from "react";
import {
    View,
    Text,
    Modal,
    TouchableWithoutFeedback,
    TouchableOpacity,
    StyleSheet,
} from "react-native";

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
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay}>

                    <TouchableWithoutFeedback>
                        <View style={styles.bubble}>

                            <Text style={styles.word}>{word}</Text>

                            {phonetic && (
                                <Text style={styles.phonetic}>{phonetic}</Text>
                            )}

                            {translation.map((t, i) => (
                                <Text key={i} style={styles.translation}>
                                    {t}
                                </Text>
                            ))}

                            <View style={styles.actions}>
                                <TouchableOpacity onPress={onDelete}>
                                    <Text style={styles.delete}>Delete</Text>
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
        backgroundColor: "#fffdf8",
        borderRadius: 20,

        paddingHorizontal: 20,
        paddingVertical: 18,

        shadowColor: "#000",
        shadowOpacity: 0.16,
        shadowRadius: 28,
        shadowOffset: { width: 0, height: 18 },

        elevation: 10,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: "#e7e0d6",
    },

    word: {
        fontSize: 24,
        fontWeight: "600",
        color: "#111827",

        marginBottom: 6,
    },

    phonetic: {
        fontSize: 14,
        color: "#6b7280",

        marginBottom: 12,
    },

    translation: {
        fontSize: 16,
        color: "#374151",

        lineHeight: 22,
        marginBottom: 6,
    },

    actions: {
        marginTop: 16,
        paddingTop: 12,

        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: "#e7e0d6",

        flexDirection: "row",
        justifyContent: "flex-end",
    },

    delete: {
        fontSize: 15,
        color: "#d92d20",
        fontWeight: "500",
    },
});
