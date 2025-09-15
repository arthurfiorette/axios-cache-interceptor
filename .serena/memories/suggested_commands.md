# Suggested Commands

## Development Commands

### Code Quality

- `pnpm lint` - Check code quality with Biome
- `pnpm lint-fix` - Fix code quality issues with Biome (including unsafe fixes)
- `pnpm lint-ci` - Run linting for CI (strict mode)
- `pnpm format` - Format code with Biome

### Testing

- `pnpm test` - Run all tests with coverage (using Node.js test runner + c8)
- `pnpm test:only` - Run only tests marked with `test.only`
- `pnpm test:types` - Run TypeScript type checking

### Building

- `pnpm build` - Build the project (runs build.sh script)
- `bash build.sh` - Direct build script execution

### Documentation

- `pnpm docs:dev` - Start development documentation server (port 1227)
- `pnpm docs:build` - Build documentation
- `pnpm docs:serve` - Serve built documentation

### Other

- `pnpm benchmark` - Run performance benchmarks
- `pnpm version` - Update version and changelog

## Build Outputs

- `dist/` - Production builds (multiple formats: ESM, CJS, Modern, UMD)
- `dev/` - Development builds with debug information
- Both include TypeScript declaration files

## Package Manager

- Uses **pnpm** as the package manager
- Version: 9.1.1 (specified in packageManager field)

## Node Version

- Minimum: Node.js >=12
- Uses `.nvmrc` for version specification
