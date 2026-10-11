import type { GuideRecord } from './types';
import { loadGuideChapterRecords, loadGuideRecord } from './chapter-loader';

const chapterLoaders = import.meta.glob<GuideRecord[]>('./chapter-records/*.json', {
  import: 'default',
});

export function getGuideChapterRecords(chapterId: string): Promise<GuideRecord[]> {
  return loadGuideChapterRecords(chapterId, chapterLoaders);
}

export function getGuideRecord(id: string): Promise<GuideRecord | undefined> {
  return loadGuideRecord(id, chapterLoaders);
}
