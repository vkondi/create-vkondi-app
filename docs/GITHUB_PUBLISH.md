# Publishing GitHub Releases

## Prerequisites

- Git repository on GitHub
- Maintainer access to repository
- Changes committed and pushed

## Release Workflow

### 1. Update Version

Bump version in `package.json`:
```bash
npm version patch  # or minor, major
```

This creates a git tag automatically.

### 2. Update CHANGELOG.md

Add new version section:
```markdown
## [1.0.1] - 2026-02-15

### Fixed
- Bug in ESLint configuration

### Added
- New framework support
```

### 3. Commit and Push

```bash
git add CHANGELOG.md package.json
git commit -m "chore: bump version to 1.0.1"
git push origin main
git push --tags
```

### 4. Create GitHub Release

#### Via GitHub UI

1. Go to repository → Releases → "Draft a new release"
2. Choose tag: `v1.0.1`
3. Title: `v1.0.1`
4. Description: Copy from CHANGELOG.md
5. Attach assets if applicable
6. Click "Publish release"

#### Via GitHub CLI

```bash
gh release create v1.0.1 \
  --title "v1.0.1" \
  --notes-file RELEASE_NOTES.md
```

### 5. Verify Release

Check:
- Release appears on GitHub
- Tag is correct
- Notes are accurate
- Links work

## Release Notes Template

Create `RELEASE_NOTES.md` for each release:

```markdown
## What's New

Brief description of major changes.

## Breaking Changes

- List any breaking changes
- Migration instructions

## Features

- New feature 1
- New feature 2

## Bug Fixes

- Fix description 1
- Fix description 2

## Installation

\`\`\`bash
npx create-vkondi-app@latest my-app
\`\`\`

## Full Changelog

[View all changes](https://github.com/user/repo/compare/v1.0.0...v1.0.1)
```

## Pre-Release Versions

For beta testing:

```bash
npm version 1.1.0-beta.1
git push --tags
gh release create v1.1.0-beta.1 --prerelease
```

## Automated Releases

### GitHub Actions

Create `.github/workflows/release.yml`:

```yaml
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Create Release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: ${{ github.ref }}
          release_name: ${{ github.ref }}
          draft: false
          prerelease: false
```

## Best Practices

- Match npm and GitHub versions
- Always update CHANGELOG.md first
- Test thoroughly before releasing
- Write clear, user-focused release notes
- Link to documentation for new features
- Use semantic versioning
- Tag pre-releases appropriately

## Troubleshooting

**Tag already exists:**
```bash
git tag -d v1.0.1
git push origin :refs/tags/v1.0.1
```

**Delete release:**
```bash
gh release delete v1.0.1
```

**Edit release:**
```bash
gh release edit v1.0.1 --notes "New notes"
```
