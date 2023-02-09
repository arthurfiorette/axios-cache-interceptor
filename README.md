<p align="center">
   <b>Using this package?</b> Please consider <a href="https://github.com/sponsors/arthurfiorette" target="_blank">donating</a> to support my open source work ❤️
  <br />
  <sup>
   Help axios-cache-interceptor grow! Star and share this amazing repository with your friends and co-workers!
  </sup>
</p>

<br />

<p align="center" title="We need a designer :)">
  <a href="https://axios-cache-interceptor.js.org" target="_blank" rel="noopener noreferrer">
    <img src="docs/src/public/rocket.png" width="180" alt="Axios Cache Interceptor logo" />
  </a>
</p>

<br />

<p align="center">
  <img alt="GitHub" src="https://img.shields.io/github/license/arthurfiorette/axios-cache-interceptor">
  <img alt="Codecov" src="https://img.shields.io/codecov/c/github/arthurfiorette/axios-cache-interceptor?token=ML0KGCU0VM">
  <img alt="Downloads" src="https://img.shields.io/npm/dm/axios-cache-interceptor?style=flat">
  <img alt="Bundlephobia" src="https://img.shields.io/bundlephobia/minzip/axios-cache-interceptor/latest?style=flat">
  <img alt="FOSSA Status" src="https://app.fossa.com/api/projects/git%2Bgithub.com%2Farthurfiorette%2Faxios-cache-interceptor.svg?type=shield">
  <img alt="Last commit" src="https://img.shields.io/github/last-commit/arthurfiorette/axios-cache-interceptor">
</p>

<br />
<br />

# Axios Cache Interceptor

> Cache interceptor for axios made with developers and performance in mind.

<br />

- ⚡ Faster
- 📦 Handy builds
- 🔩 Hassle free
- 🛠️ Rich Features
- 🌐 No network waste!
- 🔑 TypeScript!

Axios Cache Interceptor is, as it name says, a interceptor for axios to handle caching. It
was created to help developers call axios multiple times without having to worry about
overloading the network or coding himself a simple and buggy cache system.

<br />

[Read the docs to **Learn More**.](https://axios-cache-interceptor.js.org)

<br />
<br />

```ts
import Axios from 'axios';
import { setupCache } from 'axios-cache-interceptor';

// Same object, new types.
const axios = setupCache(Axios);

const req1 = axios.get('https://arthur.place/');
const req2 = axios.get('https://arthur.place/');

const [res1, res2] = await Promise.all([req1, req2]);

res1.cached; // false
res2.cached; // true
```

<br />

## License

Licensed under the **MIT**. See [`LICENSE`](LICENSE) for more informations.

[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Farthurfiorette%2Faxios-cache-interceptor.svg?type=small)](https://app.fossa.com/projects/git%2Bgithub.com%2Farthurfiorette%2Faxios-cache-interceptor?ref=badge_small)

<br />
