# Publishing to npm

## Prerequisites

- npm account ([Sign up](https://www.npmjs.com/signup))
- Access rights if publishing under an organization
- Package name available on npm registry

## Pre-Publication Checklist

### 1. Verify Package Metadata

Confirm `package.json` contains accurate values:
```json
{
  "name": "create-scaffold-kit",
  "version": "1.0.0",
  "description": "Scaffold opinionated React or Next.js applications",
  "type": "module",
  "bin": {
    "create-scaffold-kit": "./dist/index.js"
  },
  "files": [
    "dist"
  ],
  "license": "MIT",
  "engines": {
    "node": ">=18.0.0"
  },
  "author": "Vishwajeet Kondi <vishdevwork@gmail.com>",
  "repository": {
    "type": "git",
    "url": "https://github.com/vkondi/create-scaffold-kit"
  },
  "keywords": [
    "cli",
    "scaffold",
    "react",
    "nextjs",
    "vite",
    "typescript"
  ]
}
```

### 2. Verify .npmignore

Ensure unnecessary files are excluded. Current `.npmignore`:
```
src
node_modules
*.log
.DS_Store
.env
.env.local
coverage
.turbo
tsconfig.json
tsup.config.ts
vitest.config.ts
.eslintrc.json
.prettierrc.json
.release-it.json
CONTRIBUTING.md
.git
.github
*.md
!README.md
!LICENSE
```

> **Note:** The `files` field in `package.json` acts as a whitelist — only `dist/` and required files (e.g. `package.json`, `README.md`, `LICENSE`) are included in the published package. The `.npmignore` provides additional exclusions as a safety net.

### 3. README Swap (Automatic)

The package maintains two separate README files:

| File | Purpose |
|---|---|
| `README.md` | Shown on GitHub — includes architecture details, development setup, and links to `docs/` |
| `README.npm.md` | Shown on npm — user-focused: install commands, features table, CLI options |

The swap happens automatically via npm lifecycle hooks — no manual steps required:

1. **`prepack`** (`scripts/prepack.cjs`) — backs up `README.md` → `README.github.md`, copies `README.npm.md` → `README.md`
2. Tarball is created with the npm README as `README.md`
3. **`postpack`** (`scripts/postpack.cjs`) — restores `README.md` from `README.github.md`, deletes the backup

> `README.github.md` is listed in `.gitignore` so it is never accidentally committed.

### 4. Build the Package

The `prepublishOnly` script automatically runs type-checking, linting, tests, and a build before each publish. To build manually:

```bash
yarn build
```

Verify `dist/` contains:
- `index.js` (ESM format)
- `index.d.ts` (type declarations)
- `index.js.map` (sourcemap)

### 4. Test Locally

```bash
# Register the package globally from the package directory
yarn link

# Test in a temp directory
cd /tmp
yarn link create-scaffold-kit
create-scaffold-kit test-app

# Unlink when done (run in the temp/consumer directory)
yarn unlink create-scaffold-kit

# Unregister globally (run in the package directory)
yarn unlink
```

### 5. Verify Package Contents

```bash
yarn pack --dry-run
```

Review listed files to ensure nothing sensitive is included. Confirm `README.md` in the listing reflects the npm-specific content (the swap is applied during `pack`).

## Publishing

### First Time Setup

```bash
yarn login
# Enter username, password, email
```

### Dry Run

```bash
yarn publish --dry-run
```

Review output for warnings or errors.

### Publish

```bash
yarn publish
```

> **Note:** Running `yarn publish` automatically triggers the `prepublishOnly` script, which runs type-checking, linting, all tests, and a fresh build before uploading.

For scoped packages:
```bash
yarn publish --access public
```

## Post-Publication

### Verify Installation

```bash
npx create-scaffold-kit@latest test-verify
```

### Update GitHub Release

Create matching GitHub release (see [GITHUB_PUBLISH.md](./GITHUB_PUBLISH.md))

## Version Updates

Follow [Semantic Versioning](https://semver.org/).

`CHANGELOG.md` is automatically generated from [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `chore:`, `docs:`, etc.) via `release-it`.

**Patch (1.0.x)**: Bug fixes
```bash
yarn release:patch
```

**Minor (1.x.0)**: New features, backward compatible
```bash
yarn release:minor
```

**Major (x.0.0)**: Breaking changes
```bash
yarn release:major
```

Or run interactively (prompts for version bump type):
```bash
yarn release
```

Each command will:
1. Parse commits since the last tag
2. Update `CHANGELOG.md`
3. Bump `version` in `package.json`
4. Create a git commit and tag

After the release commit is created, publish to npm:
```bash
yarn publish
```

## Troubleshooting

**Package name taken:**
- Choose different name
- Or use scoped package: `@username/create-scaffold-kit`

**Authentication failed:**
```bash
yarn logout
yarn login
```

**Package not found after publish:**
- Wait 1-2 minutes for propagation
- Check npm status: https://status.npmjs.org/

**Unpublish (use carefully):**
```bash
# Only within 72 hours of publish
npm unpublish create-scaffold-kit@1.0.0
```

## Best Practices

- Always test before publishing
- Keep README.md updated
- Document breaking changes in CHANGELOG.md before each release
- Use pre-release versions for testing (`1.0.0-beta.1`)
- Never publish with uncommitted changes
