import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { guideManifest } from '../src/content/guide/data';
import { readZipArchive } from './zip';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const downloadsRoot = path.join(root, 'public/downloads');
const expectedFiles = [
  'howtoliveworse-guide.md',
  'howtoliveworse-guide.html',
  'howtoliveworse-guide.docx',
  'howtoliveworse-guide.epub',
  'howtoliveworse-guide-anki.tsv',
  'howtoliveworse-guide.json',
];

for (const filename of expectedFiles) {
  const filePath = path.join(downloadsRoot, filename);
  const fileStats = await stat(filePath);
  if (!fileStats.isFile() || fileStats.size === 0)
    throw new Error(`Export ${filename} is empty or missing.`);
  if (filename.endsWith('.docx') || filename.endsWith('.epub')) {
    const contents = readZipArchive(await readFile(filePath));
    if (!contents.size) throw new Error(`Export ${filename} has no ZIP parts.`);
    if (filename.endsWith('.docx') && !contents.has('word/document.xml'))
      throw new Error('DOCX export is missing word/document.xml.');
    if (
      filename.endsWith('.epub') &&
      contents.get('mimetype')?.toString() !== 'application/epub+zip'
    )
      throw new Error('EPUB export has an invalid mimetype entry.');
    const metadata = filename.endsWith('.docx')
      ? contents.get('word/document.xml')?.toString()
      : contents.get('OEBPS/package.opf')?.toString();
    if (
      guideManifest.translation &&
      !metadata?.includes(guideManifest.translation.commitSha)
    )
      throw new Error(
        `${filename} is missing the pinned English translation attribution.`
      );
  }
  if (
    ['.md', '.html', '.tsv'].some((extension) =>
      filename.endsWith(extension)
    ) &&
    guideManifest.translation
  ) {
    const contents = await readFile(filePath, 'utf8');
    if (!contents.includes(guideManifest.translation.commitSha))
      throw new Error(
        `${filename} is missing the pinned English translation attribution.`
      );
  }
  if (filename.endsWith('.json')) {
    const catalog = JSON.parse(await readFile(filePath, 'utf8')) as {
      manifest?: { commitSha?: string; translation?: { commitSha?: string } };
      chapters?: unknown[];
      entries?: unknown[];
    };
    if (
      catalog.manifest?.commitSha !== guideManifest.commitSha ||
      catalog.manifest.translation?.commitSha !==
        guideManifest.translation?.commitSha ||
      !Array.isArray(catalog.chapters) ||
      catalog.chapters.length !== guideManifest.chapterCount ||
      !Array.isArray(catalog.entries) ||
      catalog.entries.length !== guideManifest.entryCount ||
      !catalog.entries.every(
        (entry) =>
          typeof entry === 'object' &&
          entry !== null &&
          'englishText' in entry &&
          'originalText' in entry
      )
    )
      throw new Error(
        `JSON export does not contain all ${guideManifest.entryCount} full source entries.`
      );
  }
  console.log(`${filename}: ${fileStats.size} bytes`);
}

const fullIndex = await readFile(
  path.join(root, 'public/llms-full.txt'),
  'utf8'
);
if (
  !fullIndex.includes(`${guideManifest.entryCount} source entries`) ||
  !fullIndex.includes(guideManifest.commitSha)
)
  throw new Error(
    'Full AI-readable index is missing the complete attributed source snapshot.'
  );
console.log(`public/llms-full.txt: ${Buffer.byteLength(fullIndex)} bytes`);
