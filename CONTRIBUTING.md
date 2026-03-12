# Contributing

Thank you for your interest in contributing!

## Quick Start

```bash
git clone <repository-url>
cd create-vkondi-app
yarn install
yarn build
yarn link
```

Test locally:
```bash
cd /tmp
create-vkondi-app test-app
```

For detailed architecture, patterns, and development guidelines, see [Developer Guide](docs/DEVELOPER_GUIDE.md).

## Project Structure

See [Developer Guide](docs/DEVELOPER_GUIDE.md) for source code organization and module responsibilities.

## Core Principles

**Modularity:** Each feature is isolated and self-contained

**Single Responsibility:** Functions do one thing well

**Type Safety:** Full TypeScript with strict mode

**Explicit Over Implicit:** Clear, readable code

See [Developer Guide](docs/DEVELOPER_GUIDE.md) for detailed architecture information.

## Development Workflow

```bash
yarn dev           # Watch mode
yarn build         # Production build
yarn type-check    # TypeScript validation
yarn lint          # Code linting
yarn format        # Code formatting
```

## Code Style

- TypeScript strict mode
- Named exports only (no default exports)
- Async/await (no callbacks)
- Functions under 50 lines
- Descriptive variable names
- Explicit error handling

## Adding Features

See [Developer Guide - Extending the CLI](docs/DEVELOPER_GUIDE.md#extending-the-cli) for:
- Feature module templates
- Adding new frameworks
- Integration patterns
- Code examples

## Testing

```bash
# Build and link
yarn build
yarn link

# Test in temp directory
cd /tmp
create-vkondi-app test-project

# Verify generated project
cd test-project
yarn install
yarn lint
yarn type-check
yarn test
yarn build
yarn dev
```

## Pull Request Process

1. Fork and create feature branch
2. Make changes following code style
3. Test thoroughly
4. Commit with clear messages (see below)
5. Open PR with description and test results

## Commit Messages

- `Add:` New features
- `Fix:` Bug fixes
- `Update:` Changes to existing features
- `Refactor:` Code improvements
- `Docs:` Documentation updates

Examples:
```
Add: Tailwind CSS feature module
Fix: ESLint config for Next.js
Update: Vitest configuration
Docs: Update contribution guidelines
```

## Before Committing

```bash
yarn build
yarn type-check
yarn lint
yarn format
```

Test generated project in temp directory.

## Publishing

See [NPM Publishing](docs/NPM_PUBLISH.md) and [GitHub Publishing](docs/GITHUB_PUBLISH.md).

## Resources

- [Developer Guide](docs/DEVELOPER_GUIDE.md) - Architecture and patterns
- [Documentation Guidelines](docs/DOCUMENTATION_GUIDELINES.md) - Documentation standards

## Questions

Open an issue for bug reports, feature requests, or help with contributing.
