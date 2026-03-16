import { describe, it, expect } from 'vitest';
import type { ProjectContext } from './context';

describe('ProjectContext Type', () => {
  it('should have all required fields', () => {
    const mockContext: ProjectContext = {
      projectName: 'test-app',
      projectPath: '/home/user/test-app',
      framework: 'react',
      typescript: true,
      tailwind: true,
      testing: 'vitest',
      lintingMode: 'strict',
      githubActions: true,
      docker: true,
      packageManager: 'npm',
    };

    expect(mockContext.projectName).toBe('test-app');
    expect(mockContext.framework).toBe('react');
    expect(mockContext.typescript).toBe(true);
    expect(mockContext.tailwind).toBe(true);
    expect(mockContext.testing).toBe('vitest');
    expect(mockContext.githubActions).toBe(true);
    expect(mockContext.docker).toBe(true);
  });

  it('should support next.js framework', () => {
    const nextContext: ProjectContext = {
      projectName: 'next-app',
      projectPath: '/home/user/next-app',
      framework: 'next',
      typescript: true,
      tailwind: false,
      testing: 'none',
      lintingMode: 'standard',
      githubActions: false,
      docker: false,
      packageManager: 'yarn',
    };

    expect(nextContext.framework).toBe('next');
    expect(nextContext.packageManager).toBe('yarn');
  });

  it('should support pnpm package manager', () => {
    const context: ProjectContext = {
      projectName: 'app',
      projectPath: '/app',
      framework: 'react',
      typescript: true,
      tailwind: false,
      testing: 'vitest',
      lintingMode: 'strict',
      githubActions: true,
      docker: false,
      packageManager: 'pnpm',
    };

    expect(context.packageManager).toBe('pnpm');
  });

  it('should support all testing options', () => {
    const vitestContext: ProjectContext = {
      projectName: 'app1',
      projectPath: '/app1',
      framework: 'react',
      typescript: true,
      tailwind: false,
      testing: 'vitest',
      lintingMode: 'strict',
      githubActions: false,
      docker: false,
      packageManager: 'npm',
    };

    const noneContext: ProjectContext = {
      projectName: 'app2',
      projectPath: '/app2',
      framework: 'react',
      typescript: true,
      tailwind: false,
      testing: 'none',
      lintingMode: 'strict',
      githubActions: false,
      docker: false,
      packageManager: 'npm',
    };

    expect(vitestContext.testing).toBe('vitest');
    expect(noneContext.testing).toBe('none');
  });

  it('should support all linting modes', () => {
    const strictContext: ProjectContext = {
      projectName: 'app1',
      projectPath: '/app1',
      framework: 'react',
      typescript: true,
      tailwind: false,
      testing: 'vitest',
      lintingMode: 'strict',
      githubActions: false,
      docker: false,
      packageManager: 'npm',
    };

    const standardContext: ProjectContext = {
      projectName: 'app2',
      projectPath: '/app2',
      framework: 'react',
      typescript: true,
      tailwind: false,
      testing: 'vitest',
      lintingMode: 'standard',
      githubActions: false,
      docker: false,
      packageManager: 'npm',
    };

    expect(strictContext.lintingMode).toBe('strict');
    expect(standardContext.lintingMode).toBe('standard');
  });
});
