import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type ReaderState = {
  visible: boolean;
  filePath: string | null;
  title?: string;
};

export type ReaderThemeId = "day" | "sepia" | "night" | "forest";

export type ReaderTheme = {
  id: ReaderThemeId;
  name: string;
  description: string;
  background: string;
  card: string;
  text: string;
  muted: string;
  border: string;
  accent: string;
  selectedWord: string;
  selectedSentence: string;
  savedWord: string;
};

export const readerThemes: ReaderTheme[] = [
  {
    id: "day",
    name: "Day",
    description: "Bright and clean",
    background: "#f7f4ee",
    card: "#fffdf8",
    text: "#111827",
    muted: "#6b7280",
    border: "#e7e0d6",
    accent: "#0a6cff",
    selectedWord: "#fde68a",
    selectedSentence: "#fecaca",
    savedWord: "#0a9f3f",
  },
  {
    id: "sepia",
    name: "Sepia",
    description: "Warm paper tone",
    background: "#efe4cf",
    card: "#fbf4e8",
    text: "#3f2d20",
    muted: "#7c6650",
    border: "#ddc9ad",
    accent: "#a45d00",
    selectedWord: "#f9d976",
    selectedSentence: "#f8c7c7",
    savedWord: "#11865f",
  },
  {
    id: "night",
    name: "Night",
    description: "Dark reading mode",
    background: "#101722",
    card: "#182230",
    text: "#e5edf7",
    muted: "#93a4b5",
    border: "#2a3442",
    accent: "#7ab7ff",
    selectedWord: "#4e4a1d",
    selectedSentence: "#5c2630",
    savedWord: "#7ef0a7",
  },
  {
    id: "forest",
    name: "Forest",
    description: "Quiet and balanced",
    background: "#e6efe8",
    card: "#f6faf7",
    text: "#173026",
    muted: "#60786f",
    border: "#cbd9cf",
    accent: "#2d7a4f",
    selectedWord: "#c9e6c3",
    selectedSentence: "#f5d7bf",
    savedWord: "#1f7d49",
  },
];

const getThemeById = (themeId: ReaderThemeId) =>
  readerThemes.find((theme) => theme.id === themeId) ?? readerThemes[0];

const STORAGE_KEY = "reader-settings-v1";
const DEFAULT_FONT_SIZE = 18;
const DEFAULT_THEME_ID: ReaderThemeId = "day";

type ReaderSettings = {
  fontSize: number;
  themeId: ReaderThemeId;
};

type ReaderContextType = {
  reader: ReaderState;
  openReader: (filePath: string, title?: string) => void;
  closeReader: () => void;
  readerFontSize: number;
  readerTheme: ReaderTheme;
  setReaderFontSize: (fontSize: number) => void;
  setReaderTheme: (themeId: ReaderThemeId) => void;
};

const ReaderContext = createContext<ReaderContextType | null>(null);

export const useReader = () => {
  const ctx = useContext(ReaderContext);
  if (!ctx) throw new Error("useReader must be used inside ReaderProvider");
  return ctx;
};

export const ReaderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [reader, setReader] = useState<ReaderState>({
    visible: false,
    filePath: null,
  });
  const [readerFontSize, setReaderFontSizeState] = useState(DEFAULT_FONT_SIZE);
  const [readerThemeId, setReaderThemeId] = useState<ReaderThemeId>(DEFAULT_THEME_ID);
  const [settingsReady, setSettingsReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (!raw) return;

        const parsed = JSON.parse(raw) as Partial<ReaderSettings>;
        if (typeof parsed.fontSize === "number") {
          setReaderFontSizeState(parsed.fontSize);
        }
        if (parsed.themeId && readerThemes.some((theme) => theme.id === parsed.themeId)) {
          setReaderThemeId(parsed.themeId);
        }
      } catch (err) {
        console.warn("Failed to load reader settings", err);
      } finally {
        setSettingsReady(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!settingsReady) return;

    (async () => {
      try {
        await AsyncStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ fontSize: readerFontSize, themeId: readerThemeId })
        );
      } catch (err) {
        console.warn("Failed to save reader settings", err);
      }
    })();
  }, [readerFontSize, readerThemeId, settingsReady]);

  const setReaderFontSize = (fontSize: number) => {
    const nextFontSize = Math.max(14, Math.min(28, Math.round(fontSize)));
    setReaderFontSizeState(nextFontSize);
  };

  const setReaderTheme = (themeId: ReaderThemeId) => {
    setReaderThemeId(themeId);
  };

  const openReader = (filePath: string, title?: string) => {
    setReader({
      visible: true,
      filePath,
      title,
    });
  };

  const closeReader = () => {
    setReader((prev) => ({
      ...prev,
      visible: false,
    }));
  };

  const readerTheme = useMemo(() => getThemeById(readerThemeId), [readerThemeId]);

  return (
    <ReaderContext.Provider
      value={{
        reader,
        openReader,
        closeReader,
        readerFontSize,
        readerTheme,
        setReaderFontSize,
        setReaderTheme,
      }}
    >
      {children}
    </ReaderContext.Provider>
  );
};
