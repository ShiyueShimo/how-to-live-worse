import type { GuideChapter, GuideRecord, SourceManifest } from './types';

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function readableHtml(value: string): string {
  return escapeHtml(value).replaceAll('\r\n', '\n').replaceAll('\n', '<br>');
}

function safeSourceUrl(url: string | null): string | undefined {
  return url && /^https?:\/\//i.test(url) ? url : undefined;
}

function translationAttribution(manifest: SourceManifest): string | undefined {
  const translation = manifest.translation;
  return translation
    ? `English translation: ${translation.repositoryUrl} at commit ${translation.commitSha}; maintained by ${translation.maintainer}; ${translation.license.name} (${translation.license.url}).`
    : undefined;
}

function externalSourceLinks(record: GuideRecord): string {
  return record.sources
    .map((source) => {
      const url = safeSourceUrl(source.url);
      return url ? `[${source.label}](${url})` : source.label;
    })
    .join('; ');
}

export function createGuideMarkdown(
  manifest: SourceManifest,
  chapters: readonly GuideChapter[],
  entries: readonly GuideRecord[]
): string {
  const entriesByChapter = new Map<string, GuideRecord[]>();
  for (const entry of entries)
    entriesByChapter.set(entry.chapterId, [
      ...(entriesByChapter.get(entry.chapterId) ?? []),
      entry,
    ]);

  const lines = [
    '# HowToLiveWorse — the complete offline edition',
    '',
    `Source: ${manifest.repositoryUrl} at commit ${manifest.commitSha}.`,
    `Captured ${manifest.capturedAt}; ${manifest.chapterCount} chapters and ${manifest.entryCount} source entries.`,
    `Upstream content license: [${manifest.contentLicense.name}](${manifest.contentLicense.url}).`,
    ...(translationAttribution(manifest)
      ? [translationAttribution(manifest)!]
      : []),
    'This edition pairs source material with original satirical reversals. Serious, sensitive topics retain their factual source notes. The satire is not advice.',
    '',
    '---',
    '',
  ];

  for (const chapter of chapters) {
    lines.push(
      `## ${chapter.id}. ${chapter.englishTitle}`,
      '',
      `Original chapter title: ${chapter.title}`,
      '',
      chapter.summary,
      ''
    );
    for (const entry of entriesByChapter.get(chapter.id) ?? []) {
      lines.push(
        `### ${entry.id} — ${entry.englishTitle}`,
        '',
        `Original title: ${entry.title}`,
        '',
        `**Source text (English):** ${entry.englishText}`,
        '',
        `**Original text (Chinese):** ${entry.originalText}`,
        '',
        `**Evidence:** ${entry.evidenceGrade}. ${entry.applicability}`,
        '',
        `**Source summary:** ${entry.benefitSummary}`,
        '',
        `**Low-ROI detour:** ${entry.inversion.headline}`,
        '',
        entry.inversion.rationalization,
        '',
        `**Immediate reward:** ${entry.inversion.immediateReward}`,
        '',
        `**Possible trade-off:** ${entry.inversion.possibleTradeoff}`,
        '',
        `**Back to the facts:** ${entry.inversion.recoveryLink}`,
        '',
        `**References:** ${entry.references.join('; ') || 'See the chapter source.'}`,
        '',
        `**Source links:** ${externalSourceLinks(entry)}`,
        '',
        `**Chapter source:** ${entry.chapterSourceUrl}`,
        '',
        '---',
        ''
      );
    }
  }
  return `${lines.join('\n')}\n`;
}

export function createGuideHtml(
  manifest: SourceManifest,
  chapters: readonly GuideChapter[],
  entries: readonly GuideRecord[]
): string {
  const entriesByChapter = new Map<string, GuideRecord[]>();
  for (const entry of entries)
    entriesByChapter.set(entry.chapterId, [
      ...(entriesByChapter.get(entry.chapterId) ?? []),
      entry,
    ]);

  const chaptersHtml = chapters
    .map((chapter) => {
      const entriesHtml = (entriesByChapter.get(chapter.id) ?? [])
        .map(
          (entry) => `
      <article id="${escapeHtml(entry.id)}">
        <h2>${escapeHtml(entry.id)} — ${escapeHtml(entry.englishTitle)}</h2>
        <p lang="zh"><strong>原文标题：</strong>${readableHtml(entry.title)}</p>
        <p><strong>Source text (English):</strong><br>${readableHtml(entry.englishText)}</p>
        <p lang="zh"><strong>Original text (Chinese):</strong><br>${readableHtml(entry.originalText)}</p>
        <p><strong>Evidence ${escapeHtml(entry.evidenceGrade)} · Applicability:</strong> ${readableHtml(entry.applicability)}</p>
        <p><strong>Source summary:</strong> ${readableHtml(entry.benefitSummary)}</p>
        <div class="reverse"><h3>${readableHtml(entry.inversion.headline)}</h3><p>${readableHtml(entry.inversion.rationalization)}</p><p>${readableHtml(entry.inversion.immediateReward)}</p><p><strong>Possible trade-off:</strong> ${readableHtml(entry.inversion.possibleTradeoff)}</p><p><strong>Back to the facts:</strong> ${readableHtml(entry.inversion.recoveryLink)}</p></div>
        <p><strong>References:</strong> ${readableHtml(entry.references.join('; ') || 'See the chapter source.')}</p>
        <p><strong>Source links:</strong> ${entry.sources
          .map((source) => {
            const url = safeSourceUrl(source.url);
            return url
              ? `<a href="${escapeHtml(url)}">${escapeHtml(source.label)}</a>`
              : escapeHtml(source.label);
          })
          .join('; ')}</p>
        <p><strong>Chapter source:</strong> ${safeSourceUrl(entry.chapterSourceUrl) ? `<a href="${escapeHtml(entry.chapterSourceUrl)}">${escapeHtml(entry.chapterSourceUrl)}</a>` : escapeHtml(entry.chapterSourceUrl)}</p>
      </article>`
        )
        .join('');
      return `<section id="chapter-${escapeHtml(chapter.id)}"><h1>${escapeHtml(chapter.id)}. ${escapeHtml(chapter.englishTitle)}</h1><p lang="zh">${readableHtml(chapter.title)}</p><p>${readableHtml(chapter.summary)}</p>${entriesHtml}</section>`;
    })
    .join('\n');

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>HowToLiveWorse — complete offline edition</title>
<style>body{max-width:850px;margin:2rem auto;padding:0 1.25rem;font:16px/1.65 system-ui,sans-serif;color:#14264a}h1,h2,h3{font-family:Georgia,serif;line-height:1.2}article{border-top:1px solid #d4dfed;padding:1.5rem 0;break-inside:avoid}.reverse{border-left:4px solid #245ee8;padding:.25rem 1rem;background:#eaf3ff}header{border-bottom:1px solid #d4dfed;margin-bottom:2rem;padding-bottom:1.5rem}a{color:#245ee8;overflow-wrap:anywhere}@media print{body{max-width:none;margin:0;padding:0 1cm;font-size:10pt}header{break-after:page}section{break-before:page}article{break-inside:avoid}.reverse{background:#fff}a{color:#14264a;text-decoration:none}}</style></head>
<body><header><h1>HowToLiveWorse — complete offline edition</h1><p>${manifest.chapterCount} chapters · ${manifest.entryCount} source entries · captured ${escapeHtml(manifest.capturedAt)}</p><p>Source: <a href="${escapeHtml(manifest.repositoryUrl)}">${escapeHtml(manifest.repositoryUrl)}</a> at commit <code>${escapeHtml(manifest.commitSha)}</code>.</p><p>Upstream content license: <a href="${escapeHtml(manifest.contentLicense.url)}">${escapeHtml(manifest.contentLicense.name)}</a>.</p>${manifest.translation ? `<p>English translation: <a href="${escapeHtml(manifest.translation.repositoryUrl)}">${escapeHtml(manifest.translation.repositoryUrl)}</a> at commit <code>${escapeHtml(manifest.translation.commitSha)}</code>; maintained by ${escapeHtml(manifest.translation.maintainer)} under <a href="${escapeHtml(manifest.translation.license.url)}">${escapeHtml(manifest.translation.license.name)}</a>.</p>` : ''}<p>Original facts and links remain beside original project satire. Not advice.</p></header><nav aria-label="Chapters"><h2>Chapters</h2><ol>${chapters.map((chapter) => `<li><a href="#chapter-${escapeHtml(chapter.id)}">${escapeHtml(chapter.englishTitle)}</a></li>`).join('')}</ol></nav>${chaptersHtml}</body></html>`;
}

export function createAnkiTsv(
  manifest: SourceManifest,
  entries: readonly GuideRecord[]
): string {
  const cleanField = (value: string) =>
    value.replaceAll('\t', ' ').replaceAll('\r', '').replaceAll('\n', '\\n');
  return (
    entries
      .map((entry) => {
        const front = `${entry.id} · ${entry.englishTitle}`;
        const sources = entry.sources
          .map(
            (source) =>
              `${source.label}${safeSourceUrl(source.url) ? `: ${source.url}` : ''}`
          )
          .join('\n');
        const back = [
          entry.englishText,
          `Evidence ${entry.evidenceGrade}. ${entry.applicability}`,
          `Possible trade-off: ${entry.inversion.possibleTradeoff}`,
          `Sources: ${sources}`,
          `Chapter source: ${entry.chapterSourceUrl}`,
          `Attribution: eternity4719/HowToLiveBetter, ${manifest.contentLicense.name}, commit ${manifest.commitSha}`,
          ...(translationAttribution(manifest)
            ? [translationAttribution(manifest)!]
            : []),
        ].join('\n');
        return `${cleanField(front)}\t${cleanField(back)}`;
      })
      .join('\n') + '\n'
  );
}

export function createGuideJson(
  manifest: SourceManifest,
  chapters: readonly GuideChapter[],
  entries: readonly GuideRecord[]
): string {
  return `${JSON.stringify({ manifest, chapters, entries })}\n`;
}
