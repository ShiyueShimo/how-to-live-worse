# HowToLiveWorse

An English-first, source-linked satire that turns a complete life guide into a mirror for familiar low-ROI detours. The original advice, evidence, and qualifications remain visible beside each original reverse reading.

Serious health, legal, financial, emergency, and personal-safety material stays factual and sourced. The site is satire, not advice or a measure of anyone's life quality.

## Run locally

Run pnpm install, then pnpm dev. No database, authentication, payments, analytics, or local environment file is required for the public site.

## Checks

Run pnpm test:content, pnpm test:site, pnpm exec tsc --noEmit, and pnpm build.

The guide corpus is checked with pnpm validate:guide. `pnpm build` regenerates the complete Markdown, offline HTML, DOCX, EPUB, Anki TSV and JSON editions before building the site. Run `pnpm validate:exports` to check that all six downloads exist, the ZIP-based files open, and the JSON edition contains all entries.

## Source and attribution

The adapted book text is attributed to [eternity4719/HowToLiveBetter](https://github.com/eternity4719/HowToLiveBetter) under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). The project records the exact source commit, translation source and changes in [LICENSE-CONTENT.md](LICENSE-CONTENT.md).

This is an independent project and is not affiliated with the upstream author or the reference website. The ShipAny license and project instructions are retained in this copy.
