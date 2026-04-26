import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { SemanticScholarClient } from '../src/api/client.js';

describe('SemanticScholarClient', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('should preserve zero-value pagination parameters in query string', async () => {
    const fetchMock = vi.fn(async () =>
      new Response(JSON.stringify({ total: 0, data: [] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );
    global.fetch = fetchMock as typeof fetch;

    const client = new SemanticScholarClient();
    await client.searchPapers({
      query: 'test',
      limit: 0,
      offset: 0,
    });

    const calledUrl = fetchMock.mock.calls[0][0] as string;
    expect(calledUrl).toContain('query=test');
    expect(calledUrl).toContain('limit=0');
    expect(calledUrl).toContain('offset=0');
  });


  it('should ignore empty query values when building URLs', async () => {
    const fetchMock = vi.fn(async () =>
      new Response(JSON.stringify({ total: 0, data: [] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );
    global.fetch = fetchMock as typeof fetch;

    const client = new SemanticScholarClient();
    await client.searchPapers({
      query: 'test',
      fields: '',
      fieldsOfStudy: ['Computer Science', ''],
    });

    const calledUrl = fetchMock.mock.calls[0][0] as string;
    expect(calledUrl).not.toContain('fields=');
    expect(calledUrl).toContain('fieldsOfStudy=Computer+Science');
    expect(calledUrl).not.toContain('%2C');
  });

  it('should retry when receives 429 and eventually succeed', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response('rate limited', { status: 429 }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ paperId: 'p1', title: 'ok' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );
    global.fetch = fetchMock as typeof fetch;

    const timeoutSpy = vi.spyOn(global, 'setTimeout').mockImplementation(((fn: () => void) => {
      fn();
      return 0 as unknown as ReturnType<typeof setTimeout>;
    }) as typeof setTimeout);

    const client = new SemanticScholarClient();
    const result = await client.getPaper('p1');

    expect(result.paperId).toBe('p1');
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(timeoutSpy).toHaveBeenCalled();
  });
});
