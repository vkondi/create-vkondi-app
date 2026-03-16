import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  readPackageJson,
  writePackageJson,
  addDependencies,
  addDevDependencies,
  addScripts,
  updatePackageJsonField,
  type PackageJson,
} from './packageJson';
import * as fileUtils from './file';

// Mock file utilities
vi.mock('./file');

describe('PackageJson Utils', () => {
  const mockPath = '/test/project';
  const mockPackageJson: PackageJson = {
    name: 'test-project',
    version: '1.0.0',
    description: 'A test project',
    scripts: {
      test: 'vitest',
      build: 'tsc',
    },
    dependencies: {
      react: '^18.0.0',
    },
    devDependencies: {
      typescript: '^5.0.0',
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Setup joinPath mock to return the expected path
    vi.mocked(fileUtils.joinPath).mockImplementation((...paths: string[]) => {
      return paths.join('/');
    });
  });

  describe('readPackageJson', () => {
    it('should read package.json file', async () => {
      vi.mocked(fileUtils.readJsonFile).mockResolvedValueOnce(mockPackageJson);

      const result = await readPackageJson(mockPath);

      expect(result).toEqual(mockPackageJson);
      expect(vi.mocked(fileUtils.readJsonFile)).toHaveBeenCalledWith('/test/project/package.json');
    });

    it('should handle missing fields', async () => {
      const minimal: PackageJson = {
        name: 'minimal',
      };
      vi.mocked(fileUtils.readJsonFile).mockResolvedValueOnce(minimal);

      const result = await readPackageJson(mockPath);

      expect(result.name).toBe('minimal');
      expect(result.dependencies).toBeUndefined();
    });
  });

  describe('writePackageJson', () => {
    it('should write package.json file', async () => {
      vi.mocked(fileUtils.writeJsonFile).mockResolvedValueOnce(undefined);

      await writePackageJson(mockPath, mockPackageJson);

      expect(vi.mocked(fileUtils.writeJsonFile)).toHaveBeenCalledWith(
        '/test/project/package.json',
        mockPackageJson
      );
    });

    it('should preserve all package.json fields', async () => {
      vi.mocked(fileUtils.writeJsonFile).mockResolvedValueOnce(undefined);
      const extended = {
        ...mockPackageJson,
        engines: { node: '>=18.0.0' },
        repository: { type: 'git', url: 'https://github.com/test/repo' },
      };

      await writePackageJson(mockPath, extended);

      const callArgs = vi.mocked(fileUtils.writeJsonFile).mock.calls[0];
      expect(callArgs[1]).toEqual(extended);
    });
  });

  describe('addDependencies', () => {
    it('should add new dependencies', async () => {
      const packageJson = { ...mockPackageJson };
      vi.mocked(fileUtils.readJsonFile).mockResolvedValueOnce(packageJson);
      vi.mocked(fileUtils.writeJsonFile).mockResolvedValueOnce(undefined);

      await addDependencies(mockPath, { axios: '^1.4.0' });

      const callArgs = vi.mocked(fileUtils.writeJsonFile).mock.calls[0];
      const writtenData = callArgs[1] as PackageJson;
      expect(writtenData.dependencies).toEqual({
        react: '^18.0.0',
        axios: '^1.4.0',
      });
    });

    it('should override existing dependencies', async () => {
      const packageJson = { ...mockPackageJson };
      vi.mocked(fileUtils.readJsonFile).mockResolvedValueOnce(packageJson);
      vi.mocked(fileUtils.writeJsonFile).mockResolvedValueOnce(undefined);

      await addDependencies(mockPath, { react: '^19.0.0' });

      const callArgs = vi.mocked(fileUtils.writeJsonFile).mock.calls[0];
      const writtenData = callArgs[1] as PackageJson;
      expect(writtenData.dependencies?.react).toBe('^19.0.0');
    });

    it('should create dependencies object if missing', async () => {
      const packageJson: PackageJson = { name: 'test' };
      vi.mocked(fileUtils.readJsonFile).mockResolvedValueOnce(packageJson);
      vi.mocked(fileUtils.writeJsonFile).mockResolvedValueOnce(undefined);

      await addDependencies(mockPath, { react: '^18.0.0' });

      const callArgs = vi.mocked(fileUtils.writeJsonFile).mock.calls[0];
      const writtenData = callArgs[1] as PackageJson;
      expect(writtenData.dependencies).toEqual({ react: '^18.0.0' });
    });
  });

  describe('addDevDependencies', () => {
    it('should add new dev dependencies', async () => {
      const packageJson = { ...mockPackageJson };
      vi.mocked(fileUtils.readJsonFile).mockResolvedValueOnce(packageJson);
      vi.mocked(fileUtils.writeJsonFile).mockResolvedValueOnce(undefined);

      await addDevDependencies(mockPath, { eslint: '^8.0.0' });

      const callArgs = vi.mocked(fileUtils.writeJsonFile).mock.calls[0];
      const writtenData = callArgs[1] as PackageJson;
      expect(writtenData.devDependencies).toEqual({
        typescript: '^5.0.0',
        eslint: '^8.0.0',
      });
    });

    it('should create devDependencies object if missing', async () => {
      const packageJson: PackageJson = { name: 'test' };
      vi.mocked(fileUtils.readJsonFile).mockResolvedValueOnce(packageJson);
      vi.mocked(fileUtils.writeJsonFile).mockResolvedValueOnce(undefined);

      await addDevDependencies(mockPath, { vitest: '^1.0.0' });

      const callArgs = vi.mocked(fileUtils.writeJsonFile).mock.calls[0];
      const writtenData = callArgs[1] as PackageJson;
      expect(writtenData.devDependencies).toEqual({ vitest: '^1.0.0' });
    });
  });

  describe('addScripts', () => {
    it('should add new scripts', async () => {
      const packageJson = { ...mockPackageJson };
      vi.mocked(fileUtils.readJsonFile).mockResolvedValueOnce(packageJson);
      vi.mocked(fileUtils.writeJsonFile).mockResolvedValueOnce(undefined);

      await addScripts(mockPath, { lint: 'eslint .' });

      const callArgs = vi.mocked(fileUtils.writeJsonFile).mock.calls[0];
      const writtenData = callArgs[1] as PackageJson;
      expect(writtenData.scripts).toEqual({
        test: 'vitest',
        build: 'tsc',
        lint: 'eslint .',
      });
    });

    it('should override existing scripts', async () => {
      const packageJson = { ...mockPackageJson };
      vi.mocked(fileUtils.readJsonFile).mockResolvedValueOnce(packageJson);
      vi.mocked(fileUtils.writeJsonFile).mockResolvedValueOnce(undefined);

      await addScripts(mockPath, { test: 'jest' });

      const callArgs = vi.mocked(fileUtils.writeJsonFile).mock.calls[0];
      const writtenData = callArgs[1] as PackageJson;
      expect(writtenData.scripts?.test).toBe('jest');
    });

    it('should create scripts object if missing', async () => {
      const packageJson: PackageJson = { name: 'test' };
      vi.mocked(fileUtils.readJsonFile).mockResolvedValueOnce(packageJson);
      vi.mocked(fileUtils.writeJsonFile).mockResolvedValueOnce(undefined);

      await addScripts(mockPath, { start: 'node index.js' });

      const callArgs = vi.mocked(fileUtils.writeJsonFile).mock.calls[0];
      const writtenData = callArgs[1] as PackageJson;
      expect(writtenData.scripts).toEqual({ start: 'node index.js' });
    });
  });

  describe('updatePackageJsonField', () => {
    it('should update existing field', async () => {
      const packageJson = { ...mockPackageJson };
      vi.mocked(fileUtils.readJsonFile).mockResolvedValueOnce(packageJson);
      vi.mocked(fileUtils.writeJsonFile).mockResolvedValueOnce(undefined);

      await updatePackageJsonField(mockPath, 'version', '2.0.0');

      const callArgs = vi.mocked(fileUtils.writeJsonFile).mock.calls[0];
      const writtenData = callArgs[1] as PackageJson;
      expect(writtenData.version).toBe('2.0.0');
    });

    it('should add new field', async () => {
      const packageJson = { name: 'test' };
      vi.mocked(fileUtils.readJsonFile).mockResolvedValueOnce(packageJson);
      vi.mocked(fileUtils.writeJsonFile).mockResolvedValueOnce(undefined);

      await updatePackageJsonField(mockPath, 'author', 'John Doe');

      const callArgs = vi.mocked(fileUtils.writeJsonFile).mock.calls[0];
      const writtenData = callArgs[1] as PackageJson;
      expect(writtenData.author).toBe('John Doe');
    });

    it('should handle complex values', async () => {
      const packageJson = { name: 'test' };
      vi.mocked(fileUtils.readJsonFile).mockResolvedValueOnce(packageJson);
      vi.mocked(fileUtils.writeJsonFile).mockResolvedValueOnce(undefined);

      const engines = { node: '>=18.0.0', npm: '>=9.0.0' };
      await updatePackageJsonField(mockPath, 'engines', engines);

      const callArgs = vi.mocked(fileUtils.writeJsonFile).mock.calls[0];
      const writtenData = callArgs[1] as PackageJson;
      expect(writtenData.engines).toEqual(engines);
    });
  });
});
