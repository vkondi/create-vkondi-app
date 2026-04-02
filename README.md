# create-scaffold-kit

Scaffold opinionated React (Vite) or Next.js applications with best practices baked in.

## Table of Contents

- [Features](#features)
- [Quick Start](#quick-start)
- [What You Get](#what-you-get)
- [Requirements](#requirements)
- [Development & Testing](#development--testing)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [License](#license)

## Features

**Frameworks:** React (Vite), Next.js (App Router)

**Development:** TypeScript, ESLint (strict/standard), Prettier, Husky + lint-staged

**Testing:** Vitest with React Testing Library, coverage reporting

**Styling:** Tailwind CSS (optional)

**DevOps:** Docker, GitHub Actions CI/CD

## Quick Start

```bash
npx create-scaffold-kit my-app
cd my-app

# then install and start with your package manager
npm install && npm run dev
# or: yarn install && yarn dev
# or: pnpm install && pnpm dev
```

For detailed usage, configuration options, and examples, see [User Guide](docs/USER_GUIDE.md)

## What You Get

**React (Vite):** Lightning-fast HMR, feature-based structure, path aliases, strict TypeScript

**Next.js:** App Router with RSC, security headers, absolute imports, optimized builds

**Development Tools:** ESLint (flat config, import ordering), Prettier, Husky + lint-staged

**Testing:** Vitest, React Testing Library, coverage, interactive UI

**CI/CD:** GitHub Actions with multi-version testing, type checking, linting

**Docker:** Multi-stage builds, production-ready images

## Requirements

- Node.js 18+
- npm, Yarn, or pnpm
- Git (optional)
- Docker (optional)

## Development & Testing

### Development Setup

```bash
# Install dependencies
yarn install

# Start development (watch mode)
yarn dev

# Type checking
yarn type-check

# Linting
yarn lint

# Formatting
yarn format
```

### Testing

This project includes comprehensive unit tests using **Vitest**:

```bash
# Run all tests once
yarn test:run

# Run tests in watch mode
yarn test:watch

# View interactive test UI
yarn test:ui

# Generate coverage report
yarn test:coverage
```

**Test Coverage:**
- File utilities (100%)
- Package.json manipulation (100%)
- Logging system (95%)
- User prompts (85%+)
- Installation utilities (90%+)

For detailed testing information, see [Testing Guide](docs/TESTING_GUIDE.md)

## Documentation

- [User Guide](docs/USER_GUIDE.md) - How to use create-scaffold-kit
- [Developer Guide](docs/DEVELOPER_GUIDE.md) - Architecture and extending the CLI
- [Testing Guide](docs/TESTING_GUIDE.md) - Running and writing tests
- [NPM Publishing](docs/NPM_PUBLISH.md) - Publish to npm registry
- [GitHub Publishing](docs/GITHUB_PUBLISH.md) - Create GitHub releases

## Contributing

See [Contributing](CONTRIBUTING.md) for development guidelines and setup.

## License

[MIT](LICENSE)

---

Built for developers who refuse to compromise on clean code.
