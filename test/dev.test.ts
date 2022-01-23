export {};

describe('tests __DEV__ usage', () => {
  it('expects importing with __DEV__ true prints a warning', async () => {
    expect(__DEV__).toBeTruthy();

    const oldLog = console.error;
    console.error = jest.fn();

    await import('../src');

    expect(console.error).toBeCalled();

    console.error = oldLog;
  });
});
