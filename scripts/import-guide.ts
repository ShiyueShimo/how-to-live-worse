import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseGuideChapterMarkdown } from '../src/content/guide/markdown';
import type { GuideRecord, GuideSourceEntry, LowRoiInversion, SourceManifest } from '../src/content/guide/types';
import { validateGuideCorpus } from '../src/content/guide/validation';

const projectRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const guideRoot = path.join(projectRoot, 'src/content/guide');
const sourceRoot = path.join(guideRoot, 'source');
const chapterRoot = path.join(sourceRoot, 'chapters');
const translationRoot = path.join(sourceRoot, 'translations');
function entryCostCue(entry: GuideSourceEntry): string {
  if (entry.costs.length === 0) return 'the effort of changing a familiar routine';
  const cues = entry.costs.map((cost) => {
    if (cost === 'money') return 'a little money';
    if (cost === 'time') return 'a few minutes';
    if (cost === 'energy') return 'some energy';
    return 'a bit of persistence';
  });
  return cues.join(', ');
}

function inversionFor(entry: GuideSourceEntry): LowRoiInversion {
  const rationalizations = [
    'There is no immediate alarm, so the sensible choice can wait for a less busy week.',
    'Future Me has a clearer calendar, more patience, and apparently the same responsibilities.',
    'If I do not open the notes, no new task has technically appeared.',
    'One more exception feels free because the bill arrives outside the current scene.',
    'I can spend longer deciding whether to start than the small action would take.',
    'The routine already works until the day the source says it may not.',
  ];
  const order = Number(entry.id.replace('-', '')) % rationalizations.length;
  const safetyNote = entry.riskClass === 'low'
    ? 'Open the original entry, check who the evidence applies to, then pick one small step that fits.'
    : 'Use the original facts and limits. For an urgent medical, safety, financial, or legal issue, contact a qualified local professional or service.';

  return {
    id: entry.id,
    headline: `Move “${entry.englishTitle}” to Future Me's calendar`,
    rationalization: rationalizations[order],
    immediateReward: `Today I keep ${entryCostCue(entry)} and avoid interrupting my default routine.`,
    possibleTradeoff: `The source summarizes the return this way: “${entry.benefitSummary}” Evidence grade ${entry.evidenceGrade}. The original states the population, caveats, and sources; this is not a personal forecast.`,
    recoveryLink: safetyNote,
  };
}

function assembleRecords(entries: GuideSourceEntry[]): GuideRecord[] {
  return entries.map((entry) => ({ ...entry, inversion: inversionFor(entry) }));
}

export async function parseGuideSnapshot(): Promise<{
  manifest: SourceManifest;
  chapters: Awaited<ReturnType<typeof parseGuideChapterMarkdown>>['chapter'][];
  entries: GuideSourceEntry[];
}> {
  const manifest = JSON.parse(await readFile(path.join(sourceRoot, 'manifest.json'), 'utf8')) as SourceManifest;
  const fallbackTranslations = JSON.parse(await readFile(path.join(sourceRoot, 'english-overrides.json'), 'utf8'));
  const sourceFiles = (await readdir(chapterRoot)).filter((name) => name.endsWith('.md')).sort();
  const translationFiles = (await readdir(translationRoot)).filter((name) => name.endsWith('.md'));

  if (sourceFiles.length !== manifest.chapterCount) {
    throw new Error(`Pinned source has ${sourceFiles.length} Markdown chapters; manifest requires ${manifest.chapterCount}.`);
  }

  const chapters: Awaited<ReturnType<typeof parseGuideChapterMarkdown>>['chapter'][] = [];
  const entries: GuideSourceEntry[] = [];
  for (const sourceFileName of sourceFiles) {
    const chapterNumber = Number(/^\d+/.exec(sourceFileName)?.[0]);
    const translationFileName = translationFiles.find((name) => Number(/^\d+/.exec(name)?.[0]) === chapterNumber);
    const parsed = parseGuideChapterMarkdown({
      sourceFileName,
      sourceMarkdown: await readFile(path.join(chapterRoot, sourceFileName), 'utf8'),
      translationFileName,
      translationMarkdown: translationFileName ? await readFile(path.join(translationRoot, translationFileName), 'utf8') : undefined,
      commitSha: manifest.commitSha,
      fallbackTranslations,
    });
    chapters.push(parsed.chapter);
    entries.push(...parsed.entries);
  }

  const validation = validateGuideCorpus(entries, manifest);
  if (!validation.valid) {
    throw new Error(`Pinned guide snapshot is invalid:\n${validation.errors.join('\n')}`);
  }

  return { manifest, chapters, entries };
}

async function main() {
  const snapshot = await parseGuideSnapshot();
  const records = assembleRecords(snapshot.entries);
  const chapterRecordRoot = path.join(guideRoot, 'chapter-records');
  const publicDataRoot = path.join(projectRoot, 'public', 'data');
  await mkdir(chapterRecordRoot, { recursive: true });
  await mkdir(publicDataRoot, { recursive: true });
  await writeFile(path.join(guideRoot, 'entries.json'), `${JSON.stringify(records, null, 2)}\n`);
  await writeFile(path.join(guideRoot, 'chapters.json'), `${JSON.stringify(snapshot.chapters, null, 2)}\n`);
  const catalog = records.map(({ originalText, englishText, ...record }) => ({
    ...record,
    searchText: [record.title, record.englishTitle, originalText, englishText, record.inversion.headline, record.inversion.rationalization].join('\n'),
  }));
  await writeFile(path.join(guideRoot, 'catalog.json'), `${JSON.stringify(catalog, null, 2)}\n`);
  await writeFile(path.join(publicDataRoot, 'guide-catalog.json'), `${JSON.stringify(catalog)}\n`);
  for (const chapter of snapshot.chapters) {
    const chapterRecords = records.filter((record) => record.chapterId === chapter.id);
    await writeFile(path.join(chapterRecordRoot, `${chapter.id}.json`), `${JSON.stringify(chapterRecords, null, 2)}\n`);
  }

  const translatedCount = snapshot.entries.filter((entry) => entry.translationSource === 'maintainer-edition').length;
  console.log(`Imported ${snapshot.chapters.length} chapters and ${records.length} entries (${translatedCount} maintainer translations; ${records.length - translatedCount} reviewed site translations).`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main();
}
