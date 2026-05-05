import { importDatabaseFromAssetAsync, openDatabaseAsync, type SQLiteDatabase } from "expo-sqlite";

const DICT_DATABASE_NAME = "dict.db";
const dictAsset = require("../assets/dict.db");

let databasePromise: Promise<SQLiteDatabase> | null = null;

export async function getLocalDictDatabase(): Promise<SQLiteDatabase> {
    if (!databasePromise) {
        databasePromise = (async () => {
            await importDatabaseFromAssetAsync(DICT_DATABASE_NAME, {
                assetId: dictAsset,
                forceOverwrite: true,
            });
            return openDatabaseAsync(DICT_DATABASE_NAME);
        })();
    }

    return databasePromise;
}