import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useReader, readerThemes } from "../components/ReaderContext";

const PREVIEW_TEXT =
  "The quick brown fox jumps over the lazy dog. Reading should feel calm, clear, and comfortable across every theme.";

const MIN_FONT_SIZE = 14;
const MAX_FONT_SIZE = 28;

export default function SettingsScreen() {
  const { readerFontSize, readerTheme, setReaderFontSize, setReaderTheme } = useReader();

  const decreaseFont = () => setReaderFontSize(Math.max(MIN_FONT_SIZE, readerFontSize - 1));
  const increaseFont = () => setReaderFontSize(Math.min(MAX_FONT_SIZE, readerFontSize + 1));

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: readerTheme.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: readerTheme.text }]}>Reader Font Size</Text>
        <View
          style={[
            styles.fontRow,
            { backgroundColor: readerTheme.card, borderColor: readerTheme.border },
          ]}
        >
          <TouchableOpacity
            style={[styles.fontButton, { backgroundColor: readerTheme.accent }]}
            activeOpacity={0.85}
            onPress={decreaseFont}
          >
            <Text style={styles.fontButtonText}>A-</Text>
          </TouchableOpacity>

          <View style={styles.fontCenter}>
            <Text style={[styles.fontValue, { color: readerTheme.text }]}>{readerFontSize}</Text>
            <Text style={[styles.fontHint, { color: readerTheme.muted }]}>Current size</Text>
          </View>

          <TouchableOpacity
            style={[styles.fontButton, { backgroundColor: readerTheme.accent }]}
            activeOpacity={0.85}
            onPress={increaseFont}
          >
            <Text style={styles.fontButtonText}>A+</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: readerTheme.text }]}>Color Theme</Text>
        <View style={styles.themeGrid}>
          {readerThemes.map((theme) => {
            const active = theme.id === readerTheme.id;

            return (
              <TouchableOpacity
                key={theme.id}
                activeOpacity={0.88}
                onPress={() => setReaderTheme(theme.id)}
                style={[
                  styles.themeCard,
                  { backgroundColor: theme.card, borderColor: theme.border },
                  active && styles.themeCardActive,
                ]}
              >
                <View style={styles.themeHeader}>
                  <Text style={[styles.themeName, { color: theme.text }]}>{theme.name}</Text>
                  <View style={[styles.themeDot, { backgroundColor: theme.accent }]} />
                </View>
                <Text style={[styles.themeDescription, { color: theme.muted }]}>{theme.description}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: readerTheme.text }]}>Preview</Text>
        <View
          style={[
            styles.previewCard,
            { backgroundColor: readerTheme.card, borderColor: readerTheme.border },
          ]}
        >
          <Text style={[styles.previewTitle, { color: readerTheme.text }]}>Reading Preview</Text>
          <Text
            style={[
              styles.previewText,
              {
                color: readerTheme.text,
                fontSize: readerFontSize,
                lineHeight: Math.round(readerFontSize * 1.55),
              },
            ]}
          >
            {PREVIEW_TEXT}
          </Text>
          <Text style={[styles.previewCaption, { color: readerTheme.muted }]}>
            The preview uses the same font size and palette as the reader, so you can judge the result before
            opening a book.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 28,
  },
  hero: {
    backgroundColor: "#fffdf8",
    borderRadius: 18,
    padding: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#e7e0d6",
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 3,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 15,
    lineHeight: 22,
  },
  section: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 10,
  },
  fontRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fffdf8",
    borderRadius: 18,
    padding: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#e7e0d6",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  fontButton: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: "#0a6cff",
    alignItems: "center",
    justifyContent: "center",
  },
  fontButtonText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "800",
  },
  fontCenter: {
    flex: 1,
    alignItems: "center",
  },
  fontValue: {
    fontSize: 28,
    fontWeight: "800",
    color: "#111827",
  },
  fontHint: {
    marginTop: 4,
    fontSize: 12,
    color: "#6b7280",
  },
  themeGrid: {
    gap: 10,
  },
  themeCard: {
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
  },
  themeCardActive: {
    transform: [{ scale: 1.01 }],
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  themeHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  themeName: {
    fontSize: 16,
    fontWeight: "700",
  },
  themeDescription: {
    fontSize: 13,
  },
  themeDot: {
    width: 12,
    height: 12,
    borderRadius: 999,
  },
  previewCard: {
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 3,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  previewText: {
    fontWeight: "500",
    marginBottom: 14,
  },
  previewCaption: {
    fontSize: 13,
    lineHeight: 20,
  },
});
