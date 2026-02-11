# Task Completion Workflow

## Commands to Run After Completing Tasks

### Code Quality Checks (Required)

1. `pnpm lint` - Check for linting issues
2. `pnpm lint-fix` - Auto-fix linting issues (if needed)
3. `pnpm test:types` - Verify TypeScript type checking passes

### Testing (Required)

4. `pnpm test` - Run all tests with coverage to ensure nothing is broken

### Build Verification (When Applicable)

5. `pnpm build` - Verify the build process works correctly (when changes affect build)

### Documentation (When Applicable)

6. `pnpm docs:build` - Verify documentation builds correctly (when docs are modified)

## Workflow Order

1. **First**: Fix any linting issues with `pnpm lint-fix`
2. **Second**: Ensure types are correct with `pnpm test:types`
3. **Third**: Run tests to verify functionality with `pnpm test`
4. **Fourth**: Build if necessary with `pnpm build`
5. **Finally**: Check documentation builds if docs were modified

## Pre-commit Considerations

- The project uses strict TypeScript configuration
- All tests must pass
- Code must pass linting
- Type checking must pass
- Build must succeed for production releases

## Development vs Production

- Development builds include debug information via `__ACI_DEV__` flag
- Production builds strip debug code for optimal performance
- Both are built simultaneously by the build script
- Import from `/dev` for debugging: `import { setupCache } from 'axios-cache-interceptor/dev'`

## Debugging Tips

### Enable Debug Logging

```typescript
import { setupCache } from 'axios-cache-interceptor/dev';

const axios = setupCache(instance, {
  debug: console.log // or custom logger
});
```

### Debug Output Shows:

- Cache hits/misses
- Concurrent request handling
- Header interpretation decisions
- Vary mismatch detection
- Error handling paths
- Storage state transitions

### Running Specific Tests

```bash
# Run only one test file
pnpm test -- test/interceptors/vary.test.ts

# Run tests marked with .only
pnpm test:only
```

## Common Issues and Solutions

### Cache Not Working

1. Check if method in `cache.methods` (default: ['get', 'head'])
2. Verify status code passes `cachePredicate.statusCheck`
3. Check if server headers say "don't cache" (enable debug)
4. Verify URL not in `ignoreUrls`

### Unexpected Cache Behavior

1. Enable debug logging to see decision flow
2. Check if `interpretHeader` is interfering
3. Verify vary headers are correct
4. Look for custom `cachePredicate` logic

### Memory Leaks

1. Check if `cleanupInterval` is disabled
2. Verify `maxEntries` is set appropriately
3. Check `maxStaleAge` for stale entry cleanup
4. Consider persistent storage for long-running processes

## Testing New Features

### Pattern for New Tests

1. Add test to appropriate `test/` file
2. Cover normal case + edge cases
3. Test concurrent scenarios if relevant
4. Validate storage state transitions
5. Ensure cleanup (no memory leaks)

### Running Tests After Changes

```bash
# Run all tests (required)
pnpm test

# Check coverage report (should be >99%)
# Opens coverage/lcov-report/index.html
```
