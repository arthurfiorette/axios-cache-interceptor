---
layout: home

hero:
  name: Axios Cache Interceptor
  text: Small and fast HTTP caching for axios
  tagline: Caches responses, deduplicates concurrent requests and follows HTTP caching headers.
  image:
    src: /rocket.svg
    alt: Rocket
    title: Axios Cache Interceptor's logo

  actions:
    - theme: brand
      text: Get started
      link: /guide/getting-started

    - theme: alt
      text: Why cache?
      link: https://arthur.place/implications-of-cache-or-state

    - theme: alt
      text: View on GitHub
      link: https://github.com/arthurfiorette/axios-cache-interceptor

features:
  - icon: ⚡
    title: Request deduplication
    details:
      Concurrent requests for the same resource share a single network call, and every caller
      gets the same response.

  - icon: 📦
    title: Multiple builds
    details: CDN, ECMAScript modules, UMD, CommonJS and URL imports.

  - icon: 🔩
    title: One function call
    details:
      Call setupCache() on your axios instance. It works alongside your existing adapters and
      interceptors.

  - icon: 🛠️
    title: Standards-based
    details:
      Follows the caching rules defined in the HTTP RFCs and documented by MDN, including
      Cache-Control, ETag and Vary.

  - icon: 🌐
    title: Fewer network calls
    details:
      Repeated requests are answered from cache, so your app stays responsive on slow
      connections and can show cached data while offline.

  - icon: 🔑
    title: TypeScript
    details: Every option, storage and interceptor is fully typed.
---

<script setup>
import { VPTeamPageTitle } from 'vitepress/theme'
</script>

<VPTeamPageTitle>
  <template #title>
    Our team
  </template>
  <template #lead>
    People who contribute to Axios Cache Interceptor.
  </template>
</VPTeamPageTitle>
<div class="contributors">
  <a href="https://github.com/arthurfiorette/axios-cache-interceptor/graphs/contributors">
    <img src="https://contrib.rocks/image?repo=arthurfiorette/axios-cache-interceptor" />
  </a>
</div>
