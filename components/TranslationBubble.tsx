
import React from "react";
import { View, Text, StyleSheet, TouchableWithoutFeedback, TouchableOpacity } from "react-native";


interface Props {
    visible: boolean;
    text: string;
    translation: string[];
    onSave: () => void;
    onRemove: () => void;
    isSaved: boolean;
}

export default function TranslationBubble({
    visible,
    text,
    translation,
    onSave,
    onRemove,
    isSaved,
}: Props) {
    if (!visible) return null;

    return (
        <TouchableWithoutFeedback onPress={() => { }}>
            <View style={styles.container}>
                <View style={styles.row}>
                    <Text style={styles.word}>{text}</Text>

                    <TouchableOpacity
                        onPress={isSaved ? onRemove : onSave}
                        style={styles.buttonContainer}
                    >
                        <Text style={styles.button}>
                            {isSaved ? "★ Saved" : "☆ Save"}
                        </Text>
                    </TouchableOpacity>
                </View>
                {translation.length > 0 ? (
                    translation.map((t, i) => (
                        <Text key={i} style={styles.translation}>
                            {t}
                        </Text>
                    ))
                ) : (
                    <Text style={styles.translation}>No translation found</Text>
                )}
            </View>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "#fff",
        padding: 16,
        borderTopWidth: 1,
        borderColor: "#ddd",
    },
    word: {
        fontSize: 18,
        fontWeight: "bold",
        flexShrink: 1,
        borderBlockColor: "#1890ff",
        borderWidth: 1,
        borderRadius: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    translation: {
        fontSize: 16,
    },
    buttonContainer: {
        marginLeft: 8,
    },
    button: {
        fontSize: 20,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 8,
    }
});