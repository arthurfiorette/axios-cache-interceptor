export {};

describe('tests __ACI_DEV__ usage', () => {
  it('expects importing with __ACI_DEV__ true prints a warning', async () => {
    expect(__ACI_DEV__).toBeTruthy();

    const oldLog = console.error;
    console.error = jest.fn();

    await import('../src');

    expect(console.error).toBeCalled();

    console.error = oldLog;
  });
});
