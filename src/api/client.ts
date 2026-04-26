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

type QueryValue = string | number | boolean | string[] | undefined;

export class SemanticScholarClient {
  private baseUrl = 'https://api.semanticscholar.org';
  private apiKey?: string;
  private rateLimiter: RateLimiter;

  constructor() {
    this.apiKey = process.env.SEMANTIC_SCHOLAR_API_KEY;
    this.rateLimiter = new RateLimiter(this.apiKey ? 2000 : 5000);
  }

  private buildQuery(params: Record<string, QueryValue>): string {
    const searchParams = new URLSearchParams();

    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === '') continue;

      if (Array.isArray(value)) {
        const validValues = value.filter(item => item !== '');
        if (validValues.length > 0) {
          searchParams.set(key, validValues.join(','));
        }
        continue;
      }

      if (typeof value === 'boolean') {
        searchParams.set(key, String(value));
        continue;
      }

      searchParams.set(key, String(value));
    }

    return searchParams.toString();
  }

  private withQuery(path: string, params: Record<string, QueryValue>): string {
    const query = this.buildQuery(params);
    return query ? `${path}?${query}` : path;
  }

  private getDefaultHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.apiKey) {
      headers['x-api-key'] = this.apiKey;
    }

    return headers;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const backoff = new BackoffStrategy(this.rateLimiter);

    const doRequest = async (): Promise<T> => {
      while (true) {
        const url = `${this.baseUrl}${endpoint}`;
        const response = await fetch(url, {
          ...options,
          headers: { ...this.getDefaultHeaders(), ...options?.headers },
        });

        if (response.status === 429) {
          const delay = backoff.onRateLimited();
          if (delay === -1) {
            throw new SemanticScholarError(429, 'Max retry attempts exceeded');
          }
          // 等待退避时间后重试
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }

        if (!response.ok) {
          const text = await response.text();
          throw new SemanticScholarError(response.status, text);
        }

        // 请求成功，重置退避计数
        backoff.reset();
        return response.json() as Promise<T>;
      }
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
    return this.request<PaperSearchResponse>(
      this.withQuery('/graph/v1/paper/search', {
        query: params.query,
        fields: params.fields,
        year: params.year,
        openAccessPdf: params.openAccessPdf,
        minCitationCount: params.minCitationCount,
        fieldsOfStudy: params.fieldsOfStudy,
        limit: params.limit,
        offset: params.offset,
      })
    );
  }

  async getPaper(paperId: string, fields?: string): Promise<Paper> {
    return this.request<Paper>(
      this.withQuery(`/graph/v1/paper/${encodeURIComponent(paperId)}`, {
        fields,
      })
    );
  }

  async getPaperCitations(paperId: string, params: {
    fields?: string;
    limit?: number;
    offset?: number;
  }): Promise<CitationsResponse> {
    return this.request<CitationsResponse>(
      this.withQuery(`/graph/v1/paper/${encodeURIComponent(paperId)}/citations`, {
        fields: params.fields,
        limit: params.limit,
        offset: params.offset,
      })
    );
  }

  async getPaperReferences(paperId: string, params: {
    fields?: string;
    limit?: number;
    offset?: number;
  }): Promise<ReferencesResponse> {
    return this.request<ReferencesResponse>(
      this.withQuery(`/graph/v1/paper/${encodeURIComponent(paperId)}/references`, {
        fields: params.fields,
        limit: params.limit,
        offset: params.offset,
      })
    );
  }

  async batchGetPapers(paperIds: string[], fields?: string): Promise<(Paper | null)[]> {
    const response = await this.request<(Paper | null)[]>(
      this.withQuery('/graph/v1/paper/batch', { fields }),
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
    return this.request<AuthorSearchResponse>(
      this.withQuery('/graph/v1/author/search', {
        query: params.query,
        fields: params.fields,
        limit: params.limit,
        offset: params.offset,
      })
    );
  }

  async getAuthor(authorId: string, fields?: string): Promise<Author> {
    return this.request<Author>(
      this.withQuery(`/graph/v1/author/${encodeURIComponent(authorId)}`, {
        fields,
      })
    );
  }

  async getAuthorPapers(authorId: string, params: {
    fields?: string;
    limit?: number;
    offset?: number;
  }): Promise<AuthorPapersResponse> {
    return this.request<AuthorPapersResponse>(
      this.withQuery(`/graph/v1/author/${encodeURIComponent(authorId)}/papers`, {
        fields: params.fields,
        limit: params.limit,
        offset: params.offset,
      })
    );
  }

  // ========== 推荐 API ==========

  async getRecommendations(params: {
    positivePaperIds: string[];
    negativePaperIds?: string[];
    fields?: string;
    limit?: number;
  }): Promise<RecommendationsResponse> {
    return this.request<RecommendationsResponse>(
      this.withQuery('/recommendations/v1/papers', {
        fields: params.fields,
        limit: params.limit,
      }),
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
