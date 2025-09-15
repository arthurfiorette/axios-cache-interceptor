# Code Style and Conventions

## Language and Configuration

- **TypeScript**: Strict mode enabled with comprehensive type checking
- **Module System**: ESNext with NodeNext module resolution
- **Target**: ESNext for modern JavaScript features

## Code Quality Tools

- **Biome**: Used for linting, formatting, and code quality
  - Configuration extends `@arthurfiorette/biomejs-config`
  - Excludes build directories, dist, dev, coverage, node_modules
- **TypeScript**: Strict configuration with all strict flags enabled

## TypeScript Configuration Highlights

- `strict: true` - All strict type checking enabled
- `noImplicitAny: true`
- `strictNullChecks: true`
- `noUnusedLocals: true`
- `noUnusedParameters: true`
- `noImplicitReturns: true`
- `noUncheckedIndexedAccess: true`
- `verbatimModuleSyntax: true`

## File Structure Conventions

- Use `.ts` extensions for TypeScript files
- Use `.js` extensions in import statements (for ESM compatibility)
- Mirror test file structure with source files
- Use kebab-case for file names when multiple words

## Import/Export Conventions

- Use named exports primarily
- Main `index.ts` re-exports all public APIs
- Use `.js` extensions in imports (transpiled to correct format)

## Development Build Support

- Uses `__ACI_DEV__` global constant for development-specific code
- Development builds include console warnings
- Production builds strip development code

## Code Organization

- Modular architecture with clear separation of concerns
- Each module has its own directory with related types
- Utilities are separated into dedicated util modules
