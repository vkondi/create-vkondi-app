# Developer Guide

## Architecture

### Design Principles

**Modularity:** Each feature is isolated and self-contained

**Single Responsibility:** Functions do one thing well

**Type Safety:** Full TypeScript with strict mode

**Extensibility:** Easy to add frameworks and features

### Module Responsibilities

**Scaffold:** Create base framework structure

**Features:** Add isolated, optional functionality

**Utils:** Provide shared functionality

### Data Flow

1. User Input → prompts.ts
2. Context Creation → ProjectContext object
3. Scaffolding → Framework setup
4. Feature Installation → Conditional modules
5. Dependency Installation → Package manager
6. Git Initialization → Repository setup
7. Success Message → Next steps

### Type System

```typescript
interface ProjectContext {
  projectName: string;
  projectPath: string;
  framework: 'react' | 'next';
  typescript: boolean;
  tailwind: boolean;
  testing: 'vitest' | 'none';
  lintingMode: 'strict' | 'standard';
  githubActions: boolean;
  docker: boolean;
  packageManager: 'npm' | 'yarn' | 'pnpm';
}
```

## Development Setup

### Prerequisites

- Node.js 18+
- Yarn 3+ (npm and pnpm also supported)
- Git

### Initial Setup

```bash
git clone <repository-url>
cd create-vkondi-app
yarn install
yarn build
yarn link
```

### Development Workflow

```bash
# Watch mode (auto-rebuild)
yarn dev

# Production build
yarn build

# Type check
yarn type-check

# Lint
yarn lint

# Format
yarn format
```

### Testing Changes

```bash
# Build
yarn build

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

## Code Patterns

### Feature Module Template

```typescript
import type { ProjectContext } from '../context.js';
import { logger } from '../utils/logger.js';
import { addDevDependencies, addScripts } from '../utils/packageJson.js';
import { writeFile } from '../utils/file.js';

export async function setupMyFeature(context: ProjectContext): Promise<void> {
  logger.step('Setting up My Feature...');
  
  try {
    // 1. Install dependencies
    await addDevDependencies(context.projectPath, [
      'my-package@^1.0.0'
    ]);
    
    // 2. Create config
    await writeFile(
      `${context.projectPath}/my.config.js`,
      'export default { /* config */ }'
    );
    
    // 3. Add scripts
    await addScripts(context.projectPath, {
      'my-script': 'my-command'
    });
    
    logger.success('My Feature configured');
  } catch (error) {
    logger.error('Failed to setup My Feature');
    throw error;
  }
}
```

### Error Handling

```typescript
try {
  await riskyOperation();
} catch (error) {
  logger.error('Operation failed');
  throw error; // Re-throw to stop execution
}
```

### Logging

```typescript
logger.step('Starting task...');    // Blue, ongoing
logger.success('Task complete');    // Green, success
logger.error('Task failed');        // Red, error
logger.info('Additional info');     // Gray, info
```

## Extending the CLI

### Adding a New Feature

1. Create feature module:

```typescript
// src/features/my-feature.ts
export async function setupMyFeature(context: ProjectContext): Promise<void> {
  // Implementation
}
```

2. Update context if needed:

```typescript
// src/context.ts
export interface ProjectContext {
  myFeature: boolean; // Add this
}
```

3. Add prompt:

```typescript
// src/prompts.ts
{
  type: 'confirm',
  name: 'myFeature',
  message: 'Add My Feature?',
  initial: false
}
```

4. Integrate in main flow:

```typescript
// src/index.ts
import { setupMyFeature } from './features/my-feature.js';

if (context.myFeature) {
  await setupMyFeature(context);
}
```

### Adding a New Framework

1. Create scaffold module:

```typescript
// src/scaffold/my-framework.ts
export async function scaffoldMyFramework(context: ProjectContext): Promise<void> {
  // Execute framework CLI
  // Set up folder structure
  // Configure TypeScript
  // etc.
}
```

2. Update ProjectContext type

3. Add to prompts choices

4. Integrate in index.ts

## Contribution Guidelines

### Code Style

- TypeScript strict mode
- Named exports only
- Async/await (no callbacks)
- Functions under 50 lines
- Descriptive variable names
- Explicit error handling

### Before Committing

```bash
yarn build
yarn type-check
yarn lint
yarn format
yarn test:run
```

Test generated project works correctly.

## Testing

For comprehensive testing documentation including running tests, writing new tests, mocking strategies, coverage goals, and troubleshooting, see [TESTING_GUIDE.md](TESTING_GUIDE.md).

Quick commands:

```bash
yarn test:run        # Run all tests once
yarn test:watch      # Auto-rerun on changes
yarn test:ui         # Interactive UI dashboard
yarn test:coverage   # Generate coverage report
```

## Code Organization Rules

### Modularity Rules

Each feature module must be:
- Completely isolated
- Self-contained
- No interdependencies
- Independently testable

Example of what NOT to do:

```typescript
// ❌ Bad: Feature depends on another
export async function setupESLint(context: ProjectContext): Promise<void> {
  await setupPrettier(context); // Don't do this
}
```

### File Operations

Use utility functions:

```typescript
import { writeFile, readJSON, writeJSON } from '../utils/file.js';

// Write file
await writeFile(path, content);

// Read JSON
const data = await readJSON<T>(path);

// Write JSON
await writeJSON(path, data);
```

### Package.json Manipulation

Use type-safe utilities:

```typescript
import { addDevDependencies, addScripts } from '../utils/packageJson.js';

await addDevDependencies(projectPath, ['package@1.0.0']);
await addScripts(projectPath, { 'script-name': 'command' });
```

## Testing

### Local Testing

1. Build and link:
```bash
yarn build
yarn link
```

2. Create test project:
```bash
cd /tmp
create-vkondi-app test-app
```

3. Verify:
```bash
cd test-app
yarn install
yarn dev
yarn build
yarn test
```

### Test All Scenarios

- [ ] React + TypeScript + all features
- [ ] Next.js + JavaScript + minimal features
- [ ] Strict vs Standard linting
- [ ] With/without Tailwind
- [ ] With/without Vitest
- [ ] With/without Docker
- [ ] With/without GitHub Actions

## Building and Publishing

See [NPM_PUBLISH.md](./NPM_PUBLISH.md) and [GITHUB_PUBLISH.md](./GITHUB_PUBLISH.md).

## Debugging

### Enable Verbose Logging

Modify logger.ts to add debug output.

### Test Specific Features

Comment out other features in index.ts to isolate.

### Inspect Generated Files

Examine output in generated project directory.

## Future Extensibility

### Planned Commands

```typescript
// vkondi add <feature>
program
  .command('add <feature>')
  .description('Add feature to existing project')
  .action(async (feature) => {
    // Implementation
  });
```

### Plugin System

Future architecture for third-party plugins:

```typescript
interface Plugin {
  name: string;
  setup: (context: ProjectContext) => Promise<void>;
}
```

## Performance

**Fast Startup:** Minimal dependencies, lazy imports

**Optimized Output:** Tree-shaken builds, small bundle

**Parallel Operations:** Where safe

## Security

**Path Validation:** Verify paths before operations

**Overwrite Confirmations:** Prevent accidental data loss

**Safe Defaults:** Secure configurations

**Dependency Updates:** Regular security patches

## Troubleshooting

**Command not found:**
```bash
yarn unlink -g create-vkondi-app
yarn link
```

**Build errors:**
```bash
rm -rf node_modules yarn.lock
yarn install
yarn build
```

**Generated project errors:**
Check individual feature modules for issues.

## Resources

- [DOCUMENTATION_GUIDELINES.md](./DOCUMENTATION_GUIDELINES.md) - Documentation standards
- [USER_GUIDE.md](./USER_GUIDE.md) - End user documentation
- [NPM_PUBLISH.md](./NPM_PUBLISH.md) - Publishing process
- [GITHUB_PUBLISH.md](./GITHUB_PUBLISH.md) - Release process
