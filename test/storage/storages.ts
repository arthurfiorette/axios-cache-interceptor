import type { CacheStorage } from '../../src/storage/types';

export function testStorage(name: string, Storage: () => CacheStorage): void {
  it(`tests ${name} storage methods`, async () => {
    const storage = Storage();

    const result = await storage.get('key');

    expect(result).not.toBeNull();
    expect(result.state).toBe('empty');

    await storage.set('key', {
      state: 'cached',
      createdAt: Date.now(),
      ttl: 1000 * 60 * 5,
      data: { body: 'data', headers: {} }
    });

    const result2 = await storage.get('key');

    expect(result2).not.toBeNull();
    expect(result2.state).toBe('cached');
    expect(result2.data?.body).toBe('data');

    await storage.remove('key');

    const result3 = await storage.get('key');

    expect(result3).not.toBeNull();
    expect(result3.state).toBe('empty');
  });

  it(`tests ${name} storage staling`, async () => {
    jest.useFakeTimers('modern');
    const storage = Storage();

    await storage.set('key', {
      state: 'cached',
      createdAt: Date.now(),
      ttl: 1000 * 60 * 5, // 5 Minutes
      data: { body: 'data', headers: {} }
    });

    const result = await storage.get('key');

    expect(result).not.toBeNull();
    expect(result.state).toBe('cached');
    expect(result.data?.body).toBe('data');

    // Advance 6 minutes in time
    jest.setSystemTime(Date.now() + 1000 * 60 * 6);

    const result2 = await storage.get('key');

    expect(result2).not.toBeNull();
    expect(result2.state).toBe('empty');

    jest.useRealTimers();
  });
}
