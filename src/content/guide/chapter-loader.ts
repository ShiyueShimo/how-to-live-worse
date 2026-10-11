import type { GuideRecord } from './types';

export type ChapterLoader = () => Promise<GuideRecord[]>;

export async function loadGuideChapterRecords(
  chapterId: string,
  chapterLoaders: Record<string, ChapterLoader>,
): Promise<GuideRecord[]> {
  const load = chapterLoaders[`./chapter-records/${chapterId}.json`];
  return load ? load() : [];
}

export async function loadGuideRecord(
  id: string,
  chapterLoaders: Record<string, ChapterLoader>,
): Promise<GuideRecord | undefined> {
  const chapterRecords = await loadGuideChapterRecords(id.slice(0, 2), chapterLoaders);
  return chapterRecords.find((record) => record.id === id);
}
