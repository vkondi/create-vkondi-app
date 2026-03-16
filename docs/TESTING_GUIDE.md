# Testing Guide for create-vkondi-app

This document provides a comprehensive guide to running and understanding the unit tests for the `create-vkondi-app` CLI tool.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Running Tests](#running-tests)
3. [Test Structure](#test-structure)
4. [Test Coverage](#test-coverage)
5. [Writing New Tests](#writing-new-tests)
6. [Best Practices](#best-practices)
7. [Troubleshooting](#troubleshooting)

## Quick Start

### Prerequisites

- Node.js >= 18.0.0
- yarn or npm or pnpm

### Setup

```bash
# Install dependencies (if not already done)
yarn install

# Run all tests
yarn test:run

# Run tests in watch mode
yarn test:watch

# View test coverage
yarn test:coverage

# Open UI dashboard
yarn test:ui
```

## Running Tests

### Test Commands

| Command | Purpose | Usage |
|---------|---------|-------|
| `yarn test` | Run tests in watch mode | Development: auto-rerun on file changes |
| `yarn test:run` | Run all tests once | CI/CD pipelines, single verification |
| `yarn test:watch` | Continuous test watching | Development mode |
| `yarn test:ui` | Interactive UI dashboard | Visual test exploration |
| `yarn test:coverage` | Generate coverage report | Measure code coverage |
| `yarn test:debug` | Debug tests in inspector | For deep debugging |

### Examples

```bash
# Run specific test file
yarn test:run src/utils/file.test.ts

# Run tests matching a pattern
yarn test:run -- --grep "installed"

# Run with verbose output
yarn test:run --reporter=verbose

# Generate HTML coverage report
yarn test:coverage

# Run single test
yarn test:run -- --grep "should read file content"
```

## Test Structure

Tests follow the Arrange → Act → Assert pattern with proper isolation and focused assertions.

## Test Coverage

### Viewing Coverage

```bash
# Generate and display coverage
yarn test:coverage

# View HTML report
yarn test:coverage  # Opens coverage/index.html
```

### Target Coverage Goals

- Statements: > 85%
- Branches: > 80%
- Functions: > 85%
- Lines: > 85%

## Writing New Tests

### Test Template

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { myFunction } from './module';

// Mock external dependencies
vi.mock('external-module');

describe('Module Name', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('specific feature', () => {
    it('should do something specific', async () => {
      // Arrange
      const input = 'test-input';
      vi.mocked(someModule.func).mockResolvedValueOnce(expected);

      // Act
      const result = await myFunction(input);

      // Assert
      expect(result).toBe(expected);
      expect(someModule.func).toHaveBeenCalledWith(input);
    });

    it('should handle error cases', async () => {
      vi.mocked(someModule.func).mockRejectedValueOnce(new Error('Failed'));

      await expect(myFunction('input')).rejects.toThrow('Failed');
    });
  });
});
```

### Test Naming Conventions

- ✅ Use descriptive names: `should handle...`, `should throw...`, `should return...`
- ✅ One assertion concept per test
- ✅ Arrange → Act → Assert pattern
- ✅ Use `beforeEach` for common setup

### Mocking Best Practices

```typescript
// Mock external modules
vi.mock('./utils/logger');

// Setup mock implementation
beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(asyncFunc).mockResolvedValueOnce(value);
});

// Verify mock calls
expect(vi.mocked(someFunc)).toHaveBeenCalledWith(args);
```

### Testing Async Code

```typescript
// Always use async/await
it('should work with async functions', async () => {
  const result = await asyncFunction();
  expect(result).toBeDefined();
});

// Test promise rejection
await expect(asyncFunction()).rejects.toThrow();
```

## Best Practices

### Do's ✅

1. **Clear Test Descriptions** - Use descriptive test names
   ```typescript
   ✅ it('should add dependencies without overwriting existing ones', ...)
   ```

2. **Isolated Tests** - Each test should be independent
   ```typescript
   beforeEach(() => {
     vi.clearAllMocks();
   });
   ```

3. **Meaningful Assertions** - Test the right behavior
   ```typescript
   ✅ expect(result.dependencies).toEqual({ react: '^18.0.0' });
   ```

4. **Mock External Dependencies** - Don't call real APIs
   ```typescript
   vi.mock('./utils/file');
   vi.mocked(fs.readFile).mockResolvedValueOnce(data);
   ```

### Don'ts ❌

1. **Don't Test Implementation Details**
   ```typescript
   ❌ expect(internals.callCount).toBe(1);
   ✅ expect(result).toEqual(expected);
   ```

2. **Don't Share State Between Tests**
   ```typescript
   ❌ let globalState = {};  // Shared across tests
   ✅ let state = {}; // Local to each test
   ```

3. **Don't Use Sleep for Timing**
   ```typescript
   ❌ await new Promise(r => setTimeout(r, 100));
   ✅ Use mocked timers: vi.useFakeTimers();
   ```

4. **Don't Test External Libraries**
   ```typescript
   ❌ Test chalk color functions
   ✅ Mock chalk and test your usage
   ```

## Troubleshooting

### Common Issues

#### Tests Fail with Module Not Found

```bash
# Solution: Ensure all imports use .js extension (ESM)
❌ import { func } from './utils/file'
✅ import { func } from './utils/file.js'
```

#### Mock Not Being Applied

```typescript
// Solution: Mock must appear before import
vi.mock('./module');
import { myFunction } from './module';
```

#### Async Test Timeout

```bash
# Solution: Increase timeout for slow tests
yarn test:run -- --testTimeout=10000
```

#### Missing Type Definitions

```bash
# Solution: Ensure test files are included in tsconfig
# In tsconfig.json:
"include": ["src/**/*", "src/**/*.test.ts"]
```

### Debug Mode

```bash
# Run tests with Node debugger
yarn test:debug

# Open chrome://inspect in Chrome DevTools
# Click 'inspect' on the test process
```

### Coverage Gaps

```bash
# Check coverage report
yarn test:coverage

# Look for untested lines with `coverage/index.html`
# Add tests for lines with red highlighting
```

## Integration with CI/CD

### GitHub Actions Example

```yaml
- name: Run Tests
  run: yarn test:run

- name: Upload Coverage
  uses: codecov/codecov-action@v3
  with:
    files: ./coverage/coverage-final.json
```

### Pre-commit Hook

```bash
# Add to .husky/pre-commit
yarn test:run --changed
```

## Additional Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library Best Practices](https://testing-library.com/docs/)
- [Jest Expect Matchers](https://jestjs.io/docs/expect) (compatible with Vitest)

---

**Last Updated:** March 2026
**Maintainer:** create-vkondi-app Team
