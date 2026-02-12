# Documentation Guidelines

## Purpose

This document defines standards and principles for all documentation in this project.

## Core Principles

### 1. Single Purpose

Each document must have ONE clear purpose and strictly adhere to it. No exceptions.

**Defined Documents:**
- **README.md** - Project overview and quick start
- **CONTRIBUTING.md** - Contribution process and expectations
- **CHANGELOG.md** - Version history and changes
- **LICENSE** - Legal license
- **USER_GUIDE.md** - End-user instruction and examples
- **DEVELOPER_GUIDE.md** - Architecture and implementation details
- **NPM_PUBLISH.md** - Publishing to npm registry only
- **GITHUB_PUBLISH.md** - GitHub releases only

**Anti-pattern:** Documents like "BUILD_SUMMARY", "ARCHITECTURE_OVERVIEW", or "GENERAL_INFO" that try to be everything end up being useful to no one.

### 2. Lean and Precise

- Get to point immediately
- Remove unnecessary explanations
- Use concise language
- Eliminate every redundancy
- One piece of information = one location only

### 3. Strategic Placement

- **Root level:** Only essential files (README, LICENSE, CHANGELOG, CONTRIBUTING)
- **docs/ folder:** All other documentation

### 4. Zero Redundancy

Information must exist in exactly one place.

**Rule:** If information exists in another document, LINK to it, never repeat.

**Violation Example:** CONTRIBUTING.md having "Adding a New Feature" with code examples when DEVELOPER_GUIDE.md already has this. Solution: Link to DEVELOPER_GUIDE.md.

### 5. Minimal Icons

- No decorative icons
- Maximum 2-3 per document only when absolutely necessary for visual distinction
- Professional, clean appearance required

## Document Structure

### Headers

- Clear, descriptive headers
- Indicate section purpose immediately

### Code Examples

- Working, tested examples only
- Minimal comments
- Show output when relevant

### Links

- Relative links for internal docs
- Absolute links for external resources
- Deep link to specific sections when possible

## Maintenance

When adding or changing documentation:

1. Verify it doesn't duplicate existing content
2. Check it has a single clear purpose
3. Ensure proper placement (root vs docs/)
4. Remove unnecessary verbosity
5. Limit icons to < 3 per document
6. Update all related links

## Quality Checklist

Before committing:

- [ ] Has single, clear purpose
- [ ] No redundant information (link instead)
- [ ] Concise and to the point
- [ ] Minimal icons (if any)
- [ ] Correct placement
- [ ] All links work
- [ ] Code examples tested

## Common Issues

**Issue:** Documents that don't belong (BUILD_SUMMARY, PROJECT_STATUS, etc.)  
**Solution:** Merge content into appropriate guide or delete. No "catch-all" documents.

**Issue:** Project Structure listed in multiple docs  
**Solution:** Keep only in DEVELOPER_GUIDE.md. Link from others.

**Issue:** Contributing instructions in multiple places  
**Solution:** Single source in DEVELOPER_GUIDE.md. Link from CONTRIBUTING.md.

**Issue:** Too many icons/emojis  
**Solution:** Remove all but 2-3 essential ones

