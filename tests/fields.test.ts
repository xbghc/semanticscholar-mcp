import { describe, it, expect } from 'vitest';
import {
  buildFieldsParam,
  DEFAULT_PAPER_FIELDS,
  DEFAULT_AUTHOR_FIELDS,
} from '../src/utils/fields.js';

describe('buildFieldsParam', () => {
  it('should use provided fields', () => {
    const result = buildFieldsParam(['title', 'year', 'abstract']);
    expect(result).toBe('title,year,abstract');
  });

  it('should use default fields when none provided', () => {
    const result = buildFieldsParam(undefined, DEFAULT_PAPER_FIELDS);
    expect(result).toBe(DEFAULT_PAPER_FIELDS.join(','));
  });

  it('should use default fields for empty array', () => {
    const result = buildFieldsParam([], DEFAULT_AUTHOR_FIELDS);
    expect(result).toBe(DEFAULT_AUTHOR_FIELDS.join(','));
  });

  it('should handle single field', () => {
    const result = buildFieldsParam(['paperId']);
    expect(result).toBe('paperId');
  });
});

describe('DEFAULT_PAPER_FIELDS', () => {
  it('should contain essential paper fields', () => {
    expect(DEFAULT_PAPER_FIELDS).toContain('paperId');
    expect(DEFAULT_PAPER_FIELDS).toContain('title');
    expect(DEFAULT_PAPER_FIELDS).toContain('authors');
    expect(DEFAULT_PAPER_FIELDS).toContain('year');
  });
});

describe('DEFAULT_AUTHOR_FIELDS', () => {
  it('should contain essential author fields', () => {
    expect(DEFAULT_AUTHOR_FIELDS).toContain('authorId');
    expect(DEFAULT_AUTHOR_FIELDS).toContain('name');
    expect(DEFAULT_AUTHOR_FIELDS).toContain('hIndex');
  });
});
