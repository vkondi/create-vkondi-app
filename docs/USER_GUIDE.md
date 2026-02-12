# User Guide

## Installation

No installation needed. Use `npx`:

```bash
npx create-vkondi-app my-app
```

Or with specific package manager:
```bash
npm create vkondi-app my-app
pnpm create vkondi-app my-app
yarn create vkondi-app my-app
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
npm install
npm run dev
```

### Available Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Lint code
npm run format       # Format code
npm run type-check   # Check TypeScript
npm run test         # Run tests
npm run test:ui      # Interactive test UI
npm run test:coverage # Coverage report
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
npm install -g vercel
vercel
```

**Netlify (React):**
```bash
npm run build
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
npm run dev -- --port 5174

# Next.js
npm run dev -- -p 3001
```

**Dependencies error:**
```bash
rm -rf node_modules package-lock.json
npm install
```

**ESLint errors:**
```bash
npm run lint:fix
```

**TypeScript errors:**
```bash
npm run type-check
```

## Adding Libraries

**State Management:**
```bash
npm install zustand
```

**Data Fetching:**
```bash
npm install @tanstack/react-query
```

**Routing (React only):**
```bash
npm install react-router-dom
```

**Validation:**
```bash
npm install zod
```

## Getting Help

- Generated README in your project
- GitHub issues for bugs
- Include versions when reporting:
  - Node: `node --version`
  - Package manager: `npm --version`
  - CLI: `create-vkondi-app --version`
