## Getting started

To you use this cache interceptor, you can apply to an existing instance or create a new
one.

```js
import { setupCache } from 'axios-cache-interceptor';

// Your axios instance (Can also be the global one)
let axios;

// Return the same axios instance, but with a modified Typescript type.
axios = setupCache(axios, {
  /* options here */
});
```

After that, you can made your own requests normally, as this library respects axios API.

Afterwards, the only thing you may need to configure is per-request configuration, you can
change them with the `cache` property.

```js
import { setupCache } from 'axios-cache-interceptor';

// Your axios-cache-interceptor instance
let axios;

axios.get('url', {
  cache: {
    /** Options here */
  }
});
```

You will get syntax highlighting for all options and what they do. But you can also read
here: [Per-request configuration](#per-request-configuration).

## Default axios instance

Sometimes, by using other libraries, frameworks and etc, you may want or need to use the
global axios instance, (the one exported by default). That's no big deal, as the
`setupCache` function returns the same axios instance, you can just do that:

**_Attention! Using the global axios can break any other code that also uses the default
axios instance._**

```js
// index.js
import axios from 'axios';
import { setupCache } from 'axios-cache-interceptor';

setupCache(axios, {
  /* options here */
});
```

```js
// my-other-file.js
import axios from 'axios';

// caching is enabled!
axios.get('url');
```

But, you'll see that the typescript intellisense won't work, as the global axios instance
has the defaults axios typings. To fix that, you'll have to override the global axios
typings or force the type for every parameter:

```ts
import Axios from 'axios';
import { AxiosCacheInstance } from 'axios-cache-interceptor';

const axios = Axios as AxiosCacheInstance;

axios.defaults.cache; // works!
```