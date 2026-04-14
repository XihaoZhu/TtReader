import React, { useEffect, useMemo, useRef, useState } from "react";
import { Text, StyleSheet, FlatList, Pressable, ViewToken, LayoutChangeEvent } from "react-native";
import { splitIntoWords } from "../utils/WordSplitter";
import { splitIntoSentences } from "../utils/SentenceSplitter";
import { getCachedContent, setCachedContent } from "../utils/ContentCache";
import { saveProgress } from "../utils/ReadingProgress";
import { useReader } from "./ReaderContext";

interface Props {
    content: string;
    onWordPress: (word: string) => void;
    onSentenceLongPress: (sentence: string) => void;
    bubbleVisible: boolean;
    onCloseBubble: () => void;
    savedWords: string[];
    initialIndex?: number;
    filePath: string;
    onVisibleLineChange?: (lineIndex: number) => void;
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
    onVisibleLineChange,
}: Props) {
    const { readerFontSize, readerTheme } = useReader();

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

    const sentences = useMemo(() => {
        if (getCachedContent(content)) {
            return getCachedContent(content)!;
        }

        const result = splitIntoSentences(content);
        setCachedContent(content, result);

        return result;
    }, [content]);

    const listRef = useRef<FlatList>(null);
    const [ready, setReady] = useState(false);
    const [listReady, setListReady] = useState(false);
    const hasScrolledRef = useRef(false);
    const firstVisibleLineRef = useRef(initialIndex ?? 0);
    const restoringFontSizeRef = useRef(false);
    const lastAppliedFontSizeRef = useRef(readerFontSize);
    const pendingFontRestoreIndexRef = useRef<number | null>(null);
    const fontRestoreAppliedRef = useRef(false);
    const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lineOffsetsRef = useRef(new Map<number, number>());

    const clearSaveTimer = () => {
        if (saveTimerRef.current) {
            clearTimeout(saveTimerRef.current);
            saveTimerRef.current = null;
        }
    };

    const scheduleSaveProgress = (lineIndex: number) => {
        clearSaveTimer();
        saveTimerRef.current = setTimeout(() => {
            saveProgress(filePath, lineIndex);
        }, 250);
    };

    const tryRestoreFontAnchor = () => {
        if (!restoringFontSizeRef.current) return;
        if (fontRestoreAppliedRef.current) return;

        const targetIndex = pendingFontRestoreIndexRef.current;
        if (targetIndex == null) return;

        fontRestoreAppliedRef.current = true;
        requestAnimationFrame(() => {
            listRef.current?.scrollToIndex({
                index: targetIndex,
                animated: false,
                viewPosition: 0,
            });

            requestAnimationFrame(() => {
                fontRestoreAppliedRef.current = false;
            });
        });
    };

    useEffect(() => {
        return () => {
            clearSaveTimer();
        };
    }, []);

    useEffect(() => {
        if (!hasScrolledRef.current && listReady && initialIndex != null) {
            hasScrolledRef.current = true;

            setTimeout(() => {
                listRef.current?.scrollToIndex({
                    index: initialIndex,
                    animated: true,
                });
                setReady(true);
            }, 0);
        }
    }, [listReady, initialIndex]);

    useEffect(() => {
        if (lastAppliedFontSizeRef.current === readerFontSize) {
            return;
        }

        lastAppliedFontSizeRef.current = readerFontSize;

        if (!listReady) {
            return;
        }

        pendingFontRestoreIndexRef.current = firstVisibleLineRef.current ?? initialIndex ?? 0;
        fontRestoreAppliedRef.current = false;
        restoringFontSizeRef.current = true;
        clearSaveTimer();

        const timer = setTimeout(() => {
            tryRestoreFontAnchor();
        }, 0);

        return () => clearTimeout(timer);
    }, [readerFontSize, listReady, initialIndex]);

    const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[]; changed: ViewToken[] }) => {
        if (viewableItems.length > 0) {
            const firstVisible = viewableItems[0];
            const firstIndex = firstVisible.index ?? 0;
            firstVisibleLineRef.current = firstIndex;

            if (!restoringFontSizeRef.current) {
                onVisibleLineChange?.(firstIndex);
                scheduleSaveProgress(firstIndex);
            } else if (pendingFontRestoreIndexRef.current === firstIndex) {
                restoringFontSizeRef.current = false;
                pendingFontRestoreIndexRef.current = null;
                onVisibleLineChange?.(firstIndex);
            }
        }
    }).current;

    const handleLineLayout = (lineIndex: number, e: LayoutChangeEvent) => {
        lineOffsetsRef.current.set(lineIndex, e.nativeEvent.layout.y);
        if (pendingFontRestoreIndexRef.current === lineIndex) {
            tryRestoreFontAnchor();
        }
    };

    const renderLine = ({ item: sentence, index: sentenceIndex }: { item: string; index: number }) => {
        if (sentence === "") {
            return (
                <Pressable
                    onLayout={(e) => handleLineLayout(sentenceIndex, e)}
                    onPress={() => {
                        if (bubbleVisible) {
                            onCloseBubble();
                        }
                    }}
                >
                    <Text style={styles.emptyLine} />
                </Pressable>
            );
        }

        const sentenceWords = splitIntoWords(sentence);
        const lineFontSize = readerFontSize;
        const lineHeight = Math.round(readerFontSize * 1.55);

        return (
            <Pressable
                style={styles.lineContainer}
                onLayout={(e) => handleLineLayout(sentenceIndex, e)}
                onPress={() => {
                    if (bubbleVisible) {
                        onCloseBubble();
                    }
                }}
            >
                <Text style={[styles.line, { fontSize: lineFontSize, lineHeight, color: readerTheme.text }]}>
                    {sentenceWords.map((word, wIndex) => {
                        const isWordSelected =
                            selectedWordPos?.sIndex === sentenceIndex && selectedWordPos?.wIndex === wIndex;
                        const isWordSaved = (w: string) => savedWords.includes(w);
                        const isSentenceSelected = selectedSentenceIndex === sentenceIndex;

                        return (
                            <Text
                                key={wIndex}
                                onPress={() => {
                                    if (bubbleVisible) {
                                        onCloseBubble();
                                        return;
                                    }
                                    handleWordPress(sentenceIndex, wIndex, cleanWord(word));
                                }}
                                onLongPress={() => handleSentenceLongPress(sentenceIndex, sentence)}
                                style={[
                                    styles.word,
                                    { fontSize: lineFontSize, lineHeight, color: readerTheme.text },
                                    isWordSelected && { backgroundColor: readerTheme.selectedWord },
                                    isWordSaved(normalizeWord(cleanWord(word))) && {
                                        textDecorationLine: "underline",
                                        textDecorationColor: readerTheme.accent,
                                        fontWeight: "700",
                                        color: readerTheme.savedWord,
                                    },
                                    isSentenceSelected && { backgroundColor: readerTheme.selectedSentence },
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
            onScrollToIndexFailed={(info) => {
                if (restoringFontSizeRef.current) {
                    setTimeout(() => {
                        tryRestoreFontAnchor();
                    }, 50);
                    return;
                }

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
    word: {
        textDecorationLine: "none",
        textDecorationStyle: "solid",
        fontWeight: "500",
    },
    line: {
        flexDirection: "row",
        flexWrap: "wrap",
    },
    emptyLine: {
        height: 16,
    },
    lineContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        minHeight: 30,
    },
});
