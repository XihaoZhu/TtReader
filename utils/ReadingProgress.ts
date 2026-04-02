import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = "READING_PROGRESS";

type Progress = {
  filePath: string;
  lineIndex: number;
};

export const saveProgress = async (filePath: string, lineIndex: number) => {
  const raw = await AsyncStorage.getItem(KEY);
  const list: Progress[] = raw ? JSON.parse(raw) : [];

  const filtered = list.filter(p => p.filePath !== filePath);
  filtered.push({ filePath, lineIndex });

  await AsyncStorage.setItem(KEY, JSON.stringify(filtered));
};

export const getProgress = async (filePath: string) => {
  const raw = await AsyncStorage.getItem(KEY);
  const list: Progress[] = raw ? JSON.parse(raw) : [];

  return list.find(p => p.filePath === filePath);
};