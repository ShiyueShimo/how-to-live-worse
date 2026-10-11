export const resourceTypes = ['lifespan', 'time-energy', 'money', 'freedom'] as const;
export type ResourceType = (typeof resourceTypes)[number];

export const costTypes = ['money', 'time', 'energy', 'persistence'] as const;
export type CostType = (typeof costTypes)[number];

export const riskClasses = [
  'low',
  'health',
  'emergency',
  'children',
  'crisis',
  'financial',
  'legal',
  'personal-safety',
] as const;
export type RiskClass = (typeof riskClasses)[number];

export type GuideSourceLink = {
  label: string;
  url: string | null;
};

export type GuideSourceEntry = {
  id: string;
  chapterId: string;
  chapterNumber: number;
  entryNumber: number;
  title: string;
  englishTitle: string;
  originalText: string;
  englishText: string;
  costs: CostType[];
  costSummary: string;
  benefits: ResourceType[];
  benefitSummary: string;
  evidenceGrade: 'A' | 'B' | 'C';
  applicability: string;
  authorNotes: string;
  references: string[];
  sources: GuideSourceLink[];
  riskClass: RiskClass;
  chapterSourceUrl: string;
  translationSource: 'maintainer-edition' | 'site-translation';
};

export type LowRoiInversion = {
  id: string;
  headline: string;
  rationalization: string;
  immediateReward: string;
  possibleTradeoff: string;
  recoveryLink: string;
};

export type GuideRecord = GuideSourceEntry & { inversion: LowRoiInversion };

export type GuideSearchRecord = Omit<GuideRecord, 'originalText' | 'englishText'> & {
  searchText: string;
};

export type GuideChapter = {
  id: string;
  number: number;
  title: string;
  englishTitle: string;
  summary: string;
  entryIds: string[];
  sourcePath: string;
};

export type SourceManifest = {
  repositoryUrl: string;
  commitSha: string;
  capturedAt: string;
  chapterCount: number;
  entryCount: number;
  contentLicense: { name: 'CC BY 4.0'; url: string };
  translation?: {
    repositoryUrl: string;
    commitSha: string;
    capturedAt: string;
    reportedEntryCount: number;
    license: { name: 'CC BY 4.0'; url: string };
    maintainer: string;
  };
};

export type GuideFilters = {
  query?: string;
  chapterId?: string;
  evidenceGrade?: 'A' | 'B' | 'C';
  resource?: ResourceType;
  cost?: CostType;
  safeOnly?: boolean;
};
