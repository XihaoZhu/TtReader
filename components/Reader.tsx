import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, StyleSheet, FlatList, Pressable, ViewToken } from "react-native";
import { splitIntoWords } from "../utils/WordSplitter";
import { splitIntoSentences } from "../utils/SentenceSplitter";
import { getCachedContent, setCachedContent } from "../utils/ContentCache";
import { saveProgress } from "../utils/ReadingProgress";



const estimatedLineHeight = 44;


interface Props {
    content: string;
    onWordPress: (word: string) => void;
    onSentenceLongPress: (sentence: string) => void;
    bubbleVisible: boolean;
    onCloseBubble: () => void;
    savedWords: string[];
    initialIndex?: number;
    filePath: string;
}

export default function Reader({
    content,
    onWordPress,
    onSentenceLongPress,
    bubbleVisible,
    onCloseBubble,
    savedWords,
    initialIndex = 0,
    filePath,
}: Props) {

    // #region Selection state
    const [selectedWordPos, setSelectedWordPos] = useState<{ sIndex: number; wIndex: number } | null>(null);
    const [selectedSentenceIndex, setSelectedSentenceIndex] = useState<number | null>(null);

    const handleWordPress = (sIndex: number, wIndex: number, word: string) => {
        setSelectedWordPos({ sIndex, wIndex });
        setSelectedSentenceIndex(null);
        onWordPress(word);
    };

    const handleSentenceLongPress = (sIndex: number, sentence: string) => {
        setSelectedSentenceIndex(sIndex);
        setSelectedWordPos(null);
        onSentenceLongPress(sentence);
    };

    function cleanWord(word: string) {
        return word.replace(/^[\p{P}\p{S}]+|[\p{P}\p{S}]+$/gu, "");
    }

    function normalizeWord(word: string) {
        return word.replace(/[^a-zA-Z]/g, "").toLowerCase();
    }
    // #endregion

    // #region memo
    const sentences = useMemo(() => {
        if (getCachedContent(content)) {
            return getCachedContent(content)!;
        }

        const result = splitIntoSentences(content);
        setCachedContent(content, result);

        return result;
    }, [content]);

    // #endregion

    // #region auto save progress
    const onViewableItemsChanged = useRef(({
        viewableItems,
        changed,
    }: {
        viewableItems: ViewToken[];
        changed: ViewToken[];
    }) => {
        if (viewableItems.length > 0) {
            const firstVisible = viewableItems[0];
            saveProgress(filePath, firstVisible.index ?? 0);
        }
    }).current;

    const listRef = useRef<FlatList>(null);
    const [ready, setReady] = useState(false);
    const [listReady, setListReady] = useState(false);

    const hasScrolledRef = useRef(false);

    useEffect(() => {
        if (!hasScrolledRef.current && listReady && initialIndex != null) {
            hasScrolledRef.current = true;

            setTimeout(() => {
                scrollToInitialIndex();
                setReady(true);
            }, 0);
        }
    }, [listReady, initialIndex]);

    const scrollToInitialIndex = () => {
        if (initialIndex == null) return;

        listRef.current?.scrollToIndex({
            index: initialIndex,
            animated: true,
        });
    };


    // #endregion

    const renderLine = ({ item: sentence, index: sentenceIndex }: { item: string; index: number }) => {

        if (sentence === "") {
            return (<Pressable
                onPress={() => {
                    if (bubbleVisible) { onCloseBubble() }
                }}><Text style={styles.emptyLine} /></Pressable>)
        }
        const sentenceWords = splitIntoWords(sentence);
        return (
            <Pressable
                style={styles.lineContainer}
                onPress={() => {
                    if (bubbleVisible) { onCloseBubble() }
                }}>
                <Text style={styles.line}>
                    {sentenceWords.map((word, wIndex) => {
                        const isWordSelected =
                            selectedWordPos?.sIndex === sentenceIndex && selectedWordPos?.wIndex === wIndex;
                        const isWordSaved = (w: string) => savedWords.includes(w)
                        const isSentenceSelected = selectedSentenceIndex === sentenceIndex;

                        return (
                            <Text
                                key={wIndex}
                                onPress={() => {
                                    if (bubbleVisible) { onCloseBubble(); return; }
                                    handleWordPress(sentenceIndex, wIndex, cleanWord(word));
                                }}
                                onLongPress={() => handleSentenceLongPress(sentenceIndex, sentence)}
                                style={[
                                    styles.word,
                                    isWordSelected && styles.selectedWord,
                                    isWordSaved(normalizeWord(cleanWord(word))) && styles.savedWord,
                                    isSentenceSelected && styles.selectedSentence,
                                ]}
                            >
                                {word + " "}
                            </Text>
                        );
                    })}
                </Text>
            </Pressable>
        );
    };

    return (
        <FlatList
            style={[styles.container, ready && { opacity: 1 }]}
            ref={listRef}
            data={sentences}
            renderItem={renderLine}
            keyExtractor={(_, index) => index.toString()}
            onTouchStart={() => {
                setSelectedWordPos(null);
                setSelectedSentenceIndex(null);
            }}
            // getItemLayout={(_, index) => ({
            //     length: estimatedLineHeight,
            //     offset: estimatedLineHeight * index,
            //     index,
            // })}
            onScrollToIndexFailed={(info) => {

                listRef.current?.scrollToOffset({
                    offset: info.averageItemLength * info.index,
                    animated: false,
                });
                setTimeout(() => {
                    requestAnimationFrame(() => {
                        listRef.current?.scrollToIndex({
                            index: info.index,
                            animated: true,
                        });
                    });
                }, 0);
            }}
            windowSize={5}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            removeClippedSubviews={true}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
            showsVerticalScrollIndicator={false}
            onLayout={() => setListReady(true)}
        />
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginHorizontal: 18,
        opacity: 0,
    },
    sentence: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 16, marginBottom: 4 },
    word: { fontSize: 17, lineHeight: 28, color: "#111827" },
    selectedWord: { backgroundColor: "#fde68a" },
    selectedSentence: { backgroundColor: "#fecaca" },
    savedWord: { color: "#0f766e", fontWeight: "800" },
    line: {
        fontSize: 17,
        lineHeight: 28,
        color: "#111827",
        flexDirection: "row",
        flexWrap: "wrap"
    },
    emptyLine: {
        height: 16,
    },
    lineContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        minHeight: 30,
    },
});
