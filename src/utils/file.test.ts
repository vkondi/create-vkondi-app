import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs-extra';
import path from 'path';
import {
  ensureDir,
  writeFile,
  readFile,
  copyFile,
  pathExists,
  removeFile,
  joinPath,
  resolvePath,
  readJsonFile,
  writeJsonFile,
} from './file';

// Mock fs-extra
vi.mock('fs-extra');

describe('File Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('ensureDir', () => {
    it('should ensure directory exists', async () => {
      vi.mocked(fs.ensureDir).mockResolvedValueOnce(undefined);
      
      await ensureDir('/test/path');
      
      expect(fs.ensureDir).toHaveBeenCalledWith('/test/path');
    });

    it('should handle errors gracefully', async () => {
      const error = new Error('Permission denied');
      vi.mocked(fs.ensureDir).mockRejectedValueOnce(error);
      
      await expect(ensureDir('/invalid/path')).rejects.toThrow('Permission denied');
    });
  });

  describe('writeFile', () => {
    it('should write file with content', async () => {
      vi.mocked(fs.writeFile).mockResolvedValueOnce(undefined);
      
      await writeFile('/test/file.txt', 'content');
      
      expect(fs.writeFile).toHaveBeenCalledWith('/test/file.txt', 'content', 'utf-8');
    });

    it('should write complex content', async () => {
      vi.mocked(fs.writeFile).mockResolvedValueOnce(undefined);
      const content = `export const config = {
  name: 'test',
  version: '1.0.0'
};`;
      
      await writeFile('/test/config.ts', content);
      
      expect(fs.writeFile).toHaveBeenCalledWith('/test/config.ts', content, 'utf-8');
    });
  });

  describe('readFile', () => {
    it('should read file content', async () => {
      const content = 'file content';
      vi.mocked(fs.readFile).mockResolvedValueOnce(content);
      
      const result = await readFile('/test/file.txt');
      
      expect(result).toBe(content);
      expect(fs.readFile).toHaveBeenCalledWith('/test/file.txt', 'utf-8');
    });

    it('should return empty string for empty files', async () => {
      vi.mocked(fs.readFile).mockResolvedValueOnce('');
      
      const result = await readFile('/test/empty.txt');
      
      expect(result).toBe('');
    });
  });

  describe('copyFile', () => {
    it('should copy file from source to destination', async () => {
      vi.mocked(fs.copy).mockResolvedValueOnce(undefined);
      
      await copyFile('/source/file.txt', '/dest/file.txt');
      
      expect(fs.copy).toHaveBeenCalledWith('/source/file.txt', '/dest/file.txt');
    });
  });

  describe('pathExists', () => {
    it('should return true if path exists', async () => {
      vi.mocked(fs.pathExists).mockResolvedValueOnce(true);
      
      const result = await pathExists('/existing/path');
      
      expect(result).toBe(true);
    });

    it('should return false if path does not exist', async () => {
      vi.mocked(fs.pathExists).mockResolvedValueOnce(false);
      
      const result = await pathExists('/nonexistent/path');
      
      expect(result).toBe(false);
    });
  });

  describe('removeFile', () => {
    it('should remove file or directory', async () => {
      vi.mocked(fs.remove).mockResolvedValueOnce(undefined);
      
      await removeFile('/test/path');
      
      expect(fs.remove).toHaveBeenCalledWith('/test/path');
    });
  });

  describe('joinPath', () => {
    it('should join path segments', () => {
      const result = joinPath('/home', 'user', 'project');
      
      expect(result).toBe(path.join('/home', 'user', 'project'));
    });

    it('should handle single segment', () => {
      const result = joinPath('/home');

      // path.join uses OS separator (backslash on Windows, forward slash on Unix)
      expect(result).toMatch(/[\\/]home/);
    });

    it('should handle empty array', () => {
      const result = joinPath();
      
      expect(result).toBe('.');
    });
  });

  describe('resolvePath', () => {
    it('should resolve path segments', () => {
      const result = resolvePath('/home', 'user', '../project');
      
      expect(result).toBe(path.resolve('/home', 'user', '../project'));
    });
  });

  describe('readJsonFile', () => {
    it('should read and parse JSON file', async () => {
      const jsonContent = JSON.stringify({ name: 'test', version: '1.0.0' });
      vi.mocked(fs.readFile).mockResolvedValueOnce(jsonContent as any);
      
      const result = await readJsonFile<{ name: string; version: string }>('/test/package.json');
      
      expect(result).toEqual({ name: 'test', version: '1.0.0' });
      expect(vi.mocked(fs.readFile)).toHaveBeenCalledWith('/test/package.json', 'utf-8');
    });

    it('should throw on invalid JSON', async () => {
      vi.mocked(fs.readFile).mockResolvedValueOnce('invalid json {');
      
      await expect(readJsonFile('/test/invalid.json')).rejects.toThrow();
    });

    it('should handle complex JSON structures', async () => {
      const complexData = {
        name: 'test',
        scripts: { test: 'vitest', build: 'tsc' },
        dependencies: { react: '^18.0.0' },
      };
      vi.mocked(fs.readFile).mockResolvedValueOnce(JSON.stringify(complexData));
      
      const result = await readJsonFile('/test/package.json');
      
      expect(result).toEqual(complexData);
    });
  });

  describe('writeJsonFile', () => {
    it('should write object as JSON file', async () => {
      vi.mocked(fs.writeFile).mockResolvedValueOnce(undefined);
      const data = { name: 'test', version: '1.0.0' };
      
      await writeJsonFile('/test/package.json', data);
      
      const expectedContent = JSON.stringify(data, null, 2);
      expect(fs.writeFile).toHaveBeenCalledWith('/test/package.json', expectedContent, 'utf-8');
    });

    it('should format JSON with 2 spaces', async () => {
      vi.mocked(fs.writeFile).mockResolvedValueOnce(undefined);
      const data = { name: 'test' };
      
      await writeJsonFile('/test/data.json', data);
      
      const callArgs = vi.mocked(fs.writeFile).mock.calls[0];
      expect(callArgs[1]).toContain('  ');
    });
  });
});
