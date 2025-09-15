# Axios Cache Interceptor - Project Overview

## Purpose

Axios Cache Interceptor is a cache interceptor for axios designed with developers and performance in mind. It allows developers to call axios multiple times without worrying about overloading the network or implementing a simple and buggy cache system themselves.

## Key Features

- ⚡ Performance optimized
- 📦 Multiple build targets (ESM, CJS, UMD)
- 🔩 Easy to use - just wrap your axios instance
- 🛠️ Rich caching features (ETags, Last-Modified, Cache-Control, etc.)
- 🌐 Reduces network waste through intelligent caching
- 🔑 Full TypeScript support

## Tech Stack

- **Language**: TypeScript
- **Package Manager**: pnpm (v9.1.1)
- **Node Version**: >=12 (configured in .nvmrc)
- **Build Tool**: microbundle (for multiple output formats)
- **Code Quality**: Biome (linting, formatting, type checking)
- **Testing**: Node.js built-in test runner with c8 for coverage
- **Documentation**: VitePress

## Basic Usage

```ts
import Axios from 'axios';
import { setupCache } from 'axios-cache-interceptor';

const instance = Axios.create();
const axios = setupCache(instance);

const req1 = axios.get('https://arthur.place/');
const req2 = axios.get('https://arthur.place/');

const [res1, res2] = await Promise.all([req1, req2]);

res1.cached; // false
res2.cached; // true
```
