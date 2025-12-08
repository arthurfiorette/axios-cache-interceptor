# Axios Cache Interceptor Flow Diagrams

This directory contains comprehensive Mermaid diagrams that explain the internal flow of the axios-cache-interceptor library. These diagrams help developers understand how requests are processed, cached, and returned.

## Diagrams Overview

### 1. **request-response-flow-overview.mermaid**
High-level overview showing the complete journey of a request through the interceptor system:
- Client request → Request Interceptor → Adapter → Response Interceptor → Client response
- Shows major decision points and cache states
- Best starting point for understanding the library

### 2. **request-interceptor-detailed.mermaid**
Detailed flow of the request interceptor showing:
- Cache key generation
- URL filtering (ignoreUrls, allowUrls)
- Cache takeover header injection
- Cache state checks (empty, stale, cached, loading, must-revalidate)
- Concurrent request handling with deferred promises
- Conditional header addition for stale requests
- All debug messages and their conditions

### 3. **response-interceptor-detailed.mermaid**
Detailed flow of the response interceptor for successful responses:
- Cached response detection
- Cache predicate evaluation
- Cache update logic for other entries
- Header interpretation flow
- TTL calculation (from headers or config)
- Cache storage and waiting request resolution
- All debug messages in the success path

### 4. **response-error-interceptor-detailed.mermaid**
Detailed flow of the response interceptor error handler:
- Error type validation
- staleIfError logic evaluation
- Stale data return conditions
- Cache cleanup on errors
- Waiting request rejection
- All debug messages in the error path

### 5. **cache-states-transitions.mermaid**
State diagram showing all possible cache states and their transitions:
- **empty**: No cached data
- **cached**: Fresh data available
- **stale**: Expired but potentially usable data
- **loading**: Request in progress
- **must-revalidate**: Requires server validation
- Explains when and why states change

### 6. **debug-messages-guide.mermaid**
Comprehensive guide to all debug messages:
- What each message means
- What action is being taken
- Why the condition occurred
- What the result will be
- Helps troubleshoot issues like #578

### 7. **header-interpreter-flow.mermaid**
Detailed flow of HTTP header interpretation:
- Cache-Control directive parsing
- max-age, immutable, no-cache, no-store handling
- Age header processing
- Stale directive handling (max-stale, stale-while-revalidate)
- Expires header fallback
- Priority and return value explanations

## How to Use These Diagrams

### For Developers
1. Start with `request-response-flow-overview.mermaid` to understand the big picture
2. Use `cache-states-transitions.mermaid` to understand when cache states change
3. Dive into specific interceptor diagrams when debugging issues
4. Reference `debug-messages-guide.mermaid` when analyzing debug output

### For Debugging
When you see unexpected behavior:
1. Enable debug mode in your axios-cache-interceptor config
2. Find the debug message in `debug-messages-guide.mermaid`
3. Follow the corresponding flow in the detailed interceptor diagrams
4. Understand what conditions led to that path

### For Understanding Issues
For issues like #578 (hard to understand debug output):
- The `debug-messages-guide.mermaid` provides context for every message
- Each message explains the "what", "why", and "what next"
- Color coding indicates message severity/type

## Viewing the Diagrams

### Online Viewers
- [Mermaid Live Editor](https://mermaid.live/) - Paste diagram content
- GitHub renders .mermaid files natively in the web interface
- VS Code with Mermaid extension

### In Documentation
These diagrams can be embedded in the documentation site at `docs/` directory.

### Command Line
```bash
# Install mermaid CLI
npm install -g @mermaid-js/mermaid-cli

# Generate PNG/SVG from .mermaid files
mmdc -i request-response-flow-overview.mermaid -o request-response-flow-overview.png
```

## Color Legend

In the diagrams, colors indicate different types of nodes:

- **Green**: Success paths, cached responses, good outcomes
- **Yellow**: Debug messages, information, warnings
- **Orange**: Stale data, partial success
- **Red**: Errors, cache rejections, failures
- **Blue**: Process steps, data flow, decisions
- **Light Blue**: Informational notes, explanations

## Related Issues and PRs

- **Issue #578**: Understanding debug output - Addressed by `debug-messages-guide.mermaid`
- **Issue #579**: cacheTakeover and Pragma header explanation
- **Issue #471**: iOS Safari compatibility requiring Pragma header

## Contributing

If you find errors in these diagrams or want to improve them:
1. Edit the .mermaid files
2. Test them in [Mermaid Live Editor](https://mermaid.live/)
3. Submit a pull request with your improvements

## Notes on Cache Takeover

The `cacheTakeover` option (detailed in request-interceptor-detailed.mermaid) sets these headers:
- `Cache-Control: no-cache, no-store, must-revalidate, max-age=0`
- `Pragma: no-cache`
- `Expires: 0`

The `Pragma` header is specifically needed for iOS Safari due to a WebKit bug (#170714). Even though it's an HTTP/1.0 header, it's still required for proper cache prevention on iOS devices. This is documented in issues #579 and #471.
