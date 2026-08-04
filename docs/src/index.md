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
      text: Get Started
      link: /guide/getting-started

    - theme: alt
      text: Why cache?
      link: https://arthur.place/implications-of-cache-or-state

    - theme: alt
      text: View on GitHub
      link: https://github.com/arthurfiorette/axios-cache-interceptor

features:
  - icon: ⚡
    title: Simply faster
    details: Serving 21x more requests/s than axios itself.

  - icon: 📦
    title: Handy builds
    details:
      No matter what your JS setup is, we've got you covered! CDN, ECMAScript, UMD, CommonJS
      and URL imports.

  - icon: 🔩
    title: Hassle free
    details:
      Just call setupCache() and watch the magic happen! Works for everyone, no matter the
      current combination of adapters or interceptors.

  - icon: 🛠️
    title: Rich Features
    details:
      We follow strict rules defined by MDN, RFCs, and other specifications. No more
      guessing.

  - icon: 🌐
    title: No network waste!
    details:
      Network speed should not matter for your users. Make your application work offline,
      on 2G, or on ultra-fast 5G; it's up to your users.

  - icon: 🔑
    title: TypeScript!
    details: Fully configurable and flexible interceptors with fully type-safe APIs.
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
