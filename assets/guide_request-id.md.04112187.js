import{_ as s,o as a,c as n,S as o}from"./chunks/framework.c5c38cfd.js";const h=JSON.parse('{"title":"Request Id","description":"","frontmatter":{},"headers":[],"relativePath":"guide/request-id.md","filePath":"guide/request-id.md","lastUpdated":1693771464000}'),e={name:"guide/request-id.md"},p=o(`<h1 id="request-id" tabindex="-1">Request Id <a class="header-anchor" href="#request-id" aria-label="Permalink to &quot;Request Id&quot;">​</a></h1><p>We can distinguish requests from each other by assigning an <strong>non unique</strong> <code>id</code> to each request. These IDs are the same provided to the storage as keys.</p><p>Each ID is responsible for binding a cache to its request, for referencing or invalidating it later and to make the interceptor use the same cache for requests to the same endpoint and parameters.</p><p>The default id generator is smart enough to generate the same ID for theoretically same requests. <code>{ baseURL: &#39;https://a.com/&#39;, url: &#39;/b&#39; }</code> <strong>==</strong> <code>{ url: &#39;https://a.com/b/&#39; }</code>.</p><div class="vp-code-group vp-adaptive-theme"><div class="tabs"><input type="radio" name="group-TrPHj" id="tab-Pg-oebc" checked="checked"><label for="tab-Pg-oebc">Different requests</label><input type="radio" name="group-TrPHj" id="tab-fQa716G"><label for="tab-fQa716G">Different contexts</label></div><div class="blocks"><div class="language-ts vp-adaptive-theme active"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki github-dark has-focused-lines vp-code-dark"><code><span class="line"><span style="color:#F97583;">import</span><span style="color:#E1E4E8;"> Axios </span><span style="color:#F97583;">from</span><span style="color:#E1E4E8;"> </span><span style="color:#9ECBFF;">&#39;axios&#39;</span><span style="color:#E1E4E8;">;</span></span>
<span class="line"><span style="color:#F97583;">import</span><span style="color:#E1E4E8;"> { setupCache } </span><span style="color:#F97583;">from</span><span style="color:#E1E4E8;"> </span><span style="color:#9ECBFF;">&#39;axios-cache-interceptor&#39;</span><span style="color:#E1E4E8;">;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#F97583;">const</span><span style="color:#E1E4E8;"> </span><span style="color:#79B8FF;">axios</span><span style="color:#E1E4E8;"> </span><span style="color:#F97583;">=</span><span style="color:#E1E4E8;"> </span><span style="color:#B392F0;">setupCache</span><span style="color:#E1E4E8;">(Axios);</span></span>
<span class="line has-focus"></span>
<span class="line has-focus"><span style="color:#6A737D;">// These two requests are from completely endpoints, but they will share</span></span>
<span class="line has-focus"><span style="color:#6A737D;">// the same resources and cache, as both have the same ID.</span></span>
<span class="line has-focus"><span style="color:#F97583;">const</span><span style="color:#E1E4E8;"> </span><span style="color:#79B8FF;">reqA</span><span style="color:#E1E4E8;"> </span><span style="color:#F97583;">=</span><span style="color:#E1E4E8;"> </span><span style="color:#F97583;">await</span><span style="color:#E1E4E8;"> axios.</span><span style="color:#B392F0;">get</span><span style="color:#E1E4E8;">(</span><span style="color:#9ECBFF;">&#39;/a&#39;</span><span style="color:#E1E4E8;">, { id: </span><span style="color:#9ECBFF;">&#39;custom-id&#39;</span><span style="color:#E1E4E8;"> });</span></span>
<span class="line has-focus"><span style="color:#F97583;">const</span><span style="color:#E1E4E8;"> </span><span style="color:#79B8FF;">reqB</span><span style="color:#E1E4E8;"> </span><span style="color:#F97583;">=</span><span style="color:#E1E4E8;"> </span><span style="color:#F97583;">await</span><span style="color:#E1E4E8;"> axios.</span><span style="color:#B392F0;">get</span><span style="color:#E1E4E8;">(</span><span style="color:#9ECBFF;">&#39;/b&#39;</span><span style="color:#E1E4E8;">, { id: </span><span style="color:#9ECBFF;">&#39;custom-id&#39;</span><span style="color:#E1E4E8;"> });</span></span></code></pre><pre class="shiki github-light has-focused-lines vp-code-light"><code><span class="line"><span style="color:#D73A49;">import</span><span style="color:#24292E;"> Axios </span><span style="color:#D73A49;">from</span><span style="color:#24292E;"> </span><span style="color:#032F62;">&#39;axios&#39;</span><span style="color:#24292E;">;</span></span>
<span class="line"><span style="color:#D73A49;">import</span><span style="color:#24292E;"> { setupCache } </span><span style="color:#D73A49;">from</span><span style="color:#24292E;"> </span><span style="color:#032F62;">&#39;axios-cache-interceptor&#39;</span><span style="color:#24292E;">;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#D73A49;">const</span><span style="color:#24292E;"> </span><span style="color:#005CC5;">axios</span><span style="color:#24292E;"> </span><span style="color:#D73A49;">=</span><span style="color:#24292E;"> </span><span style="color:#6F42C1;">setupCache</span><span style="color:#24292E;">(Axios);</span></span>
<span class="line has-focus"></span>
<span class="line has-focus"><span style="color:#6A737D;">// These two requests are from completely endpoints, but they will share</span></span>
<span class="line has-focus"><span style="color:#6A737D;">// the same resources and cache, as both have the same ID.</span></span>
<span class="line has-focus"><span style="color:#D73A49;">const</span><span style="color:#24292E;"> </span><span style="color:#005CC5;">reqA</span><span style="color:#24292E;"> </span><span style="color:#D73A49;">=</span><span style="color:#24292E;"> </span><span style="color:#D73A49;">await</span><span style="color:#24292E;"> axios.</span><span style="color:#6F42C1;">get</span><span style="color:#24292E;">(</span><span style="color:#032F62;">&#39;/a&#39;</span><span style="color:#24292E;">, { id: </span><span style="color:#032F62;">&#39;custom-id&#39;</span><span style="color:#24292E;"> });</span></span>
<span class="line has-focus"><span style="color:#D73A49;">const</span><span style="color:#24292E;"> </span><span style="color:#005CC5;">reqB</span><span style="color:#24292E;"> </span><span style="color:#D73A49;">=</span><span style="color:#24292E;"> </span><span style="color:#D73A49;">await</span><span style="color:#24292E;"> axios.</span><span style="color:#6F42C1;">get</span><span style="color:#24292E;">(</span><span style="color:#032F62;">&#39;/b&#39;</span><span style="color:#24292E;">, { id: </span><span style="color:#032F62;">&#39;custom-id&#39;</span><span style="color:#24292E;"> });</span></span></code></pre></div><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki github-dark has-focused-lines has-diff vp-code-dark"><code><span class="line"><span style="color:#F97583;">import</span><span style="color:#E1E4E8;"> Axios </span><span style="color:#F97583;">from</span><span style="color:#E1E4E8;"> </span><span style="color:#9ECBFF;">&#39;axios&#39;</span><span style="color:#E1E4E8;">;</span></span>
<span class="line"><span style="color:#F97583;">import</span><span style="color:#E1E4E8;"> { setupCache } </span><span style="color:#F97583;">from</span><span style="color:#E1E4E8;"> </span><span style="color:#9ECBFF;">&#39;axios-cache-interceptor&#39;</span><span style="color:#E1E4E8;">;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#F97583;">const</span><span style="color:#E1E4E8;"> </span><span style="color:#79B8FF;">axios</span><span style="color:#E1E4E8;"> </span><span style="color:#F97583;">=</span><span style="color:#E1E4E8;"> </span><span style="color:#B392F0;">setupCache</span><span style="color:#E1E4E8;">(Axios);</span></span>
<span class="line has-focus"></span>
<span class="line has-focus"><span style="color:#6A737D;">// You can use the same logic to create two caches for the same endpoint.</span></span>
<span class="line has-focus"><span style="color:#6A737D;">// Allows you to have different use cases for the coincident same endpoint.</span></span>
<span class="line has-focus"><span style="color:#F97583;">const</span><span style="color:#E1E4E8;"> </span><span style="color:#79B8FF;">userForPageX</span><span style="color:#E1E4E8;"> </span><span style="color:#F97583;">=</span><span style="color:#E1E4E8;"> </span><span style="color:#F97583;">await</span><span style="color:#E1E4E8;"> axios.</span><span style="color:#B392F0;">get</span><span style="color:#E1E4E8;">(</span><span style="color:#9ECBFF;">&#39;/users&#39;</span><span style="color:#E1E4E8;">, { id: </span><span style="color:#9ECBFF;">&#39;users-page-x&#39;</span><span style="color:#E1E4E8;"> });</span></span>
<span class="line has-focus"><span style="color:#F97583;">const</span><span style="color:#E1E4E8;"> </span><span style="color:#79B8FF;">userForPageY</span><span style="color:#E1E4E8;"> </span><span style="color:#F97583;">=</span><span style="color:#E1E4E8;"> </span><span style="color:#F97583;">await</span><span style="color:#E1E4E8;"> axios.</span><span style="color:#B392F0;">get</span><span style="color:#E1E4E8;">(</span><span style="color:#9ECBFF;">&#39;/users&#39;</span><span style="color:#E1E4E8;">, { id: </span><span style="color:#9ECBFF;">&#39;users-page-y&#39;</span><span style="color:#E1E4E8;"> });</span></span></code></pre><pre class="shiki github-light has-focused-lines has-diff vp-code-light"><code><span class="line"><span style="color:#D73A49;">import</span><span style="color:#24292E;"> Axios </span><span style="color:#D73A49;">from</span><span style="color:#24292E;"> </span><span style="color:#032F62;">&#39;axios&#39;</span><span style="color:#24292E;">;</span></span>
<span class="line"><span style="color:#D73A49;">import</span><span style="color:#24292E;"> { setupCache } </span><span style="color:#D73A49;">from</span><span style="color:#24292E;"> </span><span style="color:#032F62;">&#39;axios-cache-interceptor&#39;</span><span style="color:#24292E;">;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#D73A49;">const</span><span style="color:#24292E;"> </span><span style="color:#005CC5;">axios</span><span style="color:#24292E;"> </span><span style="color:#D73A49;">=</span><span style="color:#24292E;"> </span><span style="color:#6F42C1;">setupCache</span><span style="color:#24292E;">(Axios);</span></span>
<span class="line has-focus"></span>
<span class="line has-focus"><span style="color:#6A737D;">// You can use the same logic to create two caches for the same endpoint.</span></span>
<span class="line has-focus"><span style="color:#6A737D;">// Allows you to have different use cases for the coincident same endpoint.</span></span>
<span class="line has-focus"><span style="color:#D73A49;">const</span><span style="color:#24292E;"> </span><span style="color:#005CC5;">userForPageX</span><span style="color:#24292E;"> </span><span style="color:#D73A49;">=</span><span style="color:#24292E;"> </span><span style="color:#D73A49;">await</span><span style="color:#24292E;"> axios.</span><span style="color:#6F42C1;">get</span><span style="color:#24292E;">(</span><span style="color:#032F62;">&#39;/users&#39;</span><span style="color:#24292E;">, { id: </span><span style="color:#032F62;">&#39;users-page-x&#39;</span><span style="color:#24292E;"> });</span></span>
<span class="line has-focus"><span style="color:#D73A49;">const</span><span style="color:#24292E;"> </span><span style="color:#005CC5;">userForPageY</span><span style="color:#24292E;"> </span><span style="color:#D73A49;">=</span><span style="color:#24292E;"> </span><span style="color:#D73A49;">await</span><span style="color:#24292E;"> axios.</span><span style="color:#6F42C1;">get</span><span style="color:#24292E;">(</span><span style="color:#032F62;">&#39;/users&#39;</span><span style="color:#24292E;">, { id: </span><span style="color:#032F62;">&#39;users-page-y&#39;</span><span style="color:#24292E;"> });</span></span></code></pre></div></div></div><div class="warning custom-block"><p class="custom-block-title">WARNING</p><p>If you send two different requests forcefully with the same ID. This library will ignore any possible differences between them and share the same cache for both.</p></div><h2 id="custom-generator" tabindex="-1">Custom Generator <a class="header-anchor" href="#custom-generator" aria-label="Permalink to &quot;Custom Generator&quot;">​</a></h2><p>If the default generator is not enough for your use case, you can provide your own custom generator with the <code>generateKey</code> option.</p><p>By default, it extracts <code>method</code>, <code>baseURL</code>, <code>params</code>, <code>data</code> and <code>url</code> properties from the request object and hashes it into a number with <a href="https://www.npmjs.com/package/object-code" target="_blank" rel="noreferrer"><code>object-code</code></a>.</p><p>Here’s an example of a generator that only uses the <code>url</code> and <code>method</code> and <code>custom</code> properties:</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki github-dark has-focused-lines vp-code-dark"><code><span class="line"><span style="color:#F97583;">import</span><span style="color:#E1E4E8;"> Axios </span><span style="color:#F97583;">from</span><span style="color:#E1E4E8;"> </span><span style="color:#9ECBFF;">&#39;axios&#39;</span><span style="color:#E1E4E8;">;</span></span>
<span class="line"><span style="color:#F97583;">import</span><span style="color:#E1E4E8;"> { setupCache, buildKeyGenerator } </span><span style="color:#F97583;">from</span><span style="color:#E1E4E8;"> </span><span style="color:#9ECBFF;">&#39;axios-cache-interceptor&#39;</span><span style="color:#E1E4E8;">;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#F97583;">const</span><span style="color:#E1E4E8;"> </span><span style="color:#79B8FF;">axios</span><span style="color:#E1E4E8;"> </span><span style="color:#F97583;">=</span><span style="color:#E1E4E8;"> </span><span style="color:#B392F0;">setupCache</span><span style="color:#E1E4E8;">(Axios, {</span></span>
<span class="line has-focus"><span style="color:#E1E4E8;">  generateKey: </span><span style="color:#B392F0;">buildKeyGenerator</span><span style="color:#E1E4E8;">((</span><span style="color:#FFAB70;">request</span><span style="color:#E1E4E8;"> ) </span><span style="color:#F97583;">=&gt;</span><span style="color:#E1E4E8;"> ({</span></span>
<span class="line has-focus"><span style="color:#E1E4E8;">    method: request.method,</span></span>
<span class="line has-focus"><span style="color:#E1E4E8;">    url: request.url,</span></span>
<span class="line has-focus"><span style="color:#E1E4E8;">    custom: </span><span style="color:#B392F0;">logicWith</span><span style="color:#E1E4E8;">(request.method, request.url)</span></span>
<span class="line has-focus"><span style="color:#E1E4E8;">  }))</span></span>
<span class="line"><span style="color:#E1E4E8;">});</span></span></code></pre><pre class="shiki github-light has-focused-lines vp-code-light"><code><span class="line"><span style="color:#D73A49;">import</span><span style="color:#24292E;"> Axios </span><span style="color:#D73A49;">from</span><span style="color:#24292E;"> </span><span style="color:#032F62;">&#39;axios&#39;</span><span style="color:#24292E;">;</span></span>
<span class="line"><span style="color:#D73A49;">import</span><span style="color:#24292E;"> { setupCache, buildKeyGenerator } </span><span style="color:#D73A49;">from</span><span style="color:#24292E;"> </span><span style="color:#032F62;">&#39;axios-cache-interceptor&#39;</span><span style="color:#24292E;">;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#D73A49;">const</span><span style="color:#24292E;"> </span><span style="color:#005CC5;">axios</span><span style="color:#24292E;"> </span><span style="color:#D73A49;">=</span><span style="color:#24292E;"> </span><span style="color:#6F42C1;">setupCache</span><span style="color:#24292E;">(Axios, {</span></span>
<span class="line has-focus"><span style="color:#24292E;">  generateKey: </span><span style="color:#6F42C1;">buildKeyGenerator</span><span style="color:#24292E;">((</span><span style="color:#E36209;">request</span><span style="color:#24292E;"> ) </span><span style="color:#D73A49;">=&gt;</span><span style="color:#24292E;"> ({</span></span>
<span class="line has-focus"><span style="color:#24292E;">    method: request.method,</span></span>
<span class="line has-focus"><span style="color:#24292E;">    url: request.url,</span></span>
<span class="line has-focus"><span style="color:#24292E;">    custom: </span><span style="color:#6F42C1;">logicWith</span><span style="color:#24292E;">(request.method, request.url)</span></span>
<span class="line has-focus"><span style="color:#24292E;">  }))</span></span>
<span class="line"><span style="color:#24292E;">});</span></span></code></pre></div>`,11),l=[p];function t(c,r,y,i,E,d){return a(),n("div",null,l)}const F=s(e,[["render",t]]);export{h as __pageData,F as default};
