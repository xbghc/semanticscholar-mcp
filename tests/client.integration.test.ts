// API 客户端集成测试 - 真实调用 Semantic Scholar API
// 运行: npm test -- tests/client.integration.test.ts

import { describe, it, expect, beforeAll } from 'vitest';
import { SemanticScholarClient } from '../src/api/client.js';
import { buildFieldsParam, DEFAULT_PAPER_FIELDS, DEFAULT_AUTHOR_FIELDS } from '../src/utils/fields.js';

// 增加超时时间，因为有速率限制和重试
const TIMEOUT = 60000;

describe('SemanticScholarClient Integration', () => {
  let client: SemanticScholarClient;

  beforeAll(() => {
    client = new SemanticScholarClient();
  });

  describe('Paper APIs', () => {
    it('should search papers', async () => {
      const result = await client.searchPapers({
        query: 'attention is all you need',
        fields: buildFieldsParam(DEFAULT_PAPER_FIELDS),
        limit: 3,
      });

      expect(result).toBeDefined();
      expect(result.total).toBeGreaterThan(0);
      expect(result.data).toHaveLength(3);
      expect(result.data[0].title).toBeDefined();
      expect(result.data[0].paperId).toBeDefined();
    }, TIMEOUT);

    it('should get paper by ID', async () => {
      // "Attention Is All You Need" paper
      const paperId = '204e3073870fae3d05bcbc2f6a8e263d9b72e776';

      const paper = await client.getPaper(paperId, buildFieldsParam(DEFAULT_PAPER_FIELDS));

      expect(paper).toBeDefined();
      expect(paper.paperId).toBe(paperId);
      expect(paper.title).toContain('Attention');
      expect(paper.year).toBe(2017);
    }, TIMEOUT);

    it('should get paper by ArXiv ID', async () => {
      // 使用 ArXiv ID 而不是 DOI
      const paper = await client.getPaper(
        'ARXIV:1706.03762',
        buildFieldsParam(['paperId', 'title', 'year'])
      );

      expect(paper).toBeDefined();
      expect(paper.title).toBeDefined();
      expect(paper.title).toContain('Attention');
    }, TIMEOUT);

    it('should get paper citations', async () => {
      const paperId = '204e3073870fae3d05bcbc2f6a8e263d9b72e776';

      const result = await client.getPaperCitations(paperId, {
        fields: 'citingPaper.title,citingPaper.year',
        limit: 5,
      });

      expect(result).toBeDefined();
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.data[0].citingPaper).toBeDefined();
    }, TIMEOUT);

    it('should get paper references', async () => {
      const paperId = '204e3073870fae3d05bcbc2f6a8e263d9b72e776';

      const result = await client.getPaperReferences(paperId, {
        fields: 'citedPaper.title,citedPaper.year',
        limit: 5,
      });

      expect(result).toBeDefined();
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.data[0].citedPaper).toBeDefined();
    }, TIMEOUT);

    it('should batch get papers', async () => {
      const paperIds = [
        '204e3073870fae3d05bcbc2f6a8e263d9b72e776',
        'df2b0e26d0599ce3e70df8a9da02e51594e0e992', // BERT
      ];

      const papers = await client.batchGetPapers(paperIds, 'title,year');

      expect(papers).toHaveLength(2);
      expect(papers[0]?.title).toContain('Attention');
      expect(papers[1]?.title).toContain('BERT');
    }, TIMEOUT);
  });

  describe('Author APIs', () => {
    it('should search authors', async () => {
      const result = await client.searchAuthors({
        query: 'Yoshua Bengio',
        fields: buildFieldsParam(DEFAULT_AUTHOR_FIELDS, DEFAULT_AUTHOR_FIELDS),
        limit: 3,
      });

      expect(result).toBeDefined();
      expect(result.total).toBeGreaterThan(0);
      expect(result.data[0].name).toContain('Bengio');
    }, TIMEOUT);

    it('should get author by ID', async () => {
      // Yoshua Bengio's author ID
      const authorId = '1751762';

      const author = await client.getAuthor(authorId, buildFieldsParam(DEFAULT_AUTHOR_FIELDS, DEFAULT_AUTHOR_FIELDS));

      expect(author).toBeDefined();
      expect(author.authorId).toBe(authorId);
      expect(author.name).toContain('Bengio');
      expect(author.hIndex).toBeGreaterThan(0);
    }, TIMEOUT);

    it('should get author papers', async () => {
      const authorId = '1751762';

      const result = await client.getAuthorPapers(authorId, {
        fields: 'title,year,citationCount',
        limit: 5,
      });

      expect(result).toBeDefined();
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.data[0].title).toBeDefined();
    }, TIMEOUT);
  });

  describe('Recommendations API', () => {
    it('should get paper recommendations', async () => {
      const result = await client.getRecommendations({
        positivePaperIds: ['204e3073870fae3d05bcbc2f6a8e263d9b72e776'],
        fields: 'title,year,citationCount',
        limit: 5,
      });

      expect(result).toBeDefined();
      expect(result.recommendedPapers).toBeDefined();
      expect(result.recommendedPapers.length).toBeGreaterThan(0);
    }, TIMEOUT);
  });
});
