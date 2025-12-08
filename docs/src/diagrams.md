# Flow Diagrams

Comprehensive diagrams that explain the internal flow of the axios-cache-interceptor library. These diagrams help developers understand how requests are processed, cached, and returned.

## Available Diagrams

### [Overview](/diagrams/overview)
High-level overview showing the complete journey of a request through the interceptor system.

### [Request Interceptor](/diagrams/request-interceptor)
Detailed flow of the request interceptor showing cache key generation, URL filtering, cache state checks, and concurrent request handling.

### [Response Interceptor](/diagrams/response-interceptor)
Detailed flow of the response interceptor for successful responses, including cache predicate evaluation and TTL calculation.

### [Response Error Handler](/diagrams/response-error-interceptor)
Detailed flow of the response interceptor error handler with staleIfError logic.

### [Cache States](/diagrams/cache-states)
State diagram showing all possible cache states and their transitions.

### [Debug Messages](/diagrams/debug-messages)
Comprehensive guide to all debug messages - what they mean, why they occur, and what actions are taken.

### [Header Interpreter](/diagrams/header-interpreter)
Flow showing how HTTP headers are interpreted for cache TTL calculation.

## How to Use These Diagrams

### For Developers
1. Start with the [Overview](/diagrams/overview) to understand the big picture
2. Use [Cache States](/diagrams/cache-states) to understand when cache states change
3. Dive into specific interceptor diagrams when debugging issues
4. Reference [Debug Messages](/diagrams/debug-messages) when analyzing debug output

### For Debugging
When you see unexpected behavior:
1. Enable debug mode in your axios-cache-interceptor config
2. Find the debug message in the [Debug Messages Guide](/diagrams/debug-messages)
3. Follow the corresponding flow in the detailed interceptor diagrams
4. Understand what conditions led to that path

## Color Legend

- **Green**: Success paths, cached responses, good outcomes
- **Yellow**: Debug messages, information, warnings
- **Orange**: Stale data, partial success
- **Red**: Errors, cache rejections, failures
- **Blue**: Process steps, data flow, decisions
