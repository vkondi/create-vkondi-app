# Publishing to npm

## Prerequisites

- npm account ([Sign up](https://www.npmjs.com/signup))
- Access rights if publishing under an organization
- Package name available on npm registry

## Pre-Publication Checklist

### 1. Update Package Metadata

Edit `package.json`:
```json
{
  "name": "create-vkondi-app",
  "version": "1.0.0",
  "description": "Scaffold opinionated React or Next.js applications",
  "author": "Your Name <email@example.com>",
  "repository": {
    "type": "git",
    "url": "https://github.com/yourusername/create-vkondi-app"
  },
  "keywords": [
    "cli",
    "scaffold",
    "react",
    "nextjs",
    "vite",
    "typescript",
    "boilerplate"
  ]
}
```

### 2. Verify .npmignore

Ensure unnecessary files are excluded:
```
node_modules/
src/
*.log
.DS_Store
tsconfig.json
tsup.config.ts
.github/
docs/
*.md
!README.md
```

### 3. Build the Package

```bash
npm run build
```

Verify `dist/` contains:
- `index.js` (or `index.cjs`)
- Type declarations if applicable

### 4. Test Locally

```bash
# Link globally
npm link

# Test in temp directory
cd /tmp
create-vkondi-app test-app

# Unlink when done
npm unlink -g create-vkondi-app
```

### 5. Verify Package Contents

```bash
npm pack --dry-run
```

Review listed files to ensure nothing sensitive is included.

## Publishing

### First Time Setup

```bash
npm login
# Enter username, password, email
```

### Dry Run

```bash
npm publish --dry-run
```

Review output for warnings or errors.

### Publish

```bash
npm publish
```

For scoped packages:
```bash
npm publish --access public
```

## Post-Publication

### Verify Installation

```bash
npx create-vkondi-app@latest test-verify
```

### Update GitHub Release

Create matching GitHub release (see [GITHUB_PUBLISH.md](./GITHUB_PUBLISH.md))

## Version Updates

Follow [Semantic Versioning](https://semver.org/):

**Patch (1.0.x)**: Bug fixes
```bash
npm version patch
npm publish
```

**Minor (1.x.0)**: New features, backward compatible
```bash
npm version minor
npm publish
```

**Major (x.0.0)**: Breaking changes
```bash
npm version major
npm publish
```

Update `CHANGELOG.md` before each release.

## Troubleshooting

**Package name taken:**
- Choose different name
- Or use scoped package: `@username/create-vkondi-app`

**Authentication failed:**
```bash
npm logout
npm login
```

**Package not found after publish:**
- Wait 1-2 minutes for propagation
- Check npm status: https://status.npmjs.org/

**Unpublish (use carefully):**
```bash
# Only within 72 hours of publish
npm unpublish create-vkondi-app@1.0.0
```

## Best Practices

- Always test before publishing
- Keep README.md updated
- Document breaking changes
- Use pre-release versions for testing (`1.0.0-beta.1`)
- Never publish with uncommitted changes
