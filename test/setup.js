// @ts-expect-error __ACI_DEV__ is declared as const
global.__ACI_DEV__ = true;

import { register } from 'node:module';
import { pathToFileURL } from 'node:url';

register('@swc-node/register/esm', pathToFileURL('./'));
