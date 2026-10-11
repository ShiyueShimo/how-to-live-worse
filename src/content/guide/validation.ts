import { z } from 'zod';
import { costTypes, resourceTypes, riskClasses } from './types';

const GuideSourceEntrySchema = z.object({
  id: z.string().regex(/^\d{2}-\d{3}$/),
  chapterId: z.string().regex(/^\d{2}$/),
  chapterNumber: z.number().int().positive(),
  entryNumber: z.number().int().positive(),
  title: z.string().min(1),
  englishTitle: z.string().min(1),
  originalText: z.string().min(1),
  englishText: z.string().min(1),
  costs: z.array(z.enum(costTypes)),
  costSummary: z.string().min(1),
  benefits: z.array(z.enum(resourceTypes)).min(1),
  benefitSummary: z.string().min(1),
  evidenceGrade: z.enum(['A', 'B', 'C']),
  applicability: z.string().min(1),
  authorNotes: z.string(),
  references: z.array(z.string()),
  sources: z.array(z.object({ label: z.string().min(1), url: z.union([z.string().url(), z.null()]) })).min(1),
  riskClass: z.enum(riskClasses),
  chapterSourceUrl: z.string().url(),
  translationSource: z.enum(['maintainer-edition', 'site-translation']),
});

const SourceManifestSchema = z.object({
  repositoryUrl: z.string().url(),
  commitSha: z.string().regex(/^[a-f\d]{40}$/i),
  capturedAt: z.string().date(),
  chapterCount: z.number().int().positive(),
  entryCount: z.number().int().positive(),
  contentLicense: z.object({
    name: z.literal('CC BY 4.0'),
    url: z.string().url(),
  }),
});

export type CorpusValidationResult = { valid: boolean; errors: string[] };

export function validateGuideCorpus(entries: unknown[], manifest: unknown): CorpusValidationResult {
  const errors: string[] = [];
  const seenIds = new Set<string>();
  const chapterIds = new Set<string>();

  entries.forEach((entry, index) => {
    const candidate = typeof entry === 'object' && entry !== null ? entry : {};
    const candidateId = 'id' in candidate && typeof candidate.id === 'string' ? candidate.id : `row ${index + 1}`;
    if (typeof candidateId === 'string' && seenIds.has(candidateId)) {
      errors.push(`${candidateId}: duplicate guide ID.`);
    }
    if (typeof candidateId === 'string' && candidateId !== `row ${index + 1}`) {
      seenIds.add(candidateId);
    }
    const parsedEntry = GuideSourceEntrySchema.safeParse(entry);

    if (!parsedEntry.success) {
      for (const issue of parsedEntry.error.issues) {
        const field = issue.path.join('.') || 'record';
        errors.push(`${candidateId}: invalid ${field} — ${issue.message}`);
      }
      return;
    }

    chapterIds.add(parsedEntry.data.chapterId);
  });

  const parsedManifest = SourceManifestSchema.safeParse(manifest);
  if (!parsedManifest.success) {
    for (const issue of parsedManifest.error.issues) {
      errors.push(`manifest ${issue.path.join('.') || 'record'}: ${issue.message}`);
    }
  } else {
    if (parsedManifest.data.entryCount !== entries.length) {
      errors.push(`manifest entryCount ${parsedManifest.data.entryCount} does not match parsed ${entries.length}.`);
    }
    if (parsedManifest.data.chapterCount !== chapterIds.size) {
      errors.push(`manifest chapterCount ${parsedManifest.data.chapterCount} does not match parsed ${chapterIds.size}.`);
    }
  }

  return { valid: errors.length === 0, errors };
}
