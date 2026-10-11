import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parseGuideChapterMarkdown } from '../src/content/guide/markdown';

test('parses a numbered chapter item, its source fields, tags, and paired translation', () => {
  const parsed = parseGuideChapterMarkdown({
    sourceFileName: '01-sample.md',
    sourceMarkdown: `# 1. 样例章节\n\n简介。\n\n### 7. 系好安全带\n<!-- 成本标签: 钱=0 时间=少 毅力=否 收益=大 口径=死亡率 -->\n- 成本：多花两秒。\n- 说人话：风险下降。\n- 收益：研究结果。\n- 证据等级：A\n- 来源：First report <https://example.org/one>; Second report <https://example.org/two>\n- 备注：仅适用于样本说明的人群。见本节第 6 条、并参见第 2 节第 4 条。`,
    translationFileName: '01-example.md',
    translationMarkdown: `# 01. Sample chapter\n\n### 7. Fasten your seat belt\n<!-- Cost Tag: Money=0 Time=Low Willpower=No Benefit=High Metric=Mortality -->\n- Cost: Two more seconds.\n- In plain terms: Lower risk.\n- Benefit: Study result.\n- Evidence grade: A\n- Sources: First report <https://example.org/one>; Second report <https://example.org/two>\n- Notes: Only for the population described in the study.`,
    commitSha: 'a994b6a0c90598b0fe15cb837343f438dbf7b95d',
    fallbackTranslations: {},
  });

  assert.equal(parsed.chapter.id, '01');
  assert.equal(parsed.chapter.title, '样例章节');
  assert.equal(parsed.entries.length, 1);
  assert.equal(parsed.entries[0].id, '01-007');
  assert.equal(parsed.entries[0].englishTitle, 'Fasten your seat belt');
  assert.deepEqual(parsed.entries[0].costs, ['time']);
  assert.deepEqual(parsed.entries[0].benefits, ['lifespan']);
  assert.equal(parsed.entries[0].evidenceGrade, 'A');
  assert.equal(parsed.entries[0].sources.length, 2);
  assert.deepEqual(parsed.entries[0].references, ['01-006', '02-004']);
  assert.match(parsed.entries[0].applicability, /population described/);
  assert.equal(parsed.entries[0].translationSource, 'maintainer-edition');
});

test('requires an explicit English fallback for a source item with no paired translation', () => {
  assert.throws(
    () =>
      parseGuideChapterMarkdown({
        sourceFileName: '01-sample.md',
        sourceMarkdown: '# 1. 样例章节\n### 1. 样例建议\n- 成本：无。\n- 说人话：结果。\n- 收益：收益。\n- 证据等级：C\n- 来源：Report <https://example.org/report>\n- 备注：适用范围。',
        translationFileName: undefined,
        translationMarkdown: undefined,
        commitSha: 'a994b6a0c90598b0fe15cb837343f438dbf7b95d',
        fallbackTranslations: {},
      }),
    /01-001.*English/i,
  );
});
