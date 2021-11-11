import { AxiosStorage } from '../../src/storage/storage';

describe('tests common storages', () => {
  it('tests isCacheValid with empty state', () => {
    const invalid = AxiosStorage.isValid({ state: 'empty' });

    expect(invalid).toBe(true);
  });

  it('tests isCacheValid with loading state', () => {
    const invalid = AxiosStorage.isValid({ state: 'loading' });

    expect(invalid).toBe(true);
  });

  it('tests isCacheValid with overdue cached state', () => {
    const isValid = AxiosStorage.isValid({
      state: 'cached',
      data: {} as any, // doesn't matter
      createdAt: Date.now() - 2000, // 2 seconds in the past
      ttl: 1000 // 1 second
    });

    expect(isValid).toBe(false);
  });

  it('tests isCacheValid with cached state', () => {
    const isValid = AxiosStorage.isValid({
      state: 'cached',
      data: {} as any, // doesn't matter
      createdAt: Date.now(),
      ttl: 1000 // 1 second
    });

    expect(isValid).toBe(true);
  });
});
