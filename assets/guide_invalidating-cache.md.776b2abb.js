import{_ as s,o as a,c as n,S as e}from"./chunks/framework.c5c38cfd.js";const d=JSON.parse('{"title":"Invalidating Cache","description":"","frontmatter":{},"headers":[],"relativePath":"guide/invalidating-cache.md","filePath":"guide/invalidating-cache.md","lastUpdated":1693954743000}'),l={name:"guide/invalidating-cache.md"},o=e(`<h1 id="invalidating-cache" tabindex="-1">Invalidating Cache <a class="header-anchor" href="#invalidating-cache" aria-label="Permalink to &quot;Invalidating Cache&quot;">​</a></h1><p>When using cache-first approaches to improve performance, data inconsistency becomes your major problem. That occurs because <strong>you</strong> can mutate data in the server and <strong>others</strong> also can too. Becoming impossible to really know what is the current state of the data at real time without communicating with the server.</p><div class="warning custom-block"><p class="custom-block-title">WARNING</p><p><strong>All available revalidation methods only works when the request is successful.</strong></p><p>If you are wanting to revalidate with a non standard <code>2XX</code> status code, make sure to enable it at <a href="https://axios-http.com/docs/handling_errors" target="_blank" rel="noreferrer"><code>validateStatus</code></a> or revalidate it manually as shown <a href="#updating-cache-through-external-sources">below</a>.</p></div><p>Take a look at this simple example:</p><ol><li>User list all available posts, server return an empty array.</li><li>User proceeds to create a new post, server returns 200 OK.</li><li>Your frontend navigates to the post list page.</li><li>The post list page still shows 0 posts because it had a recent cache for that request.</li><li>Your client shows 0 posts, but the server actually has 1 post.</li></ol><h2 id="revalidation-after-mutation" tabindex="-1">Revalidation after mutation <a class="header-anchor" href="#revalidation-after-mutation" aria-label="Permalink to &quot;Revalidation after mutation&quot;">​</a></h2><p>Most of the cases, you were the one responsible for that inconsistency, like in the above example when the client himself initiated the mutation request. When that happens, you are capable of invalidating the cache for all places you have changed too.</p><p><strong>The <code>cache.update</code> option is available for every request that you make, and it will be the go-to tool for invalidation.</strong></p><div class="tip custom-block"><p class="custom-block-title">TIP</p><p>By centralizing your requests into separate methods, you are more likely to keep track of custom IDs you use for each request, thus making it easier to reference and invalidate after.</p></div><h2 id="programmatically" tabindex="-1">Programmatically <a class="header-anchor" href="#programmatically" aria-label="Permalink to &quot;Programmatically&quot;">​</a></h2><p>If the mutation you made was just simple changes, you can get the mutation response and update programmatically your cache.</p><p>Again considering the first example, we can just to an <code>array.push</code> to the <code>list-posts</code> cache and we are good to go.</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki github-dark has-focused-lines vp-code-dark"><code><span class="line"><span style="color:#6A737D;">// Uses \`list-posts\` id to be able to reference it later.</span></span>
<span class="line"><span style="color:#F97583;">function</span><span style="color:#E1E4E8;"> </span><span style="color:#B392F0;">listPosts</span><span style="color:#E1E4E8;">() {</span></span>
<span class="line"><span style="color:#E1E4E8;">  </span><span style="color:#F97583;">return</span><span style="color:#E1E4E8;"> axios.</span><span style="color:#B392F0;">get</span><span style="color:#E1E4E8;">(</span><span style="color:#9ECBFF;">&#39;/posts&#39;</span><span style="color:#E1E4E8;">, {</span></span>
<span class="line"><span style="color:#E1E4E8;">    id: </span><span style="color:#9ECBFF;">&#39;list-posts&#39;</span></span>
<span class="line"><span style="color:#E1E4E8;">  });</span></span>
<span class="line"><span style="color:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="color:#F97583;">function</span><span style="color:#E1E4E8;"> </span><span style="color:#B392F0;">createPost</span><span style="color:#E1E4E8;">(</span><span style="color:#FFAB70;">data</span><span style="color:#E1E4E8;">) {</span></span>
<span class="line"><span style="color:#E1E4E8;">  </span><span style="color:#F97583;">return</span><span style="color:#E1E4E8;"> axios.</span><span style="color:#B392F0;">post</span><span style="color:#E1E4E8;">(</span></span>
<span class="line"><span style="color:#E1E4E8;">    </span><span style="color:#9ECBFF;">&#39;/posts&#39;</span><span style="color:#E1E4E8;">,</span></span>
<span class="line"><span style="color:#E1E4E8;">    data,</span></span>
<span class="line has-focus"><span style="color:#E1E4E8;">     {</span></span>
<span class="line has-focus"><span style="color:#E1E4E8;">      cache: {</span></span>
<span class="line has-focus"><span style="color:#E1E4E8;">        update: {</span></span>
<span class="line has-focus"><span style="color:#E1E4E8;">          </span><span style="color:#6A737D;">// Will perform a cache update for the \`list-posts\` respective</span></span>
<span class="line has-focus"><span style="color:#E1E4E8;">          </span><span style="color:#6A737D;">// cache entry.</span></span>
<span class="line has-focus"><span style="color:#E1E4E8;">          </span><span style="color:#9ECBFF;">&#39;list-posts&#39;</span><span style="color:#E1E4E8;">: (</span><span style="color:#FFAB70;">listPostsCache</span><span style="color:#E1E4E8;">, </span><span style="color:#FFAB70;">createPostResponse</span><span style="color:#E1E4E8;">) </span><span style="color:#F97583;">=&gt;</span><span style="color:#E1E4E8;"> {</span></span>
<span class="line has-focus"><span style="color:#E1E4E8;">            </span><span style="color:#6A737D;">// If the cache is does not has a cached state, we don&#39;t need</span></span>
<span class="line has-focus"><span style="color:#E1E4E8;">            </span><span style="color:#6A737D;">// to update it</span></span>
<span class="line has-focus"><span style="color:#E1E4E8;">            </span><span style="color:#F97583;">if</span><span style="color:#E1E4E8;"> (listPostsCache.state </span><span style="color:#F97583;">!==</span><span style="color:#E1E4E8;"> </span><span style="color:#9ECBFF;">&#39;cached&#39;</span><span style="color:#E1E4E8;">) {</span></span>
<span class="line has-focus"><span style="color:#E1E4E8;">              </span><span style="color:#F97583;">return</span><span style="color:#E1E4E8;"> </span><span style="color:#9ECBFF;">&#39;ignore&#39;</span><span style="color:#E1E4E8;">;</span></span>
<span class="line has-focus"><span style="color:#E1E4E8;">            }</span></span>
<span class="line has-focus"></span>
<span class="line has-focus"><span style="color:#E1E4E8;">            </span><span style="color:#6A737D;">// Imagine the server response for the \`list-posts\` request</span></span>
<span class="line has-focus"><span style="color:#E1E4E8;">            </span><span style="color:#6A737D;">// is: { posts: Post[]; }, and the \`create-post\` response</span></span>
<span class="line has-focus"><span style="color:#E1E4E8;">            </span><span style="color:#6A737D;">// comes with the newly created post.</span></span>
<span class="line has-focus"></span>
<span class="line has-focus"><span style="color:#E1E4E8;">            </span><span style="color:#6A737D;">// Adds the created post to the end of the post&#39;s list</span></span>
<span class="line has-focus"><span style="color:#E1E4E8;">            listPostsCache.data.posts.</span><span style="color:#B392F0;">push</span><span style="color:#E1E4E8;">(createPostResponse.data);</span></span>
<span class="line has-focus"></span>
<span class="line has-focus"><span style="color:#E1E4E8;">            </span><span style="color:#6A737D;">// Return the same cache state, but a updated one.</span></span>
<span class="line has-focus"><span style="color:#E1E4E8;">            </span><span style="color:#F97583;">return</span><span style="color:#E1E4E8;"> listPostsCache;</span></span>
<span class="line has-focus"><span style="color:#E1E4E8;">          }</span></span>
<span class="line has-focus"><span style="color:#E1E4E8;">        }</span></span>
<span class="line has-focus"><span style="color:#E1E4E8;">      }</span></span>
<span class="line has-focus"><span style="color:#E1E4E8;">    }</span></span>
<span class="line"><span style="color:#E1E4E8;">  );</span></span>
<span class="line"><span style="color:#E1E4E8;">}</span></span></code></pre><pre class="shiki github-light has-focused-lines vp-code-light"><code><span class="line"><span style="color:#6A737D;">// Uses \`list-posts\` id to be able to reference it later.</span></span>
<span class="line"><span style="color:#D73A49;">function</span><span style="color:#24292E;"> </span><span style="color:#6F42C1;">listPosts</span><span style="color:#24292E;">() {</span></span>
<span class="line"><span style="color:#24292E;">  </span><span style="color:#D73A49;">return</span><span style="color:#24292E;"> axios.</span><span style="color:#6F42C1;">get</span><span style="color:#24292E;">(</span><span style="color:#032F62;">&#39;/posts&#39;</span><span style="color:#24292E;">, {</span></span>
<span class="line"><span style="color:#24292E;">    id: </span><span style="color:#032F62;">&#39;list-posts&#39;</span></span>
<span class="line"><span style="color:#24292E;">  });</span></span>
<span class="line"><span style="color:#24292E;">}</span></span>
<span class="line"></span>
<span class="line"><span style="color:#D73A49;">function</span><span style="color:#24292E;"> </span><span style="color:#6F42C1;">createPost</span><span style="color:#24292E;">(</span><span style="color:#E36209;">data</span><span style="color:#24292E;">) {</span></span>
<span class="line"><span style="color:#24292E;">  </span><span style="color:#D73A49;">return</span><span style="color:#24292E;"> axios.</span><span style="color:#6F42C1;">post</span><span style="color:#24292E;">(</span></span>
<span class="line"><span style="color:#24292E;">    </span><span style="color:#032F62;">&#39;/posts&#39;</span><span style="color:#24292E;">,</span></span>
<span class="line"><span style="color:#24292E;">    data,</span></span>
<span class="line has-focus"><span style="color:#24292E;">     {</span></span>
<span class="line has-focus"><span style="color:#24292E;">      cache: {</span></span>
<span class="line has-focus"><span style="color:#24292E;">        update: {</span></span>
<span class="line has-focus"><span style="color:#24292E;">          </span><span style="color:#6A737D;">// Will perform a cache update for the \`list-posts\` respective</span></span>
<span class="line has-focus"><span style="color:#24292E;">          </span><span style="color:#6A737D;">// cache entry.</span></span>
<span class="line has-focus"><span style="color:#24292E;">          </span><span style="color:#032F62;">&#39;list-posts&#39;</span><span style="color:#24292E;">: (</span><span style="color:#E36209;">listPostsCache</span><span style="color:#24292E;">, </span><span style="color:#E36209;">createPostResponse</span><span style="color:#24292E;">) </span><span style="color:#D73A49;">=&gt;</span><span style="color:#24292E;"> {</span></span>
<span class="line has-focus"><span style="color:#24292E;">            </span><span style="color:#6A737D;">// If the cache is does not has a cached state, we don&#39;t need</span></span>
<span class="line has-focus"><span style="color:#24292E;">            </span><span style="color:#6A737D;">// to update it</span></span>
<span class="line has-focus"><span style="color:#24292E;">            </span><span style="color:#D73A49;">if</span><span style="color:#24292E;"> (listPostsCache.state </span><span style="color:#D73A49;">!==</span><span style="color:#24292E;"> </span><span style="color:#032F62;">&#39;cached&#39;</span><span style="color:#24292E;">) {</span></span>
<span class="line has-focus"><span style="color:#24292E;">              </span><span style="color:#D73A49;">return</span><span style="color:#24292E;"> </span><span style="color:#032F62;">&#39;ignore&#39;</span><span style="color:#24292E;">;</span></span>
<span class="line has-focus"><span style="color:#24292E;">            }</span></span>
<span class="line has-focus"></span>
<span class="line has-focus"><span style="color:#24292E;">            </span><span style="color:#6A737D;">// Imagine the server response for the \`list-posts\` request</span></span>
<span class="line has-focus"><span style="color:#24292E;">            </span><span style="color:#6A737D;">// is: { posts: Post[]; }, and the \`create-post\` response</span></span>
<span class="line has-focus"><span style="color:#24292E;">            </span><span style="color:#6A737D;">// comes with the newly created post.</span></span>
<span class="line has-focus"></span>
<span class="line has-focus"><span style="color:#24292E;">            </span><span style="color:#6A737D;">// Adds the created post to the end of the post&#39;s list</span></span>
<span class="line has-focus"><span style="color:#24292E;">            listPostsCache.data.posts.</span><span style="color:#6F42C1;">push</span><span style="color:#24292E;">(createPostResponse.data);</span></span>
<span class="line has-focus"></span>
<span class="line has-focus"><span style="color:#24292E;">            </span><span style="color:#6A737D;">// Return the same cache state, but a updated one.</span></span>
<span class="line has-focus"><span style="color:#24292E;">            </span><span style="color:#D73A49;">return</span><span style="color:#24292E;"> listPostsCache;</span></span>
<span class="line has-focus"><span style="color:#24292E;">          }</span></span>
<span class="line has-focus"><span style="color:#24292E;">        }</span></span>
<span class="line has-focus"><span style="color:#24292E;">      }</span></span>
<span class="line has-focus"><span style="color:#24292E;">    }</span></span>
<span class="line"><span style="color:#24292E;">  );</span></span>
<span class="line"><span style="color:#24292E;">}</span></span></code></pre></div><p>This will update the <code>list-posts</code> cache at the client side, making it equal to the server. When operations like this are possible to be made, they are the preferred. That’s because we do not contact the server again and update ourselves the cache.</p><h2 id="through-network" tabindex="-1">Through network <a class="header-anchor" href="#through-network" aria-label="Permalink to &quot;Through network&quot;">​</a></h2><p>Sometimes, the mutation you made is not simple enough and would need a lot of copied service code to replicate all changes the backend made, turning it into a duplication and maintenance nightmare.</p><p>In those cases, you can just invalidate the cache and let the next request be forwarded to the server, and updating the cache with the new network response.</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki github-dark has-focused-lines vp-code-dark"><code><span class="line"><span style="color:#6A737D;">// Uses \`list-posts\` id to be able to reference it later.</span></span>
<span class="line"><span style="color:#F97583;">function</span><span style="color:#E1E4E8;"> </span><span style="color:#B392F0;">listPosts</span><span style="color:#E1E4E8;">() {</span></span>
<span class="line"><span style="color:#E1E4E8;">  </span><span style="color:#F97583;">return</span><span style="color:#E1E4E8;"> axios.</span><span style="color:#B392F0;">get</span><span style="color:#E1E4E8;">(</span><span style="color:#9ECBFF;">&#39;/posts&#39;</span><span style="color:#E1E4E8;">, {</span></span>
<span class="line has-focus"><span style="color:#E1E4E8;">    </span></span>
<span class="line has-focus"><span style="color:#E1E4E8;">    id: </span><span style="color:#9ECBFF;">&#39;list-posts&#39;</span></span>
<span class="line has-focus"><span style="color:#E1E4E8;">  });</span></span>
<span class="line"><span style="color:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="color:#F97583;">function</span><span style="color:#E1E4E8;"> </span><span style="color:#B392F0;">createPost</span><span style="color:#E1E4E8;">(</span><span style="color:#FFAB70;">data</span><span style="color:#E1E4E8;">) {</span></span>
<span class="line"><span style="color:#E1E4E8;">  </span><span style="color:#F97583;">return</span><span style="color:#E1E4E8;"> axios.</span><span style="color:#B392F0;">post</span><span style="color:#E1E4E8;">(</span><span style="color:#9ECBFF;">&#39;/posts&#39;</span><span style="color:#E1E4E8;">, data, {</span></span>
<span class="line has-focus"><span style="color:#E1E4E8;">    </span></span>
<span class="line has-focus"><span style="color:#E1E4E8;">    cache: {</span></span>
<span class="line has-focus"><span style="color:#E1E4E8;">      update: {</span></span>
<span class="line has-focus"><span style="color:#E1E4E8;">        </span><span style="color:#6A737D;">// Will, internally, call storage.remove(&#39;list-posts&#39;) and let the</span></span>
<span class="line has-focus"><span style="color:#E1E4E8;">        </span><span style="color:#6A737D;">// next request be forwarded to the server without you having to</span></span>
<span class="line has-focus"><span style="color:#E1E4E8;">        </span><span style="color:#6A737D;">// do any checks.</span></span>
<span class="line has-focus"><span style="color:#E1E4E8;">        </span><span style="color:#9ECBFF;">&#39;list-posts&#39;</span><span style="color:#E1E4E8;">: </span><span style="color:#9ECBFF;">&#39;delete&#39;</span></span>
<span class="line has-focus"><span style="color:#E1E4E8;">      }</span></span>
<span class="line has-focus"><span style="color:#E1E4E8;">    }</span></span>
<span class="line"><span style="color:#E1E4E8;">  });</span></span>
<span class="line"><span style="color:#E1E4E8;">}</span></span></code></pre><pre class="shiki github-light has-focused-lines vp-code-light"><code><span class="line"><span style="color:#6A737D;">// Uses \`list-posts\` id to be able to reference it later.</span></span>
<span class="line"><span style="color:#D73A49;">function</span><span style="color:#24292E;"> </span><span style="color:#6F42C1;">listPosts</span><span style="color:#24292E;">() {</span></span>
<span class="line"><span style="color:#24292E;">  </span><span style="color:#D73A49;">return</span><span style="color:#24292E;"> axios.</span><span style="color:#6F42C1;">get</span><span style="color:#24292E;">(</span><span style="color:#032F62;">&#39;/posts&#39;</span><span style="color:#24292E;">, {</span></span>
<span class="line has-focus"><span style="color:#24292E;">    </span></span>
<span class="line has-focus"><span style="color:#24292E;">    id: </span><span style="color:#032F62;">&#39;list-posts&#39;</span></span>
<span class="line has-focus"><span style="color:#24292E;">  });</span></span>
<span class="line"><span style="color:#24292E;">}</span></span>
<span class="line"></span>
<span class="line"><span style="color:#D73A49;">function</span><span style="color:#24292E;"> </span><span style="color:#6F42C1;">createPost</span><span style="color:#24292E;">(</span><span style="color:#E36209;">data</span><span style="color:#24292E;">) {</span></span>
<span class="line"><span style="color:#24292E;">  </span><span style="color:#D73A49;">return</span><span style="color:#24292E;"> axios.</span><span style="color:#6F42C1;">post</span><span style="color:#24292E;">(</span><span style="color:#032F62;">&#39;/posts&#39;</span><span style="color:#24292E;">, data, {</span></span>
<span class="line has-focus"><span style="color:#24292E;">    </span></span>
<span class="line has-focus"><span style="color:#24292E;">    cache: {</span></span>
<span class="line has-focus"><span style="color:#24292E;">      update: {</span></span>
<span class="line has-focus"><span style="color:#24292E;">        </span><span style="color:#6A737D;">// Will, internally, call storage.remove(&#39;list-posts&#39;) and let the</span></span>
<span class="line has-focus"><span style="color:#24292E;">        </span><span style="color:#6A737D;">// next request be forwarded to the server without you having to</span></span>
<span class="line has-focus"><span style="color:#24292E;">        </span><span style="color:#6A737D;">// do any checks.</span></span>
<span class="line has-focus"><span style="color:#24292E;">        </span><span style="color:#032F62;">&#39;list-posts&#39;</span><span style="color:#24292E;">: </span><span style="color:#032F62;">&#39;delete&#39;</span></span>
<span class="line has-focus"><span style="color:#24292E;">      }</span></span>
<span class="line has-focus"><span style="color:#24292E;">    }</span></span>
<span class="line"><span style="color:#24292E;">  });</span></span>
<span class="line"><span style="color:#24292E;">}</span></span></code></pre></div><p>Still using the first example, while we are at the step <strong>3</strong>, automatically, the-axios cache-interceptor instance will request the server again and do required changes in the cache before the promise resolves and your page gets rendered.</p><h2 id="through-external-sources" tabindex="-1">Through external sources <a class="header-anchor" href="#through-external-sources" aria-label="Permalink to &quot;Through external sources&quot;">​</a></h2><p>If you have any other type of external communication, like when listening to a websocket for changes, you may want to update your axios cache without be in a request context.</p><p>For that, you can operate the storage manually. It is simple as that:</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki github-dark vp-code-dark"><code><span class="line"><span style="color:#F97583;">if</span><span style="color:#E1E4E8;"> (someLogicThatShowsIfTheCacheShouldBeInvalidated) {</span></span>
<span class="line"><span style="color:#E1E4E8;">  </span><span style="color:#6A737D;">// Deletes the current cache for the \`list-posts\` respective request.</span></span>
<span class="line"><span style="color:#E1E4E8;">  </span><span style="color:#F97583;">await</span><span style="color:#E1E4E8;"> axios.storage.</span><span style="color:#B392F0;">remove</span><span style="color:#E1E4E8;">(</span><span style="color:#9ECBFF;">&#39;list-posts&#39;</span><span style="color:#E1E4E8;">);</span></span>
<span class="line"><span style="color:#E1E4E8;">}</span></span></code></pre><pre class="shiki github-light vp-code-light"><code><span class="line"><span style="color:#D73A49;">if</span><span style="color:#24292E;"> (someLogicThatShowsIfTheCacheShouldBeInvalidated) {</span></span>
<span class="line"><span style="color:#24292E;">  </span><span style="color:#6A737D;">// Deletes the current cache for the \`list-posts\` respective request.</span></span>
<span class="line"><span style="color:#24292E;">  </span><span style="color:#D73A49;">await</span><span style="color:#24292E;"> axios.storage.</span><span style="color:#6F42C1;">remove</span><span style="color:#24292E;">(</span><span style="color:#032F62;">&#39;list-posts&#39;</span><span style="color:#24292E;">);</span></span>
<span class="line"><span style="color:#24292E;">}</span></span></code></pre></div><h2 id="keeping-cache-up-to-date" tabindex="-1">Keeping cache up to date <a class="header-anchor" href="#keeping-cache-up-to-date" aria-label="Permalink to &quot;Keeping cache up to date&quot;">​</a></h2><p>If you were <strong>not</strong> the one responsible for that change, your client may not be aware that it has changed. E.g. When you are using a chat application, you may not be aware that a new message was sent to you.</p><p>In such cases that we do have a way to know that the cache is outdated, you may have to end up setting a custom time to live (TTL) for specific requests.</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki github-dark vp-code-dark"><code><span class="line"><span style="color:#6A737D;">// Uses \`list-posts\` id to be able to reference it later.</span></span>
<span class="line"><span style="color:#F97583;">function</span><span style="color:#E1E4E8;"> </span><span style="color:#B392F0;">listPosts</span><span style="color:#E1E4E8;">() {</span></span>
<span class="line"><span style="color:#E1E4E8;">  </span><span style="color:#F97583;">return</span><span style="color:#E1E4E8;"> axios.</span><span style="color:#B392F0;">get</span><span style="color:#E1E4E8;">(</span><span style="color:#9ECBFF;">&#39;/posts&#39;</span><span style="color:#E1E4E8;">, {</span></span>
<span class="line"><span style="color:#E1E4E8;">    id: </span><span style="color:#9ECBFF;">&#39;list-posts&#39;</span><span style="color:#E1E4E8;">,</span></span>
<span class="line"><span style="color:#E1E4E8;">    cache: {</span></span>
<span class="line"><span style="color:#E1E4E8;">      ttl: </span><span style="color:#79B8FF;">1000</span><span style="color:#E1E4E8;"> </span><span style="color:#F97583;">*</span><span style="color:#E1E4E8;"> </span><span style="color:#79B8FF;">60</span><span style="color:#E1E4E8;"> </span><span style="color:#6A737D;">// 1 minute.</span></span>
<span class="line"><span style="color:#E1E4E8;">    }</span></span>
<span class="line"><span style="color:#E1E4E8;">  });</span></span>
<span class="line"><span style="color:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="color:#F97583;">function</span><span style="color:#E1E4E8;"> </span><span style="color:#B392F0;">createPost</span><span style="color:#E1E4E8;">(</span><span style="color:#FFAB70;">data</span><span style="color:#E1E4E8;">) {</span></span>
<span class="line"><span style="color:#E1E4E8;">  </span><span style="color:#F97583;">return</span><span style="color:#E1E4E8;"> axios.</span><span style="color:#B392F0;">post</span><span style="color:#E1E4E8;">(</span><span style="color:#9ECBFF;">&#39;/posts&#39;</span><span style="color:#E1E4E8;">, data, {</span></span>
<span class="line"><span style="color:#E1E4E8;">    cache: {</span></span>
<span class="line"><span style="color:#E1E4E8;">      update: {</span></span>
<span class="line"><span style="color:#E1E4E8;">        </span><span style="color:#6A737D;">// I still want to delete the cache when I KNOW things have</span></span>
<span class="line"><span style="color:#E1E4E8;">        </span><span style="color:#6A737D;">// changed, but, by setting a TTL of 1 minute, I ensure that</span></span>
<span class="line"><span style="color:#E1E4E8;">        </span><span style="color:#6A737D;">// 1 minute is the highest time interval that the cache MAY</span></span>
<span class="line"><span style="color:#E1E4E8;">        </span><span style="color:#6A737D;">// get outdated.</span></span>
<span class="line"><span style="color:#E1E4E8;">        </span><span style="color:#9ECBFF;">&#39;list-posts&#39;</span><span style="color:#E1E4E8;">: </span><span style="color:#9ECBFF;">&#39;delete&#39;</span></span>
<span class="line"><span style="color:#E1E4E8;">      }</span></span>
<span class="line"><span style="color:#E1E4E8;">    }</span></span>
<span class="line"><span style="color:#E1E4E8;">  });</span></span>
<span class="line"><span style="color:#E1E4E8;">}</span></span></code></pre><pre class="shiki github-light vp-code-light"><code><span class="line"><span style="color:#6A737D;">// Uses \`list-posts\` id to be able to reference it later.</span></span>
<span class="line"><span style="color:#D73A49;">function</span><span style="color:#24292E;"> </span><span style="color:#6F42C1;">listPosts</span><span style="color:#24292E;">() {</span></span>
<span class="line"><span style="color:#24292E;">  </span><span style="color:#D73A49;">return</span><span style="color:#24292E;"> axios.</span><span style="color:#6F42C1;">get</span><span style="color:#24292E;">(</span><span style="color:#032F62;">&#39;/posts&#39;</span><span style="color:#24292E;">, {</span></span>
<span class="line"><span style="color:#24292E;">    id: </span><span style="color:#032F62;">&#39;list-posts&#39;</span><span style="color:#24292E;">,</span></span>
<span class="line"><span style="color:#24292E;">    cache: {</span></span>
<span class="line"><span style="color:#24292E;">      ttl: </span><span style="color:#005CC5;">1000</span><span style="color:#24292E;"> </span><span style="color:#D73A49;">*</span><span style="color:#24292E;"> </span><span style="color:#005CC5;">60</span><span style="color:#24292E;"> </span><span style="color:#6A737D;">// 1 minute.</span></span>
<span class="line"><span style="color:#24292E;">    }</span></span>
<span class="line"><span style="color:#24292E;">  });</span></span>
<span class="line"><span style="color:#24292E;">}</span></span>
<span class="line"></span>
<span class="line"><span style="color:#D73A49;">function</span><span style="color:#24292E;"> </span><span style="color:#6F42C1;">createPost</span><span style="color:#24292E;">(</span><span style="color:#E36209;">data</span><span style="color:#24292E;">) {</span></span>
<span class="line"><span style="color:#24292E;">  </span><span style="color:#D73A49;">return</span><span style="color:#24292E;"> axios.</span><span style="color:#6F42C1;">post</span><span style="color:#24292E;">(</span><span style="color:#032F62;">&#39;/posts&#39;</span><span style="color:#24292E;">, data, {</span></span>
<span class="line"><span style="color:#24292E;">    cache: {</span></span>
<span class="line"><span style="color:#24292E;">      update: {</span></span>
<span class="line"><span style="color:#24292E;">        </span><span style="color:#6A737D;">// I still want to delete the cache when I KNOW things have</span></span>
<span class="line"><span style="color:#24292E;">        </span><span style="color:#6A737D;">// changed, but, by setting a TTL of 1 minute, I ensure that</span></span>
<span class="line"><span style="color:#24292E;">        </span><span style="color:#6A737D;">// 1 minute is the highest time interval that the cache MAY</span></span>
<span class="line"><span style="color:#24292E;">        </span><span style="color:#6A737D;">// get outdated.</span></span>
<span class="line"><span style="color:#24292E;">        </span><span style="color:#032F62;">&#39;list-posts&#39;</span><span style="color:#24292E;">: </span><span style="color:#032F62;">&#39;delete&#39;</span></span>
<span class="line"><span style="color:#24292E;">      }</span></span>
<span class="line"><span style="color:#24292E;">    }</span></span>
<span class="line"><span style="color:#24292E;">  });</span></span>
<span class="line"><span style="color:#24292E;">}</span></span></code></pre></div><h2 id="summing-up" tabindex="-1">Summing up <a class="header-anchor" href="#summing-up" aria-label="Permalink to &quot;Summing up&quot;">​</a></h2><p>When applying any kind of cache to any kind of application, you chose to trade data consistency for performance. And, most of the time that is OK.</p><p><em>The best cache strategy is a combination of all of them. TTL, custom revalidation, stale while revalidate and all the others together are the best solution.</em></p><p>The only real tip here is to you put on a scale the amount of inconsistency you are willing to give up for the performance you are willing to gain. <strong>Sometimes, not caching is the best solution.</strong></p>`,31),p=[o];function t(c,r,i,E,y,h){return a(),n("div",null,p)}const f=s(l,[["render",t]]);export{d as __pageData,f as default};
