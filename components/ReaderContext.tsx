import React, { createContext, useContext, useState } from "react";

type ReaderState = {
    visible: boolean;
    filePath: string | null;
    title?: string;
};

type ReaderContextType = {
    reader: ReaderState;
    openReader: (filePath: string, title?: string) => void;
    closeReader: () => void;
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

    return (
        <ReaderContext.Provider value={{ reader, openReader, closeReader }}>
            {children}
        </ReaderContext.Provider>
    );
};