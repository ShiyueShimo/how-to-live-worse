import type { GuideFilters, GuideSearchRecord } from './types';

function normalizeSearchText(value: string): string {
  return value.normalize('NFKC').toLocaleLowerCase('en');
}

export function createGuideSearch(catalogRecords: GuideSearchRecord[]) {
  const searchIndex = new Map(catalogRecords.map((record) => [record.id, normalizeSearchText(record.searchText)]));

  function searchGuideRecords(filters: GuideFilters): GuideSearchRecord[] {
    const queryTokens = filters.query
      ? normalizeSearchText(filters.query).split(/\s+/).filter(Boolean)
      : [];

    return catalogRecords.filter((record) => {
      if (filters.chapterId && record.chapterId !== filters.chapterId) return false;
      if (filters.evidenceGrade && record.evidenceGrade !== filters.evidenceGrade) return false;
      if (filters.resource && !record.benefits.includes(filters.resource)) return false;
      if (filters.cost && !record.costs.includes(filters.cost)) return false;
      if (filters.safeOnly && record.riskClass !== 'low') return false;
      const searchableText = searchIndex.get(record.id) ?? '';
      return queryTokens.every((token) => searchableText.includes(token));
    });
  }

  function resolveGuideReference(id: string, filters: GuideFilters) {
    const record = catalogRecords.find((candidate) => candidate.id === id);
    if (!record) return undefined;
    const visible = searchGuideRecords(filters).some((candidate) => candidate.id === id);
    return { record, filtersCleared: !visible };
  }

  function findGuideRecordSummary(id: string): GuideSearchRecord | undefined {
    return catalogRecords.find((record) => record.id === id);
  }

  return { searchGuideRecords, resolveGuideReference, findGuideRecordSummary };
}
