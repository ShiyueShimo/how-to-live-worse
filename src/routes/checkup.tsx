import { useMemo, useState } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { GuideEntryCard } from '@/components/guide-entry-card';
import { GuideShell } from '@/components/guide-shell';
import { useGuideCatalog } from '@/lib/use-guide-catalog';
import { checkupRecommendations } from '@/lib/guide-interactions';

const questions = [
  { prompt: 'What is easiest to postpone this week?', choices: [{ label: 'Writing down the next step', chapter: '04' }, { label: 'A focused block without notifications', chapter: '03' }, { label: 'A learning task I keep researching', chapter: '23' }] },
  { prompt: 'Where does a small plan most often get lost?', choices: [{ label: 'In another list', chapter: '04' }, { label: 'In messages and tabs', chapter: '03' }, { label: 'In a tutorial queue', chapter: '23' }] },
  { prompt: 'Which conversation are you delaying?', choices: [{ label: 'Asking a clear question', chapter: '10' }, { label: 'Agreeing what “done” means', chapter: '04' }, { label: 'Choosing a simple evening plan', chapter: '22' }] },
  { prompt: 'What do you do when a project has already taken a while?', choices: [{ label: 'Keep going because of the hours spent', chapter: '04' }, { label: 'Check the next cost and likely return', chapter: '04' }, { label: 'Pause and learn one practical thing', chapter: '23' }] },
  { prompt: 'What sounds like the most familiar detour?', choices: [{ label: 'Planning leisure longer than doing it', chapter: '22' }, { label: 'Reading the same notes again', chapter: '23' }, { label: 'Letting the calendar make the decision', chapter: '04' }] },
];

function CheckupPage() {
  const [answers, setAnswers] = useState<string[]>(Array(questions.length).fill(''));
  const [finished, setFinished] = useState(false);
  const catalog = useGuideCatalog(finished);
  const selectedChapters = useMemo(() => answers.flatMap((answer, index) => {
    const choice = questions[index]?.choices.find((item) => item.label === answer);
    return choice ? [choice.chapter] : [];
  }), [answers]);
  const suggestions = useMemo(() => catalog.records && finished
    ? checkupRecommendations(catalog.records, selectedChapters, answers.join('|'))
    : [], [answers, catalog.records, finished, selectedChapters]);

  function choose(questionIndex: number, choiceLabel: string) {
    setAnswers((current) => current.map((answer, index) => index === questionIndex ? choiceLabel : answer));
  }

  return (
    <GuideShell active="play">
      <main className="article-page site-container">
        <p className="site-overline">5 QUESTIONS · 10 SOURCE-LINKED READS</p>
        <h1>A route through your favorite detours.</h1>
        <p className="library-intro">Pick what feels familiar. This is a playful reading route, not a personality test, diagnosis, financial score or forecast.</p>
        {!finished ? <form className="checkup-form" onSubmit={(event) => { event.preventDefault(); setFinished(true); }}>
          {questions.map((question, index) => (
            <fieldset className="checkup-question" key={question.prompt}>
              <legend>{String(index + 1).padStart(2, '0')} · {question.prompt}</legend>
              {question.choices.map((choice) => (
                <label className="checkup-choice" key={`${index}-${choice.chapter}-${choice.label}`}>
                  <input type="radio" name={`question-${index}`} value={choice.label} checked={answers[index] === choice.label} onChange={() => choose(index, choice.label)} />
                  <span>{choice.label}</span>
                </label>
              ))}
            </fieldset>
          ))}
          <button className="button button-dark" type="submit" disabled={answers.some((answer) => !answer)}>Show my reading route</button>
        </form> : <section aria-live="polite" className="checkup-results">
          <div className="article-boundary">Entertainment only. The order is a reading suggestion, not a score about you. Every source entry keeps its own evidence and limits.</div>
          <h2>Your 10-entry reading detour</h2>
          {catalog.loading ? <p>Finding matching low-risk entries…</p> : null}
          {catalog.error ? <p className="empty-state">{catalog.error}</p> : null}
          {suggestions.map((record) => <GuideEntryCard key={record.id} record={record} />)}
          <div className="home-actions"><button className="button button-outline" type="button" onClick={() => setFinished(false)}>Change answers</button><Link className="button button-dark" to="/book">Browse the complete 675-entry guide</Link></div>
        </section>}
      </main>
    </GuideShell>
  );
}

export const Route = createFileRoute('/checkup')({
  head: () => ({ meta: [{ title: 'A reading route | HowToLiveWorse' }, { name: 'description', content: 'Answer five playful questions to get a source-linked reading route. Not a diagnosis or life score.' }] }),
  component: CheckupPage,
});
