# User Guide

## Installation

No installation needed. Use `npx`:

```bash
npx create-vkondi-app my-app
```

Or with specific package manager:
```bash
yarn create vkondi-app my-app
npm create vkondi-app my-app
pnpm create vkondi-app my-app
```

## Basic Usage

### Interactive Mode

```bash
npx create-vkondi-app
```

Follow the prompts to configure your project.

### With Project Name

```bash
npx create-vkondi-app my-app
```

## Configuration Options

**Framework:**
- React (Vite) - Fast, modern React setup
- Next.js - Full-stack React framework

**TypeScript:** Recommended for larger projects

**Tailwind CSS:** Utility-first styling

**Vitest:** Testing framework with React Testing Library

**Linting:**
- Strict - No default exports, stricter rules
- Standard - Balanced linting

**GitHub Actions:** CI/CD workflow

**Docker:** Container setup

## After Creation

Navigate to project:
```bash
cd my-app
yarn install
yarn dev
```

### Available Commands

```bash
yarn dev             # Start development server
yarn build           # Build for production
yarn preview         # Preview production build
yarn lint            # Lint code
yarn format          # Format code
yarn type-check      # Check TypeScript
yarn test            # Run tests
yarn test:ui         # Interactive test UI
yarn test:coverage   # Coverage report
```

## Environment Variables

### React (Vite)

Create `.env`:
```
VITE_API_URL=http://localhost:5000
```

Use in code:
```typescript
const apiUrl = import.meta.env.VITE_API_URL;
```

### Next.js

Create `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:5000
API_SECRET=secret-key
```

```typescript
// Client-side
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

// Server-side only
const secret = process.env.API_SECRET;
```

## Docker Usage

If Docker was selected:

```bash
# Build image
docker build -t my-app .

# Run container
docker run -p 80:80 my-app
```

## Deployment

**Vercel (Next.js):**
```bash
yarn global add vercel
vercel
```

**Netlify (React):**
```bash
yarn build
# Upload dist/ folder to Netlify
```

**Docker:**
```bash
docker build -t my-app:latest .
docker push registry/my-app:latest
```

## Troubleshooting

**Port in use:**
```bash
# Vite
yarn dev --port 5174

# Next.js
yarn dev -p 3001
```

**Dependencies error:**
```bash
rm -rf node_modules yarn.lock
yarn install
```

**ESLint errors:**
```bash
yarn lint:fix
```

**TypeScript errors:**
```bash
yarn type-check
```

## Adding Libraries

**State Management:**
```bash
yarn add zustand
```

**Data Fetching:**
```bash
yarn add @tanstack/react-query
```

**Routing (React only):**
```bash
yarn add react-router-dom
```

**Validation:**
```bash
yarn add zod
```

## Getting Help

- Generated README in your project
- GitHub issues for bugs
- Include versions when reporting:
  - Node: `node --version`
  - Yarn: `yarn --version`
  - CLI: `create-vkondi-app --version`
