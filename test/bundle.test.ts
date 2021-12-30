import { setupCache } from '../src/cache/create';
import { BrowserAxiosStorage } from '../src/storage/browser';
import { MemoryAxiosStorage } from '../src/storage/memory';
import { AxiosStorage } from '../src/storage/storage';

describe('test bundle imports', () => {
  it('tests browser ', async () => {
    const bundle = await import('../src/index.browser');

    expect(bundle.setupCache).toBe(setupCache);
    expect(bundle.AxiosStorage).toBe(AxiosStorage);
    expect(bundle.BrowserAxiosStorage).toBe(BrowserAxiosStorage);
    expect(bundle.MemoryAxiosStorage).toBe(MemoryAxiosStorage);
  });

  it('should have basic storages', async () => {
    const oldWarn = console.warn;
    console.warn = jest.fn();

    const bundle = await import('../src/index.development');

    expect(console.warn).toHaveBeenCalledTimes(1);

    expect(bundle.setupCache).toBe(setupCache);
    expect(bundle.AxiosStorage).toBe(AxiosStorage);
    expect(bundle.BrowserAxiosStorage).toBe(BrowserAxiosStorage);
    expect(bundle.MemoryAxiosStorage).toBe(MemoryAxiosStorage);

    console.warn = oldWarn;
  });
});
