import { Link } from '@tanstack/react-router';
import type { GuideRecord } from '@/content/guide/types';

type GuideEntryCardData = Pick<GuideRecord, 'id' | 'englishTitle' | 'title' | 'benefits' | 'evidenceGrade' | 'riskClass' | 'benefitSummary' | 'inversion'>;
type GuideEntryCardProps = { record: GuideEntryCardData; showInversion?: boolean };

export function GuideEntryCard({ record, showInversion = true }: GuideEntryCardProps) {
  return (
    <article className="guide-entry-card" id={record.id}>
      <div className="guide-entry-number">{record.id}</div>
      <div className="guide-entry-content">
        <div className="guide-entry-meta">
          <span>Evidence {record.evidenceGrade}</span>
          <span>{record.benefits.join(' · ')}</span>
          {record.riskClass !== 'low' ? <span className="risk-label">Source-sensitive</span> : null}
        </div>
        <h2>
          <Link to="/entry/$entryId" params={{ entryId: record.id }}>
            {record.englishTitle}
          </Link>
        </h2>
        <p className="entry-original-title" lang="zh">
          {record.title}
        </p>
        <p className="guide-entry-summary">{record.benefitSummary}</p>
        {showInversion ? (
          <details className="inversion-preview">
            <summary>Open the low-ROI detour</summary>
            <div>
              <h3>{record.inversion.headline}</h3>
              <p>{record.inversion.rationalization}</p>
              <p className="muted-copy">{record.inversion.immediateReward}</p>
            </div>
          </details>
        ) : null}
        <Link className="text-link" to="/entry/$entryId" params={{ entryId: record.id }}>
          Read the source and trade-off <span aria-hidden="true">→</span>
        </Link>
      </div>
    </article>
  );
}
