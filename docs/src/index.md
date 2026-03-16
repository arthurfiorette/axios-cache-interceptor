---
layout: home

hero:
  name: Axios Cache Interceptor
  text: Performant, small and powerful
  tagline: A cache interceptor for axios made with developers and performance in mind.
  image:
    src: /rocket.svg
    alt: Rocket
    title: Axios Cache Interceptor's logo

  actions:
    - theme: brand
      text: Quick Start
      link: /journey/installation

    - theme: alt
      text: See Examples
      link: /examples/

    - theme: alt
      text: API Reference
      link: /api/

features:
  - title: 21x Faster
    details: Serving 21x more requests per second than vanilla Axios with cache hits.

  - title: Automatic Request Deduplication
    details: Concurrent identical requests share a single network call, preventing redundant server load.

  - title: HTTP Standards Compliant
    details: Respects Cache-Control, ETag, Vary, and other RFC 7234 headers for proper caching behavior.

  - title: Smart Storage States
    details: Sophisticated state machine manages cached, stale, and loading data with efficient transitions.

  - title: Multiple Storage Backends
    details: Memory (default), localStorage, sessionStorage, or custom adapters for Redis, IndexedDB, and more.

  - title: TypeScript Native
    details: Fully typed with excellent IDE support and type-safe configuration options.

  - title: Stale While Revalidate
    details: Serve stale cache immediately while fetching fresh data in the background for better UX.

  - title: Minimal Bundle Size
    details: Only 4.4KB gzipped with zero dependencies beyond Axios itself.

  - title: Framework Agnostic
    details: Works with React, Vue, Angular, or any framework that uses Axios for HTTP requests.
---

<script setup>
import { VPTeamPageTitle } from 'vitepress/theme'
</script>

<VPTeamPageTitle>
  <template #title>
    Our Team
  </template>
  <template #lead>
    Composed of a diverse group of people from all over the world through our open source community.
  </template>
</VPTeamPageTitle>
<div class="contributors">
  <a href="https://github.com/arthurfiorette/axios-cache-interceptor/graphs/contributors">
    <img src="https://contrib.rocks/image?repo=arthurfiorette/axios-cache-interceptor" />
  </a>
</div>
