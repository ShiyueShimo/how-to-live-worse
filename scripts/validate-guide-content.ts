import chaptersJson from '../src/content/guide/chapters.json';
import entriesJson from '../src/content/guide/entries.json';
import manifestJson from '../src/content/guide/source/manifest.json';
import type { GuideChapter, GuideRecord, SourceManifest } from '../src/content/guide/types';
import { validateGuideCorpus } from '../src/content/guide/validation';

const guideChapters = chaptersJson as GuideChapter[];
const guideManifest = manifestJson as SourceManifest;
const guideRecords = entriesJson as GuideRecord[];
const sourceRecords = guideRecords.map(({ inversion: _inversion, ...entry }) => entry);
const validation = validateGuideCorpus(sourceRecords, guideManifest);
const duplicateInversions = guideRecords.filter((record) => record.inversion.id !== record.id);
const missingChapterEntries = guideChapters.flatMap((chapter) =>
  chapter.entryIds.filter((entryId) => !guideRecords.some((record) => record.id === entryId)),
);

const errors = [
  ...validation.errors,
  ...duplicateInversions.map((record) => `${record.id}: inversion ID does not match the source ID.`),
  ...missingChapterEntries.map((entryId) => `${entryId}: chapter index points to a missing guide record.`),
];

if (guideRecords.length !== guideManifest.entryCount) {
  errors.push(`Loaded ${guideRecords.length} records; manifest requires ${guideManifest.entryCount}.`);
}
if (guideChapters.length !== guideManifest.chapterCount) {
  errors.push(`Loaded ${guideChapters.length} chapters; manifest requires ${guideManifest.chapterCount}.`);
}

if (errors.length > 0) {
  throw new Error(`Guide content validation failed:\n${errors.join('\n')}`);
}

console.log(`Guide content valid: ${guideChapters.length} chapters, ${guideRecords.length} source entries and inversions.`);
