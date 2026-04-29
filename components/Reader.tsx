import React, { useEffect, useMemo, useRef, useState } from "react";
import { LayoutChangeEvent, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
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
    isVisible: boolean;
    onVisibleLineChange?: (lineIndex: number) => void;
}

type ReaderLineProps = {
    sentence: string;
    sentenceIndex: number;
    selectedWordPos: { sIndex: number; wIndex: number } | null;
    selectedSentenceIndex: number | null;
    savedWordSet: Set<string>;
    lineFontSize: number;
    lineHeight: number;
    textColor: string;
    selectedWordColor: string;
    selectedSentenceColor: string;
    savedWordColor: string;
    accentColor: string;
    bubbleVisible: boolean;
    onCloseBubble: () => void;
    onWordPress: (sIndex: number, wIndex: number, word: string) => void;
    onSentenceLongPress: (sIndex: number, sentence: string) => void;
    onLayout: (lineIndex: number, e: LayoutChangeEvent) => void;
};

type LineMetrics = {
    y: number;
    height: number;
};

const WINDOW_BEFORE = 18;
const WINDOW_AFTER = 26;
const BOOT_WINDOW_BEFORE = 96;
const BOOT_WINDOW_AFTER = 128;

function cleanWord(word: string) {
    return word.replace(/^[\p{P}\p{S}]+|[\p{P}\p{S}]+$/gu, "");
}

function normalizeWord(word: string) {
    return word.replace(/[^a-zA-Z]/g, "").toLowerCase();
}

function estimateCharsPerLine(fontSize: number, width: number) {
    const effectiveWidth = Math.max(240, width || 0);
    const avgCharWidth = Math.max(7, fontSize * 0.55);
    return Math.max(18, Math.floor(effectiveWidth / avgCharWidth));
}

function estimateSentenceHeight(sentence: string, fontSize: number, width: number) {
    if (!sentence) return 16;

    const lineHeight = Math.round(fontSize * 1.55);
    const charsPerLine = estimateCharsPerLine(fontSize, width);
    const words = splitIntoWords(sentence);
    const roughChars = sentence.replace(/\s+/g, " ").trim().length + Math.max(0, words.length - 1);
    const wrapCount = Math.max(1, Math.ceil(roughChars / charsPerLine));
    return Math.max(30, wrapCount * lineHeight);
}

const ReaderLine = React.memo(function ReaderLine({
    sentence,
    sentenceIndex,
    selectedWordPos,
    selectedSentenceIndex,
    savedWordSet,
    lineFontSize,
    lineHeight,
    textColor,
    selectedWordColor,
    selectedSentenceColor,
    savedWordColor,
    accentColor,
    bubbleVisible,
    onCloseBubble,
    onWordPress,
    onSentenceLongPress,
    onLayout,
}: ReaderLineProps) {
    const words = useMemo(() => splitIntoWords(sentence), [sentence]);
    const isSentenceSelected = selectedSentenceIndex === sentenceIndex;

    return (
        <Pressable
            style={words.length === 0 ? styles.emptyLineContainer : styles.lineContainer}
            onLayout={(e) => onLayout(sentenceIndex, e)}
            onPress={() => {
                if (bubbleVisible) {
                    onCloseBubble();
                }
            }}
        >
            {words.length === 0 ? (
                <Text style={styles.emptyLine} />
            ) : (
                <Text style={[styles.line, { fontSize: lineFontSize, lineHeight, color: textColor }]}>
                    {words.map((word, wIndex) => {
                        const isWordSelected =
                            selectedWordPos?.sIndex === sentenceIndex && selectedWordPos?.wIndex === wIndex;
                        const normalizedWord = normalizeWord(cleanWord(word));
                        const isWordSaved = savedWordSet.has(normalizedWord);

                        return (
                            <Text
                                key={wIndex}
                                onPress={() => {
                                    if (bubbleVisible) {
                                        onCloseBubble();
                                        return;
                                    }
                                    onWordPress(sentenceIndex, wIndex, cleanWord(word));
                                }}
                                onLongPress={() => onSentenceLongPress(sentenceIndex, sentence)}
                                style={[
                                    styles.word,
                                    { fontSize: lineFontSize, lineHeight, color: textColor },
                                    isWordSelected && { backgroundColor: selectedWordColor },
                                    isWordSaved && {
                                        textDecorationLine: "underline",
                                        textDecorationColor: accentColor,
                                        fontWeight: "700",
                                        color: savedWordColor,
                                    },
                                    isSentenceSelected && { backgroundColor: selectedSentenceColor },
                                ]}
                            >
                                {word + " "}
                            </Text>
                        );
                    })}
                </Text>
            )}
        </Pressable>
    );
});

export default function Reader({
    content,
    onWordPress,
    onSentenceLongPress,
    bubbleVisible,
    onCloseBubble,
    savedWords,
    initialIndex = 0,
    filePath,
    isVisible,
    onVisibleLineChange,
}: Props) {
    const { readerFontSize, readerTheme } = useReader();

    const [selectedWordPos, setSelectedWordPos] = useState<{ sIndex: number; wIndex: number } | null>(null);
    const [selectedSentenceIndex, setSelectedSentenceIndex] = useState<number | null>(null);
    const [anchorLineIndex, setAnchorLineIndex] = useState(Math.max(0, initialIndex ?? 0));
    const [containerWidth, setContainerWidth] = useState(0);
    const [metricsVersion, setMetricsVersion] = useState(0);

    const sentences = useMemo(() => {
        const cached = getCachedContent(content);
        if (cached) {
            return cached;
        }

        const result = splitIntoSentences(content);
        setCachedContent(content, result);
        return result;
    }, [content]);

    const savedWordSet = useMemo(() => new Set(savedWords.map((word) => normalizeWord(word))), [savedWords]);

    const scrollRef = useRef<ScrollView>(null);
    const [ready, setReady] = useState(false);
    const hasScrolledRef = useRef(false);
    const firstVisibleLineRef = useRef(initialIndex ?? 0);
    const restoringFontSizeRef = useRef(false);
    const lastAppliedFontSizeRef = useRef(readerFontSize);
    const pendingFontRestoreIndexRef = useRef<number | null>(null);
    const fontRestoreAppliedRef = useRef(false);
    const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lineMetricsRef = useRef<Array<LineMetrics | undefined>>([]);
    const isLayoutStableRef = useRef(true);
    const lastReportedLineRef = useRef(initialIndex ?? 0);
    const initialScrollAttemptedRef = useRef(false);
    const initialScrollAppliedRef = useRef(false);
    const containerWidthRef = useRef(0);

    const isBooting = !ready || restoringFontSizeRef.current;
    const activeBefore = isBooting ? BOOT_WINDOW_BEFORE : WINDOW_BEFORE;
    const activeAfter = isBooting ? BOOT_WINDOW_AFTER : WINDOW_AFTER;
    const windowStart = Math.max(0, anchorLineIndex - activeBefore);
    const windowEnd = Math.min(sentences.length - 1, anchorLineIndex + activeAfter);

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

    const getLineHeightEstimate = (lineIndex: number) => {
        const metrics = lineMetricsRef.current[lineIndex];
        if (metrics?.height) return metrics.height;
        return estimateSentenceHeight(sentences[lineIndex], readerFontSize, containerWidth);
    };

    const getLineTopEstimate = (lineIndex: number) => {
        let top = 0;
        for (let i = 0; i < lineIndex; i += 1) {
            top += getLineHeightEstimate(i);
        }
        return top;
    };

    const updateVisibleLine = (offsetY: number) => {
        if (restoringFontSizeRef.current) return;
        if (!isLayoutStableRef.current) return;

        const targetY = Math.max(0, offsetY + Math.max(12, readerFontSize * 0.4));
        let visibleIndex = windowStart;

        for (let i = windowStart; i <= windowEnd; i += 1) {
            const metric = lineMetricsRef.current[i];
            const y = metric?.y ?? getLineTopEstimate(i);
            if (y <= targetY) {
                visibleIndex = i;
            } else {
                break;
            }
        }

        if (visibleIndex === lastReportedLineRef.current) return;

        lastReportedLineRef.current = visibleIndex;
        firstVisibleLineRef.current = visibleIndex;
        setAnchorLineIndex(visibleIndex);
        onVisibleLineChange?.(visibleIndex);
        scheduleSaveProgress(visibleIndex);
    };

    const scrollToLine = (lineIndex: number, animated: boolean) => {
        const y = lineMetricsRef.current[lineIndex]?.y ?? getLineTopEstimate(lineIndex);

        scrollRef.current?.scrollTo({
            y: Math.max(0, y),
            animated,
        });

        return true;
    };

    const notifyVisibleLine = (lineIndex: number) => {
        firstVisibleLineRef.current = lineIndex;
        lastReportedLineRef.current = lineIndex;
        onVisibleLineChange?.(lineIndex);
    };

    const tryRestoreFontAnchor = () => {
        if (!restoringFontSizeRef.current) return;
        if (!isLayoutStableRef.current) return;
        if (fontRestoreAppliedRef.current) return;

        const targetIndex = pendingFontRestoreIndexRef.current;
        if (targetIndex == null) return;

        if (!scrollToLine(targetIndex, false)) return;

        fontRestoreAppliedRef.current = true;
        notifyVisibleLine(targetIndex);

        setTimeout(() => {
            restoringFontSizeRef.current = false;
            fontRestoreAppliedRef.current = false;
        }, 120);
    };

    useEffect(() => {
        return () => {
            clearSaveTimer();
        };
    }, []);

    useEffect(() => {
        hasScrolledRef.current = false;
        if (ready) setReady(false);
        firstVisibleLineRef.current = initialIndex ?? 0;
        lastReportedLineRef.current = initialIndex ?? 0;
        pendingFontRestoreIndexRef.current = null;
        initialScrollAttemptedRef.current = false;
        initialScrollAppliedRef.current = false;
        setAnchorLineIndex(Math.max(0, initialIndex ?? 0));
        lineMetricsRef.current = [];
        setMetricsVersion((v) => v + 1);
    }, [initialIndex]);

    useEffect(() => {
        if (!sentences.length) return;
        if (initialScrollAttemptedRef.current) return;
        if (restoringFontSizeRef.current) return;
        if (!isLayoutStableRef.current) return;

        const targetIndex = Math.max(0, initialIndex ?? 0);
        if (scrollToLine(targetIndex, false)) {
            initialScrollAttemptedRef.current = true;
            hasScrolledRef.current = true;
            setReady(true);
            notifyVisibleLine(targetIndex);
        }
    }, [initialIndex, sentences.length, windowStart, windowEnd, metricsVersion]);

    useEffect(() => {
        if (lastAppliedFontSizeRef.current === readerFontSize) return;

        lastAppliedFontSizeRef.current = readerFontSize;
        isLayoutStableRef.current = false;
        restoringFontSizeRef.current = true;
        fontRestoreAppliedRef.current = false;
        pendingFontRestoreIndexRef.current = firstVisibleLineRef.current ?? initialIndex ?? 0;
        lineMetricsRef.current = [];
        setMetricsVersion((v) => v + 1);
        clearSaveTimer();

        const timer = setTimeout(() => {
            isLayoutStableRef.current = true;
            tryRestoreFontAnchor();
        }, 120);

        return () => clearTimeout(timer);
    }, [readerFontSize, initialIndex]);

    const handleLineLayout = (lineIndex: number, e: LayoutChangeEvent) => {
        const { y, height } = e.nativeEvent.layout;
        const previous = lineMetricsRef.current[lineIndex];
        if (!previous || previous.y !== y || previous.height !== height) {
            lineMetricsRef.current[lineIndex] = { y, height };
            setMetricsVersion((v) => v + 1);
        }

        if (
            !initialScrollAppliedRef.current &&
            !restoringFontSizeRef.current &&
            isLayoutStableRef.current &&
            lineIndex === Math.max(0, initialIndex ?? 0)
        ) {
            if (scrollToLine(lineIndex, false)) {
                initialScrollAttemptedRef.current = true;
                initialScrollAppliedRef.current = true;
                hasScrolledRef.current = true;
                setReady(true);
                notifyVisibleLine(lineIndex);
            }
        }

        if (pendingFontRestoreIndexRef.current === lineIndex && isLayoutStableRef.current) {
            tryRestoreFontAnchor();
        }
    };

    const handleWordPress = useMemo(
        () => (sIndex: number, wIndex: number, word: string) => {
            setSelectedWordPos({ sIndex, wIndex });
            setSelectedSentenceIndex(null);
            onWordPress(word);
        },
        [onWordPress]
    );

    const handleSentenceLongPress = useMemo(
        () => (sIndex: number, sentence: string) => {
            setSelectedSentenceIndex(sIndex);
            setSelectedWordPos(null);
            onSentenceLongPress(sentence);
        },
        [onSentenceLongPress]
    );

    const topSpacerHeight = useMemo(() => {
        let total = 0;
        for (let i = 0; i < windowStart; i += 1) {
            total += getLineHeightEstimate(i);
        }
        return total;
    }, [windowStart, metricsVersion, readerFontSize, containerWidth, sentences.length]);

    const bottomSpacerHeight = useMemo(() => {
        let total = 0;
        for (let i = windowEnd + 1; i < sentences.length; i += 1) {
            total += getLineHeightEstimate(i);
        }
        return total;
    }, [windowEnd, metricsVersion, readerFontSize, containerWidth, sentences.length]);

    const renderedSentences = useMemo(
        () => sentences.slice(windowStart, windowEnd + 1),
        [sentences, windowStart, windowEnd]
    );

    return (
        <ScrollView
            style={[styles.container, isVisible ? styles.visible : styles.hidden]}
            contentContainerStyle={styles.contentContainer}
            ref={scrollRef}
            onLayout={(e) => {
                const nextWidth = e.nativeEvent.layout.width;
                if (containerWidthRef.current !== nextWidth) {
                    containerWidthRef.current = nextWidth;
                    setContainerWidth(nextWidth);
                    lineMetricsRef.current = [];
                    setMetricsVersion((v) => v + 1);
                }
                isLayoutStableRef.current = true;
            }}
            onTouchStart={() => {
                setSelectedWordPos(null);
                setSelectedSentenceIndex(null);
            }}
            onScroll={({ nativeEvent }) => {
                updateVisibleLine(nativeEvent.contentOffset.y);
            }}
            scrollEventThrottle={100}
            showsVerticalScrollIndicator={false}
        >
            <View style={{ height: topSpacerHeight }} />
            {renderedSentences.map((sentence, offsetIndex) => {
                const sentenceIndex = windowStart + offsetIndex;
                return (
                    <ReaderLine
                        key={sentenceIndex}
                        sentence={sentence}
                        sentenceIndex={sentenceIndex}
                        selectedWordPos={selectedWordPos}
                        selectedSentenceIndex={selectedSentenceIndex}
                        savedWordSet={savedWordSet}
                        lineFontSize={readerFontSize}
                        lineHeight={Math.round(readerFontSize * 1.55)}
                        textColor={readerTheme.text}
                        selectedWordColor={readerTheme.selectedWord}
                        selectedSentenceColor={readerTheme.selectedSentence}
                        savedWordColor={readerTheme.savedWord}
                        accentColor={readerTheme.accent}
                        bubbleVisible={bubbleVisible}
                        onCloseBubble={onCloseBubble}
                        onWordPress={handleWordPress}
                        onSentenceLongPress={handleSentenceLongPress}
                        onLayout={handleLineLayout}
                    />
                );
            })}
            <View style={{ height: bottomSpacerHeight }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    visible: {
        opacity: 1,
    },
    hidden: {
        opacity: 0,
    },
    contentContainer: {
        paddingHorizontal: 18,
        paddingBottom: 24,
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
    emptyLineContainer: {},
    lineContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        minHeight: 30,
    },
});
