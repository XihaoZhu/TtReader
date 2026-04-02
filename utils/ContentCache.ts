const contentCache = new Map<string, string[]>();

export const getCachedContent = (key: string) => contentCache.get(key);
export const setCachedContent = (key: string, value: string[]) =>
    contentCache.set(key, value);