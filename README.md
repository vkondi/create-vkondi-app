# create-vkondi-app

Scaffold opinionated React (Vite) or Next.js applications with best practices baked in.

## Table of Contents

- [Features](#features)
- [Quick Start](#quick-start)
- [What You Get](#what-you-get)
- [Requirements](#requirements)
- [User Guide](docs/USER_GUIDE.md)
- [Developer Guide](docs/DEVELOPER_GUIDE.md)
- [Publishing & Releases](#publishing--releases)
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
npx create-vkondi-app my-app
cd my-app
yarn install
yarn dev
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
- Yarn 3+ (npm and pnpm also supported)
- Git (optional)
- Docker (optional)

## Publishing & Releases

- [NPM Publishing](docs/NPM_PUBLISH.md) - Publish to npm registry
- [GitHub Publishing](docs/GITHUB_PUBLISH.md) - Create GitHub releases

## Contributing

See [Contributing](CONTRIBUTING.md) for development guidelines and setup.

## License

[MIT](LICENSE)

---

Built for developers who refuse to compromise on clean code.
