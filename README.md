[![Issues](https://img.shields.io/github/issues/arthurfiorette/axios-cache-interceptor?logo=github&label=Issues)](https://github.com/arthurfiorette/axios-cache-interceptor/issues)
[![Stars](https://img.shields.io/github/stars/arthurfiorette/axios-cache-interceptor?logo=github&label=Stars)](https://github.com/arthurfiorette/axios-cache-interceptor/stargazers)
[![License](https://img.shields.io/github/license/arthurfiorette/axios-cache-interceptor?logo=githu&label=License)](https://github.com/arthurfiorette/axios-cache-interceptor/blob/main/LICENSE)
[![Try on Runkit](https://img.shields.io/badge/try%20on-RunKit-brightgreen?logo=runkit&logoColor=e83e8c)](https://npm.runkit.com/axios-cache-interceptor)
[![Codecov](https://codecov.io/gh/arthurfiorette/axios-cache-interceptor/branch/main/graph/badge.svg?token=ML0KGCU0VM)](https://codecov.io/gh/arthurfiorette/axios-cache-interceptor)
[![Downloads](https://img.shields.io/npm/dw/axios-cache-interceptor?style=flat)](https://www.npmjs.com/package/axios-cache-interceptor)
[![Bundlephobia](https://img.shields.io/bundlephobia/minzip/axios-cache-interceptor/latest?style=flat)](https://bundlephobia.com/package/axios-cache-interceptor@latest)
[![Packagephobia](https://packagephobia.com/badge?p=axios-cache-interceptor@latest)](https://packagephobia.com/result?p=axios-cache-interceptor@latest)
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Farthurfiorette%2Faxios-cache-interceptor.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2Farthurfiorette%2Faxios-cache-interceptor?ref=badge_shield)
[![Join the chat at https://gitter.im/axios-cache-interceptor/community](https://badges.gitter.im/axios-cache-interceptor/community.svg)](https://gitter.im/axios-cache-interceptor/community?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

<br />

<div align="center">
  <pre>
  <h1>⚡
Axios Cache Interceptor</h1>
  </pre>
  <br />
</div>

<h3 align="center">
  <code>Axios Cache Interceptor</code> is a small and efficient cache interceptor for axios.
  <br />
  <br />
</h3>

<br />

```ts
import Axios from 'axios';
import { setupCache } from 'axios-cache-interceptor';

// same object, but with updated typings.
const axios = setupCache(Axios);

const req1 = axios.get('https://api.example.com/');
const req2 = axios.get('https://api.example.com/');

const [res1, res2] = await Promise.all([req1, req2]);

res1.cached; // false
res2.cached; // true
```

<br />

<h3 align=center>
  <a href="https://axios-cache-interceptor.js.org/" target="_blank">Documentation at <code>axios-cache-interceptor.js.org</code> 🎉🎉</a>
</h3>

<br />

## License

Licensed under the **MIT**. See [`LICENSE`](LICENSE) for more informations.

[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Farthurfiorette%2Faxios-cache-interceptor.svg?type=small)](https://app.fossa.com/projects/git%2Bgithub.com%2Farthurfiorette%2Faxios-cache-interceptor?ref=badge_small)

<br />

## Contact

See my contact information on my [github profile](https://github.com/arthurfiorette) or
open a new issue.

<br />
