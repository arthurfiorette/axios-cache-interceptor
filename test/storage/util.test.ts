import { isCacheValid } from '../../src/storage/util';

describe('tests common storages', () => {
  it('tests isCacheValid with empty state', () => {
    const invalid = isCacheValid({ state: 'empty' });

    expect(invalid).toBe('unknown');
  });

  it('tests isCacheValid with loading state', () => {
    const invalid = isCacheValid({ state: 'loading' });

    expect(invalid).toBe('unknown');
  });

  it('tests isCacheValid with overdue cached state', () => {
    const isValid = isCacheValid({
      state: 'cached',
      data: {} as any, // doesn't matter
      createdAt: Date.now() - 2000, // 2 seconds in the past
      ttl: 1000 // 1 second
    });

    expect(isValid).toBe(false);
  });

  it('tests isCacheValid with overdue cached state', () => {
    const isValid = isCacheValid({
      state: 'cached',
      data: {} as any, // doesn't matter
      createdAt: Date.now(),
      ttl: 1000 // 1 second
    });

    expect(isValid).toBe(true);
  });
});
