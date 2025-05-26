<p align="center">
   <b>Using this package?</b> Please consider <a href="https://github.com/sponsors/arthurfiorette" target="_blank">donating</a> to support my open source work ❤️
  <br />
  <sup>
   Help axios-cache-interceptor grow! Star and share this amazing repository with your friends and co-workers!
  </sup>
</p>

<br />

<p align="center" title="Axios Cache Interceptor's logo">
  <a href="https://axios-cache-interceptor.js.org" target="_blank" rel="noopener noreferrer">
    <img src="docs/src/public/rocket.svg" width="180" alt="Axios Cache Interceptor logo" />
  </a>
</p>

<br />

<p align="center">
  <a title="MIT license" target="_blank" href="https://github.com/arthurfiorette/axios-cache-interceptor/blob/main/LICENSE"><img alt="License" src="https://img.shields.io/github/license/arthurfiorette/axios-cache-interceptor?color=bfb434"></a>
  <a title="Codecov" target="_blank" href="https://app.codecov.io/gh/arthurfiorette/axios-cache-interceptor"><img alt="Codecov" src="https://img.shields.io/codecov/c/github/arthurfiorette/axios-cache-interceptor?token=ML0KGCU0VM&color=d2a72d"></a>
  <a title="NPM Package" target="_blank" href="https://www.npmjs.com/package/axios-cache-interceptor"><img alt="Downloads" src="https://img.shields.io/npm/dw/axios-cache-interceptor?style=flat&color=de8f2e"></a>
  <a title="Bundle size" target="_blank" href="https://bundlephobia.com/package/axios-cache-interceptor"><img alt="Bundlephobia" src="https://img.shields.io/bundlephobia/minzip/axios-cache-interceptor/latest?style=flat&color=e87430"></a>
  <a title="Last Commit" target="_blank" href="https://github.com/arthurfiorette/axios-cache-interceptor/commits/main"><img alt="Last commit" src="https://img.shields.io/github/last-commit/arthurfiorette/axios-cache-interceptor?color=f15633"></a>
  <a title="Blazingly fast" target="_blank" href="https://twitter.com/acdlite/status/974390255393505280"><img src="https://img.shields.io/badge/blazingly-fast-fa3737"/></a>
  
</p>

<br />
<br />

# Axios Cache Interceptor

> Cache interceptor for axios made with developers and performance in mind.

<br />

- ⚡ Faster!
- 📦 Handy builds!
- 🔩 Hassle free!
- 🛠️ Rich Features!
- 🌐 No network waste!
- 🔑 TypeScript!

Axios Cache Interceptor is, as it name says, a interceptor for axios to handle caching. It
was created to help developers call axios multiple times without having to worry about
overloading the network or coding himself a simple and buggy cache system.

<br />

- [Read the docs to **Learn More**.](https://axios-cache-interceptor.js.org)
- [Ask **ChatGPT** to help you with it.](https://chatgpt.com/?model=gpt-4&hints=search&prompt=You+are+a+JavaScript+expert+assistant.+Read+the+entire+content+from+the+following+URL%3A%0A%0Ahttps%3A%2F%2Faxios-cache-interceptor.js.org%2Fllms-full.txt%0AYou+are+free+to+follow+any+links+in+the+document+to+gather+more+information%2C+if+necessary.%0A%0AThe+document+is+a+comprehensive+guide+to+the+%60axios-cache-interceptor%60+library%2C+which+is+used+for+caching+HTTP+requests+in+Axios.%0A%0A**Your+task+is+to%3A**%0A%0A1.+Understand+the+purpose+and+functionality+of+the+library.%0A2.+Learn+the+key+concepts%2C+configuration+options%2C+and+API+methods+described.%0A3.+Retain+information+about+advanced+features%2C+usage+examples%2C+and+edge+cases.%0A4.+Be+ready+to+answer+technical+questions+or+explain+how+to+use+the+library%2C+troubleshoot+common+issues%2C+and+compare+it+with+other+caching+approaches+in+Axios.%0A%0ADo+not+summarize+yet.+Just+read+and+prepare+to+answer+detailed+questions.)

<br />
<br />

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

<br />

## License

Licensed under the **MIT**. See [`LICENSE`](LICENSE) for more informations.

[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Farthurfiorette%2Faxios-cache-interceptor.svg?type=small)](https://app.fossa.com/projects/git%2Bgithub.com%2Farthurfiorette%2Faxios-cache-interceptor?ref=badge_small)

<br />

## Star History

<a href="https://star-history.com/#arthurfiorette/axios-cache-interceptor&Date">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=arthurfiorette/axios-cache-interceptor&type=Date&theme=dark" />
    <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=arthurfiorette/axios-cache-interceptor&type=Date" />
    <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=arthurfiorette/axios-cache-interceptor&type=Date" />
  </picture>
</a>

<br />
<br />

## All Thanks To Our Contributors:

<a href="https://github.com/arthurfiorette/axios-cache-interceptor/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=arthurfiorette/axios-cache-interceptor" />
</a>

<br />
