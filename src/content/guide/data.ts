import chaptersJson from './chapters.json';
import manifestJson from './source/manifest.json';
import type { GuideChapter, SourceManifest } from './types';

export const guideChapters = chaptersJson as GuideChapter[];
export const guideManifest = manifestJson as SourceManifest;
