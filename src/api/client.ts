// Semantic Scholar API 客户端

import { RateLimiter } from './rate-limiter.js';
import { BackoffStrategy } from './backoff.js';
import { SemanticScholarError } from '../utils/errors.js';
import type {
  Paper,
  Author,
  PaperSearchResponse,
  AuthorSearchResponse,
  CitationsResponse,
  ReferencesResponse,
  AuthorPapersResponse,
  RecommendationsResponse,
} from './types.js';

export class SemanticScholarClient {
  private baseUrl = 'https://api.semanticscholar.org';
  private apiKey?: string;
  private rateLimiter: RateLimiter;
  private backoff: BackoffStrategy;

  constructor() {
    this.apiKey = process.env.SEMANTIC_SCHOLAR_API_KEY;
    this.rateLimiter = new RateLimiter(this.apiKey ? 2000 : 5000);
    this.backoff = new BackoffStrategy(this.rateLimiter);
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const doRequest = async (): Promise<T> => {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (this.apiKey) {
        headers['x-api-key'] = this.apiKey;
      }

      const url = `${this.baseUrl}${endpoint}`;
      const response = await fetch(url, {
        ...options,
        headers: { ...headers, ...options?.headers },
      });

      if (response.status === 429) {
        const delay = this.backoff.onRateLimited();
        if (delay === -1) {
          throw new SemanticScholarError(429, 'Max retry attempts exceeded');
        }
        // 等待退避时间后重试
        await new Promise(resolve => setTimeout(resolve, delay));
        return doRequest();
      }

      if (!response.ok) {
        const text = await response.text();
        throw new SemanticScholarError(response.status, text);
      }

      // 请求成功，重置退避计数
      this.backoff.reset();
      return response.json() as Promise<T>;
    };

    return this.rateLimiter.execute(doRequest);
  }

  // ========== 论文相关 API ==========

  async searchPapers(params: {
    query: string;
    fields?: string;
    year?: string;
    openAccessPdf?: boolean;
    minCitationCount?: number;
    fieldsOfStudy?: string[];
    limit?: number;
    offset?: number;
  }): Promise<PaperSearchResponse> {
    const searchParams = new URLSearchParams();
    searchParams.set('query', params.query);
    if (params.fields) searchParams.set('fields', params.fields);
    if (params.year) searchParams.set('year', params.year);
    if (params.openAccessPdf) searchParams.set('openAccessPdf', 'true');
    if (params.minCitationCount) searchParams.set('minCitationCount', String(params.minCitationCount));
    if (params.fieldsOfStudy?.length) searchParams.set('fieldsOfStudy', params.fieldsOfStudy.join(','));
    if (params.limit) searchParams.set('limit', String(params.limit));
    if (params.offset) searchParams.set('offset', String(params.offset));

    return this.request<PaperSearchResponse>(`/graph/v1/paper/search?${searchParams}`);
  }

  async getPaper(paperId: string, fields?: string): Promise<Paper> {
    const searchParams = new URLSearchParams();
    if (fields) searchParams.set('fields', fields);
    const query = searchParams.toString();
    return this.request<Paper>(`/graph/v1/paper/${encodeURIComponent(paperId)}${query ? '?' + query : ''}`);
  }

  async getPaperCitations(paperId: string, params: {
    fields?: string;
    limit?: number;
    offset?: number;
  }): Promise<CitationsResponse> {
    const searchParams = new URLSearchParams();
    if (params.fields) searchParams.set('fields', params.fields);
    if (params.limit) searchParams.set('limit', String(params.limit));
    if (params.offset) searchParams.set('offset', String(params.offset));
    const query = searchParams.toString();
    return this.request<CitationsResponse>(`/graph/v1/paper/${encodeURIComponent(paperId)}/citations${query ? '?' + query : ''}`);
  }

  async getPaperReferences(paperId: string, params: {
    fields?: string;
    limit?: number;
    offset?: number;
  }): Promise<ReferencesResponse> {
    const searchParams = new URLSearchParams();
    if (params.fields) searchParams.set('fields', params.fields);
    if (params.limit) searchParams.set('limit', String(params.limit));
    if (params.offset) searchParams.set('offset', String(params.offset));
    const query = searchParams.toString();
    return this.request<ReferencesResponse>(`/graph/v1/paper/${encodeURIComponent(paperId)}/references${query ? '?' + query : ''}`);
  }

  async batchGetPapers(paperIds: string[], fields?: string): Promise<(Paper | null)[]> {
    const searchParams = new URLSearchParams();
    if (fields) searchParams.set('fields', fields);
    const query = searchParams.toString();

    const response = await this.request<(Paper | null)[]>(
      `/graph/v1/paper/batch${query ? '?' + query : ''}`,
      {
        method: 'POST',
        body: JSON.stringify({ ids: paperIds }),
      }
    );
    return response;
  }

  // ========== 作者相关 API ==========

  async searchAuthors(params: {
    query: string;
    fields?: string;
    limit?: number;
    offset?: number;
  }): Promise<AuthorSearchResponse> {
    const searchParams = new URLSearchParams();
    searchParams.set('query', params.query);
    if (params.fields) searchParams.set('fields', params.fields);
    if (params.limit) searchParams.set('limit', String(params.limit));
    if (params.offset) searchParams.set('offset', String(params.offset));

    return this.request<AuthorSearchResponse>(`/graph/v1/author/search?${searchParams}`);
  }

  async getAuthor(authorId: string, fields?: string): Promise<Author> {
    const searchParams = new URLSearchParams();
    if (fields) searchParams.set('fields', fields);
    const query = searchParams.toString();
    return this.request<Author>(`/graph/v1/author/${encodeURIComponent(authorId)}${query ? '?' + query : ''}`);
  }

  async getAuthorPapers(authorId: string, params: {
    fields?: string;
    limit?: number;
    offset?: number;
  }): Promise<AuthorPapersResponse> {
    const searchParams = new URLSearchParams();
    if (params.fields) searchParams.set('fields', params.fields);
    if (params.limit) searchParams.set('limit', String(params.limit));
    if (params.offset) searchParams.set('offset', String(params.offset));
    const query = searchParams.toString();
    return this.request<AuthorPapersResponse>(`/graph/v1/author/${encodeURIComponent(authorId)}/papers${query ? '?' + query : ''}`);
  }

  // ========== 推荐 API ==========

  async getRecommendations(params: {
    positivePaperIds: string[];
    negativePaperIds?: string[];
    fields?: string;
    limit?: number;
  }): Promise<RecommendationsResponse> {
    const searchParams = new URLSearchParams();
    if (params.fields) searchParams.set('fields', params.fields);
    if (params.limit) searchParams.set('limit', String(params.limit));
    const query = searchParams.toString();

    return this.request<RecommendationsResponse>(
      `/recommendations/v1/papers${query ? '?' + query : ''}`,
      {
        method: 'POST',
        body: JSON.stringify({
          positivePaperIds: params.positivePaperIds,
          negativePaperIds: params.negativePaperIds || [],
        }),
      }
    );
  }
}

// 单例导出
export const client = new SemanticScholarClient();
