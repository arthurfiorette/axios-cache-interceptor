import assert from 'node:assert';
import { afterEach, describe, it } from 'node:test';
import type { CachedStorageValue } from '../../src/storage/types';
import { EMPTY_RESPONSE } from '../utils';
import { testStorage } from './storages';
import buildIndexedDbStorage from '../../src/storage/indexeddb';
import "fake-indexeddb/auto";

const INDEXED_DB_TEST_NAME = 'axios-cache-test-indexeddb';

function getTestIndexedDb() {
  let db: IDBDatabase | undefined = undefined;
  const request = indexedDB.open(INDEXED_DB_TEST_NAME, 1);

  request.onerror = (error) => {
    throw new Error(`Error opening IndexedDB database ${error}`);
  };

  request.onsuccess = () => {
    db = request.result;
  };
  return buildIndexedDbStorage(db as unknown as IDBDatabase);
}

describe('IndexedDBStorage', () => {
  afterEach(() => {
    indexedDB.deleteDatabase(INDEXED_DB_TEST_NAME);
  });
  
  it('should not allow changes by value reference', async () => {
    const storage = await getTestIndexedDb();

    await storage.set('key', {
      state: 'cached',
      createdAt: Date.now(),
      ttl: 1000 * 60 * 5, // 5 Minutes
      data: { ...EMPTY_RESPONSE, data: 'data' }
    });

    const result = (await storage.get('key')) as CachedStorageValue;

    assert.notEqual(result, null);
    assert.equal(result.state, 'cached');
    assert.equal(result.data.data, 'data');

    // Deletes the value
    delete result.data.data;

    // Check if the value has been modified
    const result2 = await storage.get('key');

    assert.notEqual(result2, null);
    assert.equal(result2.state, 'cached');
    assert.equal(result2.data?.data, 'data');
  });

  // Fügen Sie hier den TestStorage-Test hinzu
  it('should pass the testStorage test', async () => {
    const storage = await getTestIndexedDb();
    await testStorage('IndexedDBStorage', storage);
  });
});
