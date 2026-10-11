import { useEffect, useState } from 'react';
import { guideManifest } from '@/content/guide/data';
import type { GuideSearchRecord } from '@/content/guide/types';

type CatalogState = { records?: GuideSearchRecord[]; loading: boolean; error?: string };

function parseSearchCatalog(value: unknown): GuideSearchRecord[] {
  if (!Array.isArray(value)) throw new Error('The full-text guide index is not a list.');
  if (value.length !== guideManifest.entryCount) throw new Error(`The full-text guide index has ${value.length} records; ${guideManifest.entryCount} are required.`);

  return value.map((item, index) => {
    if (typeof item !== 'object' || item === null) throw new Error(`Search-index row ${index + 1} is not an object.`);
    const record = item as Partial<GuideSearchRecord>;
    if (typeof record.id !== 'string' || !/^\d{2}-\d{3}$/.test(record.id)) throw new Error(`Search-index row ${index + 1} has an invalid guide ID.`);
    if (typeof record.searchText !== 'string' || !Array.isArray(record.costs) || !Array.isArray(record.benefits) || typeof record.riskClass !== 'string') {
      throw new Error(`Search-index record ${record.id} is missing filter or search fields.`);
    }
    return record as GuideSearchRecord;
  });
}

export function useGuideCatalog(enabled: boolean) {
  const [state, setState] = useState<CatalogState>({ loading: false });

  useEffect(() => {
    if (!enabled) return;
    let current = true;
    setState({ loading: true });
    fetch('/data/guide-catalog.json')
      .then((response) => {
        if (!response.ok) throw new Error(`Guide index request failed (${response.status}).`);
        return response.json() as Promise<unknown>;
      })
      .then(parseSearchCatalog)
      .then((records) => { if (current) setState({ records, loading: false }); })
      .catch((error: unknown) => {
        if (current) setState({ loading: false, error: error instanceof Error ? error.message : 'Could not read the guide index.' });
      });
    return () => { current = false; };
  }, [enabled]);

  return state;
}
