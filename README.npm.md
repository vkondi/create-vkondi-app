# create-scaffold-kit

Scaffold opinionated **React** or **Next.js** applications with best practices baked in, TypeScript, ESLint, Prettier, Vitest, Tailwind, Docker, and GitHub Actions, all configured out of the box.

## Quick Start

```bash
# npm
npx create-scaffold-kit my-app

# yarn
yarn create scaffold-kit my-app

# pnpm
pnpm create scaffold-kit my-app
```

Then follow the interactive prompts to configure your project.

## Features

| Category | Options |
|---|---|
| **Frameworks** | React (Vite), Next.js (App Router) |
| **Language** | TypeScript, JavaScript |
| **Linting** | ESLint (strict/standard), Oxlint, or none |
| **Formatting** | Prettier, Oxfmt, or none |
| **Testing** | Vitest + React Testing Library, Jest, or none |
| **Styling** | Tailwind CSS (optional) |
| **DevOps** | Docker multi-stage builds, GitHub Actions CI/CD |
| **Git hooks** | Husky + lint-staged (optional) |

## What You Get

### React (Vite)
- Feature-based folder structure (`src/features/`, `src/components/`, `src/hooks/`)
- Path aliases (`@/` → `src/`)
- Strict TypeScript config
- Vitest with React Testing Library pre-configured

### Next.js
- App Router with React Server Components
- Security headers pre-configured
- Absolute imports (`@/` → `src/`)
- Optimized production builds

## CLI Options

Run with a project name to skip the name prompt:

```bash
npx create-scaffold-kit my-app
```

Run without arguments for a fully interactive setup:

```bash
npx create-scaffold-kit
```

## Requirements

- Node.js 18+
- npm, Yarn, or pnpm
- Git (optional)
- Docker (optional, for Docker feature)

## Package Manager Support

Works with npm, Yarn (1.x and 3+), and pnpm. The CLI automatically detects your package manager and uses the correct commands.

## License

[MIT](https://github.com/vkondi/create-scaffold-kit/blob/main/LICENSE)
