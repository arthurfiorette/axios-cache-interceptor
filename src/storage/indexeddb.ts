/** Represents an IndexedDB storage for Axios caching. */
import { IDBPDatabase, openDB, wrap } from 'idb';
import { BuildStorage, buildStorage } from './build';
import { AxiosStorage, NotEmptyStorageValue, StorageValue } from './types';

/**
 * Creates an IndexedDB storage for Axios caching based on the provided IndexedDB database
 * and store name.
 *
 * @param db - The IndexedDB database instance.
 * @param storeName - The name of the IndexedDB object store to use.
 * @returns A BuildStorage object representing the IndexedDB storage.
 */
function getIndexedDbStorage(db: IDBPDatabase<unknown>, storeName: string): BuildStorage {
  return {
    /**
     * Finds and retrieves a value from the IndexedDB storage based on the provided key.
     *
     * @param key - The key used to retrieve the value.
     * @returns A Promise that resolves to the retrieved value or undefined if not found.
     */
    async find(key: string): Promise<StorageValue | undefined> {
      return await db.get(storeName, key).then((result: string | undefined) => {
        if (result !== undefined) {
          return JSON.parse(result) as StorageValue;
        }
        return undefined;
      });
    },

    /**
     * Sets a value in the IndexedDB storage based on the provided key and value.
     *
     * @param key - The key used to store the value.
     * @param value - The value to store in the IndexedDB storage.
     */
    async set(key: string, value: NotEmptyStorageValue) {
      await db.put(storeName, JSON.stringify(value), `axios-cache-${key}`);
    },

    /**
     * Removes a value from the IndexedDB storage based on the provided key.
     *
     * @param key - The key used to remove the value.
     * @returns A Promise that resolves when the value is successfully removed.
     */
    async remove(key: string) {
      return await db.delete(storeName, `axios-cache-${key}`);
    }
  };
}

/**
 * Creates and initializes an IndexedDB storage for Axios caching.
 *
 * @returns A Promise that resolves to an AxiosStorage object representing the IndexedDB
 *   storage.
 */
export default async function buildIndexedDbStorage(
  unwrappedDbObject: IDBDatabase | undefined = undefined
): Promise<AxiosStorage> {
  const storeName = 'axios-cache-interceptor-db';
  let db: IDBPDatabase<unknown> | undefined = undefined;
  if (unwrappedDbObject !== undefined) {
    db = wrap(unwrappedDbObject);
  } else {
    db = await openDB(storeName, 1, {
      upgrade(db) {
        db.createObjectStore(storeName);
      }
    });
  }

  return buildStorage(getIndexedDbStorage(db, storeName));
}
