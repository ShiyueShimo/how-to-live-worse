import type { CostType, GuideChapter, GuideSourceEntry, GuideSourceLink, ResourceType, RiskClass } from './types';

export type GuideChapterMarkdownInput = {
  sourceFileName: string;
  sourceMarkdown: string;
  translationFileName?: string;
  translationMarkdown?: string;
  commitSha: string;
  fallbackTranslations: Record<
    string,
    { title: string; costSummary: string; benefitSummary: string; applicability: string }
  >;
};

export type ParsedGuideChapter = { chapter: GuideChapter; entries: GuideSourceEntry[] };

type MarkdownEntry = { number: number; title: string; text: string };

function findNumberedEntries(markdown: string, sourceName: string): MarkdownEntry[] {
  const headings = [...markdown.matchAll(/^###\s+(\d+)\.\s+(.+)$/gm)];
  return headings.map((heading, index) => {
    const start = heading.index ?? 0;
    const end = headings[index + 1]?.index ?? markdown.length;
    return {
      number: Number(heading[1]),
      title: heading[2].trim(),
      text: markdown.slice(start, end).trim(),
    };
  }).filter((entry, index, all) => {
    if (all.findIndex((candidate) => candidate.number === entry.number) !== index) {
      throw new Error(`${sourceName}: duplicate numbered heading ${entry.number}.`);
    }
    return true;
  });
}

function findField(entryText: string, chineseLabel: string, englishLabel: string): string {
  const escapedLabels = `${chineseLabel}|${englishLabel}`;
  const field = new RegExp(`^\\s*-\\s*(?:${escapedLabels})\\s*[:：]\\s*(.*?)(?=\\n\\s*-\\s*(?:成本|说人话|收益|证据等级|来源|备注|Cost|In plain terms|Benefit|Evidence grade|Sources|Notes)\\s*[:：]|$)`, 'ims');
  return field.exec(entryText)?.[1]?.trim() ?? '';
}

function parseCostTags(entryText: string, costSummary: string): CostType[] {
  const tags = /<!--\s*成本标签:\s*(.*?)\s*-->/i.exec(entryText)?.[1] ?? '';
  if (!tags) {
    throw new Error('missing cost tag comment');
  }

  const tag = (label: string) => new RegExp(`${label}=([^\\s]+)`, 'i').exec(tags)?.[1] ?? '';
  const costs: CostType[] = [];
  if (tag('钱') && tag('钱') !== '0' || /Money=Low|Money=Medium|Money=High/i.test(tags)) costs.push('money');
  if (tag('时间') && tag('时间') !== '0' || /Time=Low|Time=Medium|Time=High/i.test(tags)) costs.push('time');
  if (['是', '些'].includes(tag('毅力')) || /Willpower=(?:Some|Yes)/i.test(tags)) costs.push('persistence');
  if (/精力|Energy=(?:Low|Medium|High)/i.test(costSummary)) costs.push('energy');
  return costs;
}

function parseBenefits(entryText: string): ResourceType[] {
  const tags = /<!--\s*成本标签:\s*(.*?)\s*-->/i.exec(entryText)?.[1] ?? '';
  const metric = /(?:口径|Metric)=([^\s]+)/i.exec(tags)?.[1] ?? '';
  if (/死亡率|寿命|Mortality|lifespan/i.test(metric)) return ['lifespan'];
  if (/时间|精力|Time|Energy/i.test(metric)) return ['time-energy'];
  if (/金钱|Money/i.test(metric)) return ['money'];
  if (/自由|保障|Liberty|Freedom/i.test(metric)) return ['freedom'];
  throw new Error(`unsupported benefit metric "${metric}"`);
}

function parseSourceLinks(sourceText: string, entryId: string): GuideSourceLink[] {
  const parts = sourceText.split(/\s*[;；]\s*/).filter(Boolean);
  const links: GuideSourceLink[] = [];
  parts.forEach((part, index) => {
    const match = /<?(https?:\/\/[^\s<>]+)>?/i.exec(part);
    if (!match) {
      links.push({ label: part.trim() || `Source ${index + 1}`, url: null });
      return;
    }
    const url = match[1].replace(/[),.;，。；]+$/g, '');
    const label = part.slice(0, match.index).replace(/[\s<>:：]+$/g, '').trim() || `Source ${index + 1}`;
    links.push({ label, url });
  });
  if (links.length === 0 || !sourceText.trim()) {
    throw new Error(`${entryId}: source field contains no URL.`);
  }
  return links;
}

function parseReferences(entryText: string, currentChapter: number): string[] {
  const references = new Set<string>();
  for (const match of entryText.matchAll(/(?:见|参见|详见)\s*第\s*(\d{1,2})\s*节(?:[^。；\n]{0,100}?第\s*(\d{1,3})\s*条)?/g)) {
    const chapterId = String(Number(match[1])).padStart(2, '0');
    references.add(match[2] ? `${chapterId}-${String(Number(match[2])).padStart(3, '0')}` : `chapter:${chapterId}`);
  }
  for (const match of entryText.matchAll(/(?:见|参见|详见)(?:本节|本章)\s*第\s*(\d{1,3})\s*条/g)) {
    references.add(`${String(currentChapter).padStart(2, '0')}-${String(Number(match[1])).padStart(3, '0')}`);
  }
  for (const match of entryText.matchAll(/(?:见|参见|详见)\s*第\s*(\d{1,3})\s*条/g)) {
    references.add(`${String(currentChapter).padStart(2, '0')}-${String(Number(match[1])).padStart(3, '0')}`);
  }
  return [...references].sort();
}

function identifyRiskClass(chapterNumber: number, title: string): RiskClass {
  if (/自杀|轻生|赌徒|赌博|情绪危机|自伤/.test(title)) return 'crisis';
  if (/孩子|儿童|新生儿|孕|婴|老人|残疾/.test(title)) return 'children';
  if (/急救|火灾|中毒|溺水|止血|心肺复苏/.test(title) || chapterNumber === 13) return 'emergency';
  if (/诈骗|被骗|报警|侵权|违法|犯罪|法院|劳动仲裁|合同|贷款|诉讼|医保|社保|签证|合规|法律/.test(title)) return 'legal';
  if (/钱|保险|基金|养老金|理财|借款|投资|价格|买房/.test(title) || [5, 7, 12, 15].includes(chapterNumber)) return 'financial';
  if (/身体|治疗|药|病|健康|疫苗|戒烟|戒酒|睡眠|疼|运动|减肥|营养|筛查/.test(title) || [1, 2, 16, 24, 27, 28, 34].includes(chapterNumber)) return 'health';
  if ([8, 9, 11, 14, 19, 21, 26, 31, 32].includes(chapterNumber)) return 'personal-safety';
  if (chapterNumber === 29) return 'crisis';
  return 'low';
}

function chapterHeading(markdown: string, chapterNumber: number, fileName: string): string {
  const heading = /^#\s+(?:第\s*)?\d+[.、]\s*(.+)$/m.exec(markdown)?.[1]?.trim();
  if (heading) return heading;
  return fileName.replace(/^\d+-/, '').replace(/\.md$/i, '');
}

function chapterSummary(markdown: string): string {
  const intro = markdown
    .replace(/^#.*(?:\r?\n)+/m, '')
    .split(/^###\s+\d+\./m)[0]
    .replace(/\s+/g, ' ')
    .trim();
  return intro.slice(0, 300) || 'Full chapter source available in the original Markdown.';
}

export function parseGuideChapterMarkdown(input: GuideChapterMarkdownInput): ParsedGuideChapter {
  const chapterNumber = Number(/^\d+/.exec(input.sourceFileName)?.[0]);
  if (!Number.isInteger(chapterNumber) || chapterNumber < 1) {
    throw new Error(`${input.sourceFileName}: chapter filename must begin with its number.`);
  }

  const sourceEntries = findNumberedEntries(input.sourceMarkdown, input.sourceFileName);
  if (sourceEntries.length === 0) {
    throw new Error(`${input.sourceFileName}: no numbered recommendation headings were found.`);
  }
  const translationEntries = input.translationMarkdown
    ? findNumberedEntries(input.translationMarkdown, input.translationFileName ?? 'translation')
    : [];
  const translatedByNumber = new Map(translationEntries.map((entry) => [entry.number, entry]));
  const chapterId = String(chapterNumber).padStart(2, '0');
  const chapterTitle = chapterHeading(input.sourceMarkdown, chapterNumber, input.sourceFileName);
  const englishChapterTitle = input.translationMarkdown
    ? chapterHeading(input.translationMarkdown, chapterNumber, input.translationFileName ?? '')
    : chapterTitle;

  const entries = sourceEntries.map((sourceEntry): GuideSourceEntry => {
    const id = `${chapterId}-${String(sourceEntry.number).padStart(3, '0')}`;
    const translationEntry = translatedByNumber.get(sourceEntry.number);
    const fallback = input.fallbackTranslations[id];
    if (!translationEntry && !fallback) {
      throw new Error(`${id}: English translation is missing; add a reviewed fallback translation.`);
    }
    const englishTitle = translationEntry?.title ?? fallback.title;
    const englishText = translationEntry?.text ?? [
      `### ${sourceEntry.number}. ${englishTitle}`,
      `- Cost: ${fallback.costSummary}`,
      `- In plain terms: ${fallback.benefitSummary}`,
      `- Applicability and limits: ${fallback.applicability}`,
      '- Translation note: This concise English edition was prepared for this site; the full Chinese source and its original evidence remain available below.',
    ].join('\n');
    const costSummary = findField(sourceEntry.text, '成本', 'Cost');
    const plainLanguage = findField(sourceEntry.text, '说人话', 'In plain terms');
    const benefitSummary = findField(sourceEntry.text, '收益', 'Benefit');
    const evidence = findField(sourceEntry.text, '证据等级', 'Evidence grade');
    const sourceField = findField(sourceEntry.text, '来源', 'Sources');
    const notes = findField(sourceEntry.text, '备注', 'Notes');
    const englishCostSummary = translationEntry ? findField(englishText, '成本', 'Cost') : fallback.costSummary;
    const englishPlainLanguage = translationEntry ? findField(englishText, '说人话', 'In plain terms') : fallback.benefitSummary;
    const englishNotes = translationEntry ? findField(englishText, '备注', 'Notes') : fallback.applicability;
    const evidenceGrade = /^([ABC])\b/i.exec(evidence)?.[1]?.toUpperCase();

    if (!costSummary || !plainLanguage || !benefitSummary || !evidenceGrade || !sourceField) {
      throw new Error(`${id}: missing required source field (cost, plain-language, benefit, grade, or source).`);
    }

    let costs: CostType[];
    let benefits: ResourceType[];
    try {
      costs = parseCostTags(sourceEntry.text, costSummary);
      benefits = parseBenefits(sourceEntry.text);
    } catch (error) {
      throw new Error(`${id}: ${error instanceof Error ? error.message : String(error)}`);
    }

    const sources = parseSourceLinks(sourceField, id);
    const sourceChapter = input.sourceFileName;
    const sourcePath = `book/${sourceChapter}`;

    return {
      id,
      chapterId,
      chapterNumber,
      entryNumber: sourceEntry.number,
      title: sourceEntry.title,
      englishTitle,
      originalText: sourceEntry.text,
      englishText,
      costs,
      costSummary: englishCostSummary || costSummary,
      benefits,
      benefitSummary: englishPlainLanguage || plainLanguage,
      evidenceGrade: evidenceGrade as 'A' | 'B' | 'C',
      applicability: englishNotes || notes || 'See the source population and study limits in the original entry.',
      authorNotes: notes,
      references: parseReferences(sourceEntry.text, chapterNumber),
      sources,
      riskClass: identifyRiskClass(chapterNumber, sourceEntry.title),
      chapterSourceUrl: `https://github.com/eternity4719/HowToLiveBetter/blob/${input.commitSha}/${encodeURIComponent(sourcePath).replaceAll('%2F', '/')}`,
      translationSource: translationEntry ? 'maintainer-edition' : 'site-translation',
    };
  });

  return {
    chapter: {
      id: chapterId,
      number: chapterNumber,
      title: chapterTitle,
      englishTitle: englishChapterTitle,
      summary: chapterSummary(input.sourceMarkdown),
      entryIds: entries.map((entry) => entry.id),
      sourcePath: `book/${input.sourceFileName}`,
    },
    entries,
  };
}
