import { useEffect, useState } from 'react';
import { guideChapters } from '@/content/guide/data';
import { clearGuideState, defaultGuideState, readGuideState, writeGuideState, type GuideStateResult, type GuideUserState } from '@/lib/guide-state';

const knownGuideIds = new Set(guideChapters.flatMap((chapter) => chapter.entryIds));

export function useGuideState() {
  const [result, setResult] = useState<GuideStateResult>({ status: 'missing', state: defaultGuideState() });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setResult(readGuideState(window.localStorage, knownGuideIds));
    setHydrated(true);
  }, []);

  function updateGuideState(update: (state: GuideUserState) => GuideUserState) {
    if (result.status === 'corrupt') throw new Error('Local guide state is corrupt; export or clear it before saving new progress.');
    const nextState = update(result.state);
    writeGuideState(window.localStorage, nextState, knownGuideIds);
    setResult({ status: 'valid', state: nextState });
  }

  function removeGuideState() {
    clearGuideState(window.localStorage);
    setResult({ status: 'missing', state: defaultGuideState() });
  }

  return { result, hydrated, updateGuideState, removeGuideState };
}
