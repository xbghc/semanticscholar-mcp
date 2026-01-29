// 字段常量定义

export const DEFAULT_PAPER_FIELDS = [
  'paperId',
  'title',
  'abstract',
  'year',
  'authors',
  'citationCount',
  'url',
  'openAccessPdf'
];

export const DEFAULT_AUTHOR_FIELDS = [
  'authorId',
  'name',
  'affiliations',
  'paperCount',
  'citationCount',
  'hIndex'
];

export const DEFAULT_CITATION_FIELDS = [
  'paperId',
  'title',
  'year',
  'authors',
  'citationCount'
];

export const ALL_PAPER_FIELDS = [
  'paperId',
  'corpusId',
  'externalIds',
  'url',
  'title',
  'abstract',
  'venue',
  'year',
  'referenceCount',
  'citationCount',
  'influentialCitationCount',
  'isOpenAccess',
  'openAccessPdf',
  'fieldsOfStudy',
  's2FieldsOfStudy',
  'publicationTypes',
  'publicationDate',
  'journal',
  'authors'
];

export const ALL_AUTHOR_FIELDS = [
  'authorId',
  'externalIds',
  'url',
  'name',
  'affiliations',
  'homepage',
  'paperCount',
  'citationCount',
  'hIndex'
];

export function buildFieldsParam(fields?: string[], defaultFields: string[] = DEFAULT_PAPER_FIELDS): string {
  return (fields && fields.length > 0 ? fields : defaultFields).join(',');
}
