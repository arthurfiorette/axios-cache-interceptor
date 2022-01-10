import { Axios } from 'axios';
import type { AxiosStorage } from '../../src';
import { isStorage } from '../../src/storage/build';
import { buildMemoryStorage } from '../../src/storage/memory';
import { mockAxios } from '../mocks/axios';

it('tests isStorage function', () => {
  expect(isStorage(void 0)).toBe(false);
  expect(isStorage(1)).toBe(false);
  expect(isStorage('a')).toBe(false);
  expect(isStorage({})).toBe(false);
  expect(isStorage(Axios)).toBe(false);
  expect(isStorage(() => 0)).toBe(false);
  expect(isStorage(null)).toBe(false);
  expect(isStorage(undefined)).toBe(false);
  expect(isStorage({ a: 1, b: 'a' })).toBe(false);

  expect(isStorage(buildMemoryStorage())).toBe(true);
});

it('tests setupCache without proper storage', () => {
  expect(() =>
    mockAxios({
      storage: {} as AxiosStorage
    })
  ).toThrowError();
});
