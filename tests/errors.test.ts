import { describe, it, expect } from 'vitest';
import { SemanticScholarError, formatToolError } from '../src/utils/errors.js';

describe('SemanticScholarError', () => {
  it('should create error with status code and response', () => {
    const error = new SemanticScholarError(404, 'Paper not found');
    expect(error.statusCode).toBe(404);
    expect(error.response).toBe('Paper not found');
    expect(error.name).toBe('SemanticScholarError');
    expect(error.message).toContain('404');
    expect(error.message).toContain('Paper not found');
  });
});

describe('formatToolError', () => {
  it('should format 400 error', () => {
    const error = new SemanticScholarError(400, 'Bad request');
    const result = formatToolError(error);
    expect(result).toBe('请求参数错误，请检查输入');
  });

  it('should format 404 error', () => {
    const error = new SemanticScholarError(404, 'Not found');
    const result = formatToolError(error);
    expect(result).toBe('未找到指定的论文或作者');
  });

  it('should format 429 error', () => {
    const error = new SemanticScholarError(429, 'Rate limited');
    const result = formatToolError(error);
    expect(result).toBe('API 请求过于频繁，请稍后重试');
  });

  it('should format 500 error', () => {
    const error = new SemanticScholarError(500, 'Internal error');
    const result = formatToolError(error);
    expect(result).toBe('Semantic Scholar 服务器错误，请稍后重试');
  });

  it('should format unknown status code', () => {
    const error = new SemanticScholarError(418, "I'm a teapot");
    const result = formatToolError(error);
    expect(result).toContain('API 错误');
  });

  it('should format regular Error', () => {
    const error = new Error('Network error');
    const result = formatToolError(error);
    expect(result).toBe('Network error');
  });

  it('should format non-Error values', () => {
    expect(formatToolError('string error')).toBe('string error');
    expect(formatToolError(123)).toBe('123');
  });
});
