import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import chaptersJson from '../src/content/guide/chapters.json';
import entriesJson from '../src/content/guide/entries.json';
import {
  createAnkiTsv,
  createGuideHtml,
  createGuideJson,
  createGuideMarkdown,
} from '../src/content/guide/exports';
import manifestJson from '../src/content/guide/source/manifest.json';
import type {
  GuideChapter,
  GuideRecord,
  SourceManifest,
} from '../src/content/guide/types';
import { createZipArchive, readZipArchive } from './zip';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const entries = entriesJson as GuideRecord[];
const chapters = chaptersJson as GuideChapter[];
const manifest = manifestJson as SourceManifest;

function xmlText(value: string): string {
  return value
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function xhtmlText(value: string): string {
  return xmlText(value).replaceAll('\r\n', '\n').replaceAll('\n', '<br/>');
}

function sourceLinkMarkup(entry: GuideRecord): string {
  return entry.sources
    .map((source) => {
      const url =
        source.url && /^https?:\/\//i.test(source.url) ? source.url : undefined;
      return url
        ? `<a href="${xmlText(url)}">${xmlText(source.label)}</a>`
        : xmlText(source.label);
    })
    .join('; ');
}

function wordParagraph(text: string, style?: string): string {
  const styleTag = style ? `<w:pPr><w:pStyle w:val="${style}"/></w:pPr>` : '';
  const runs = text
    .split(/\r?\n/)
    .map(
      (line) => `<w:r><w:t xml:space="preserve">${xmlText(line)}</w:t></w:r>`
    )
    .join('<w:r><w:br/></w:r>');
  return `<w:p>${styleTag}${runs}</w:p>`;
}

function createDocx(): Buffer {
  const paragraphs = [
    wordParagraph('HowToLiveWorse — the complete offline edition', 'Title'),
    wordParagraph(
      `Source: ${manifest.repositoryUrl} at commit ${manifest.commitSha}.`
    ),
    wordParagraph(
      `${manifest.chapterCount} chapters · ${manifest.entryCount} source entries · captured ${manifest.capturedAt}.`
    ),
    wordParagraph(
      `Upstream content license: ${manifest.contentLicense.name} (${manifest.contentLicense.url}).`
    ),
    ...(manifest.translation
      ? [
          wordParagraph(
            `English translation: ${manifest.translation.repositoryUrl} at commit ${manifest.translation.commitSha}; maintained by ${manifest.translation.maintainer}; ${manifest.translation.license.name} (${manifest.translation.license.url}).`
          ),
        ]
      : []),
    wordParagraph(
      'This edition pairs source material with original satirical reversals. Serious topics retain their factual notes. The satire is not advice.'
    ),
  ];

  for (const chapter of chapters) {
    paragraphs.push(
      wordParagraph(`${chapter.id}. ${chapter.englishTitle}`, 'Heading1'),
      wordParagraph(`Original chapter title: ${chapter.title}`),
      wordParagraph(chapter.summary)
    );
    for (const entry of entries.filter(
      (candidate) => candidate.chapterId === chapter.id
    )) {
      paragraphs.push(
        wordParagraph(`${entry.id} — ${entry.englishTitle}`, 'Heading2'),
        wordParagraph(`Original title: ${entry.title}`),
        wordParagraph(`Source text (English): ${entry.englishText}`),
        wordParagraph(`Original text (Chinese): ${entry.originalText}`),
        wordParagraph(
          `Evidence ${entry.evidenceGrade}. Applicability: ${entry.applicability}`
        ),
        wordParagraph(`Source summary: ${entry.benefitSummary}`),
        wordParagraph(`Low-ROI detour: ${entry.inversion.headline}`),
        wordParagraph(entry.inversion.rationalization),
        wordParagraph(`Immediate reward: ${entry.inversion.immediateReward}`),
        wordParagraph(
          `Possible trade-off: ${entry.inversion.possibleTradeoff}`
        ),
        wordParagraph(`Back to the facts: ${entry.inversion.recoveryLink}`),
        wordParagraph(
          `References: ${entry.references.join('; ') || 'See the chapter source.'}`
        ),
        wordParagraph(
          `Source links: ${entry.sources.map((source) => `${source.label}${source.url && /^https?:\/\//i.test(source.url) ? ` — ${source.url}` : ''}`).join('; ')}`
        ),
        wordParagraph(`Chapter source: ${entry.chapterSourceUrl}`)
      );
    }
  }

  const document = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${paragraphs.join('')}<w:sectPr><w:pgSz w:w="12240" w:h="15840"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/></w:sectPr></w:body></w:document>`;
  const styles = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:rPr><w:sz w:val="22"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:rPr><w:b/><w:sz w:val="36"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:rPr><w:b/><w:sz w:val="30"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="heading 2"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:rPr><w:b/><w:sz w:val="25"/></w:rPr></w:style></w:styles>`;

  return createZipArchive([
    {
      name: '[Content_Types].xml',
      contents: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/></Types>`,
    },
    {
      name: '_rels/.rels',
      contents: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/></Relationships>`,
    },
    { name: 'word/document.xml', contents: document },
    { name: 'word/styles.xml', contents: styles },
    {
      name: 'word/_rels/document.xml.rels',
      contents: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`,
    },
    {
      name: 'docProps/core.xml',
      contents: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>HowToLiveWorse — complete offline edition</dc:title><dc:creator>HowToLiveWorse independent project</dc:creator><dc:source>${xmlText(manifest.repositoryUrl)} at ${xmlText(manifest.commitSha)}</dc:source>${manifest.translation ? `<dc:source>${xmlText(manifest.translation.repositoryUrl)} at ${xmlText(manifest.translation.commitSha)}; ${xmlText(manifest.translation.license.name)}; maintained by ${xmlText(manifest.translation.maintainer)}</dc:source>` : ''}<dc:rights>${xmlText(manifest.contentLicense.name)} ${xmlText(manifest.contentLicense.url)}</dc:rights>${manifest.translation ? `<dc:rights>English translation by ${xmlText(manifest.translation.maintainer)}: ${xmlText(manifest.translation.license.name)} ${xmlText(manifest.translation.license.url)}</dc:rights>` : ''}<dcterms:modified xsi:type="dcterms:W3CDTF">${xmlText(manifest.capturedAt)}T00:00:00Z</dcterms:modified></cp:coreProperties>`,
    },
  ]);
}

function createEpub(): Buffer {
  const navigation = chapters
    .map(
      (chapter) =>
        `<li><a href="chapter-${chapter.id}.xhtml">${xmlText(chapter.englishTitle)}</a></li>`
    )
    .join('');
  const chapterFiles = chapters.map((chapter) => {
    const chapterEntries = entries
      .filter((entry) => entry.chapterId === chapter.id)
      .map(
        (entry) =>
          `<article id="${xmlText(entry.id)}"><h2>${xmlText(entry.id)} — ${xmlText(entry.englishTitle)}</h2><p lang="zh">${xhtmlText(entry.title)}</p><p><strong>Source text (English):</strong><br/>${xhtmlText(entry.englishText)}</p><p lang="zh"><strong>Original text (Chinese):</strong><br/>${xhtmlText(entry.originalText)}</p><p><strong>Evidence ${xmlText(entry.evidenceGrade)} · Applicability:</strong> ${xhtmlText(entry.applicability)}</p><p><strong>Source summary:</strong> ${xhtmlText(entry.benefitSummary)}</p><section><h3>${xhtmlText(entry.inversion.headline)}</h3><p>${xhtmlText(entry.inversion.rationalization)}</p><p>${xhtmlText(entry.inversion.immediateReward)}</p><p><strong>Possible trade-off:</strong> ${xhtmlText(entry.inversion.possibleTradeoff)}</p><p><strong>Back to the facts:</strong> ${xhtmlText(entry.inversion.recoveryLink)}</p></section><p><strong>Source links:</strong> ${sourceLinkMarkup(entry)}</p><p><strong>Chapter source:</strong> <a href="${xmlText(entry.chapterSourceUrl)}">${xmlText(entry.chapterSourceUrl)}</a></p></article>`
      )
      .join('');
    const contents = `<?xml version="1.0" encoding="UTF-8"?><html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en"><head><title>${xmlText(chapter.englishTitle)}</title><link rel="stylesheet" type="text/css" href="styles.css"/></head><body><h1>${xmlText(chapter.id)}. ${xmlText(chapter.englishTitle)}</h1><p lang="zh">${xhtmlText(chapter.title)}</p><p>${xhtmlText(chapter.summary)}</p>${chapterEntries}</body></html>`;
    return { name: `OEBPS/chapter-${chapter.id}.xhtml`, contents };
  });
  const manifestItems = chapters
    .map(
      (chapter) =>
        `<item id="chapter-${chapter.id}" href="chapter-${chapter.id}.xhtml" media-type="application/xhtml+xml"/>`
    )
    .join('');
  const spineItems = chapters
    .map((chapter) => `<itemref idref="chapter-${chapter.id}"/>`)
    .join('');
  const packageFile = `<?xml version="1.0" encoding="UTF-8"?><package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="book-id" xml:lang="en"><metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:identifier id="book-id">urn:uuid:77d3ca62-a7bf-42e7-bb38-c190bf506675</dc:identifier><dc:title>HowToLiveWorse — complete offline edition</dc:title><dc:language>en</dc:language><dc:creator>HowToLiveWorse independent project</dc:creator><dc:source>${xmlText(manifest.repositoryUrl)} at ${xmlText(manifest.commitSha)}</dc:source>${manifest.translation ? `<dc:source>${xmlText(manifest.translation.repositoryUrl)} at ${xmlText(manifest.translation.commitSha)}; ${xmlText(manifest.translation.license.name)}; maintained by ${xmlText(manifest.translation.maintainer)}</dc:source>` : ''}<dc:rights>${xmlText(manifest.contentLicense.name)} ${xmlText(manifest.contentLicense.url)}</dc:rights>${manifest.translation ? `<dc:rights>English translation by ${xmlText(manifest.translation.maintainer)}: ${xmlText(manifest.translation.license.name)} ${xmlText(manifest.translation.license.url)}</dc:rights>` : ''}<meta property="dcterms:modified">${xmlText(manifest.capturedAt)}T00:00:00Z</meta></metadata><manifest><item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/><item id="styles" href="styles.css" media-type="text/css"/>${manifestItems}</manifest><spine>${spineItems}</spine></package>`;

  return createZipArchive([
    { name: 'mimetype', contents: 'application/epub+zip', store: true },
    {
      name: 'META-INF/container.xml',
      contents: `<?xml version="1.0" encoding="UTF-8"?><container xmlns="urn:oasis:names:tc:opendocument:xmlns:container" version="1.0"><rootfiles><rootfile full-path="OEBPS/package.opf" media-type="application/oebps-package+xml"/></rootfiles></container>`,
    },
    { name: 'OEBPS/package.opf', contents: packageFile },
    {
      name: 'OEBPS/nav.xhtml',
      contents: `<?xml version="1.0" encoding="UTF-8"?><html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="en"><head><title>Contents</title></head><body><nav epub:type="toc"><h1>Contents</h1><ol>${navigation}</ol></nav></body></html>`,
    },
    {
      name: 'OEBPS/styles.css',
      contents:
        'body{font-family:serif;line-height:1.5;margin:5%}article{margin:2em 0;padding-top:1em;border-top:1px solid #888}section{border-left:3px solid #789020;padding-left:1em}',
    },
    ...chapterFiles,
  ]);
}

async function main() {
  if (
    entries.length !== manifest.entryCount ||
    chapters.length !== manifest.chapterCount
  )
    throw new Error(
      `Cannot export ${entries.length} entries and ${chapters.length} chapters; manifest requires ${manifest.entryCount} and ${manifest.chapterCount}.`
    );
  const downloadsRoot = path.join(root, 'public/downloads');
  await mkdir(downloadsRoot, { recursive: true });
  const outputs = new Map([
    [
      'howtoliveworse-guide.md',
      Buffer.from(createGuideMarkdown(manifest, chapters, entries)),
    ],
    [
      'howtoliveworse-guide.html',
      Buffer.from(createGuideHtml(manifest, chapters, entries)),
    ],
    ['howtoliveworse-guide.docx', createDocx()],
    ['howtoliveworse-guide.epub', createEpub()],
    [
      'howtoliveworse-guide-anki.tsv',
      Buffer.from(createAnkiTsv(manifest, entries)),
    ],
    [
      'howtoliveworse-guide.json',
      Buffer.from(createGuideJson(manifest, chapters, entries)),
    ],
  ]);
  for (const [filename, contents] of outputs) {
    if (filename.endsWith('.docx') || filename.endsWith('.epub'))
      readZipArchive(contents);
    await writeFile(path.join(downloadsRoot, filename), contents);
  }
  await writeFile(
    path.join(root, 'public/llms-full.txt'),
    createGuideMarkdown(manifest, chapters, entries)
  );
  console.log(
    `Generated six offline files and the full AI-readable index for ${entries.length} entries in ${chapters.length} chapters.`
  );
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
)
  await main();
