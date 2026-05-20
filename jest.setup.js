// Jest setup file to define __ACI_DEV__ global variable
// This is needed for the source code that checks for __ACI_DEV__ === true for development warnings

// @ts-expect-error __ACI_DEV__ is declared as const in the source code
global.__ACI_DEV__ = true;