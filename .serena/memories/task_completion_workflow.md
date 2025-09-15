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
