// Semantic Scholar API 类型定义

export interface Author {
  authorId: string;
  name: string;
  url?: string;
  affiliations?: string[];
  homepage?: string;
  paperCount?: number;
  citationCount?: number;
  hIndex?: number;
}

export interface ExternalIds {
  DOI?: string;
  ArXiv?: string;
  PMID?: string;
  PMCID?: string;
  MAG?: string;
  CorpusId?: number;
  ACL?: string;
}

export interface OpenAccessPdf {
  url: string;
  status: string;
}

export interface Journal {
  name?: string;
  pages?: string;
  volume?: string;
}

export interface Paper {
  paperId: string;
  corpusId?: number;
  externalIds?: ExternalIds;
  url?: string;
  title: string;
  abstract?: string;
  venue?: string;
  year?: number;
  referenceCount?: number;
  citationCount?: number;
  influentialCitationCount?: number;
  isOpenAccess?: boolean;
  openAccessPdf?: OpenAccessPdf;
  fieldsOfStudy?: string[];
  s2FieldsOfStudy?: Array<{ category: string; source: string }>;
  publicationTypes?: string[];
  publicationDate?: string;
  journal?: Journal;
  authors?: Author[];
}

export interface Citation {
  citingPaper: Paper;
  intents?: string[];
  contexts?: string[];
  isInfluential?: boolean;
}

export interface Reference {
  citedPaper: Paper;
  intents?: string[];
  contexts?: string[];
  isInfluential?: boolean;
}

export interface PaperSearchResponse {
  total: number;
  offset?: number;
  next?: number;
  data: Paper[];
}

export interface AuthorSearchResponse {
  total: number;
  offset?: number;
  next?: number;
  data: Author[];
}

export interface CitationsResponse {
  offset?: number;
  next?: number;
  data: Citation[];
}

export interface ReferencesResponse {
  offset?: number;
  next?: number;
  data: Reference[];
}

export interface AuthorPapersResponse {
  offset?: number;
  next?: number;
  data: Paper[];
}

export interface RecommendationsResponse {
  recommendedPapers: Paper[];
}

export interface BatchPapersResponse {
  data: (Paper | null)[];
}
