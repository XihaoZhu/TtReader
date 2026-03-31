
import React from "react";
import { View, Text, StyleSheet, TouchableWithoutFeedback } from "react-native";


interface Props {
    visible: boolean;
    text: string;
    translation: string[];
}

export default function TranslationBubble({
    visible,
    text,
    translation,
}: Props) {
    if (!visible) return null;

    return (
        <TouchableWithoutFeedback onPress={() => { }}>
            <View style={styles.container}>
                <Text style={styles.word}>{text}</Text>
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
        marginBottom: 8,
    },
    translation: {
        fontSize: 16,
    },
});