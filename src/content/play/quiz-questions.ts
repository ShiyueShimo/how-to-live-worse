export type QuizTheme = 'Attention' | 'Course shopping' | 'Relationships' | 'Learning' | 'Leisure';

export type QuizQuestion = {
  id: string;
  theme: QuizTheme;
  prompt: string;
  options: [string, string, string, string];
  answerIndex: number;
  explanation: string;
  guideId: string;
};

type QuizSeed = { prompt: string; detour: string; recovery: string; guideId: string };

const themeSeeds: { theme: QuizTheme; scenarios: QuizSeed[] }[] = [
  {
    theme: 'Attention',
    scenarios: [
      { prompt: 'A small task keeps slipping off your list.', detour: 'Add it to a fourth list titled “important, eventually.”', recovery: 'Write an if-then cue for the next action.', guideId: '04-001' },
      { prompt: 'Messages interrupt every work block.', detour: 'Check each notification in case the previous one was secretly urgent.', recovery: 'Turn off non-essential alerts for one work block.', guideId: '03-001' },
      { prompt: 'A project has no outside deadline.', detour: 'Keep it in the category called “when there is time.”', recovery: 'Choose a small date and a first step.', guideId: '04-008' },
      { prompt: 'A meeting invite has no agenda.', detour: 'Attend and discover the purpose live, like an audience member.', recovery: 'Ask for a short agenda or suggest an async note.', guideId: '04-005' },
      { prompt: 'A task is larger than one sitting.', detour: 'Wait for a mythical uninterrupted afternoon.', recovery: 'Break it into a first visible subtask.', guideId: '04-007' },
      { prompt: 'You are estimating how long a familiar task takes.', detour: 'Use the optimistic number that makes today feel efficient.', recovery: 'Check the time from a similar past task.', guideId: '04-004' },
      { prompt: 'A task keeps getting postponed.', detour: 'Rename the delay “not a real priority” without checking.', recovery: 'Notice the uncomfortable part and make the opening step smaller.', guideId: '04-009' },
      { prompt: 'A screen keeps inviting another scroll.', detour: 'Keep the feed open as a test of personal character.', recovery: 'Set a limit or move the cue out of sight.', guideId: '04-015' },
      { prompt: 'Several messages can be handled together.', detour: 'Switch windows after every new ping.', recovery: 'Batch routine messages at a chosen time.', guideId: '03-005' },
      { prompt: 'You are trying to finish a thinking task.', detour: 'Keep every tab and chat visible for moral support.', recovery: 'Hide the interruptions for one focused block.', guideId: '03-006' },
      { prompt: 'A task has a clear stopping condition.', detour: 'Start without writing it down and improvise forever.', recovery: 'Write one sentence describing “done.”', guideId: '04-002' },
      { prompt: 'You are deciding whether to continue a side project.', detour: 'Let the hours already spent cast the deciding vote.', recovery: 'Compare only the remaining cost and likely return.', guideId: '04-003' },
    ],
  },
  {
    theme: 'Course shopping',
    scenarios: [
      { prompt: 'You want to learn a practical skill.', detour: 'Buy the largest course before checking whether a public subsidy exists.', recovery: 'Check the available training routes first.', guideId: '23-009' },
      { prompt: 'A course promises a career transformation.', detour: 'Treat the headline as a syllabus and enroll on the spot.', recovery: 'Compare the actual practice tasks with the skill you need.', guideId: '23-010' },
      { prompt: 'You have studied a chapter once.', detour: 'Reread it until every sentence looks familiar.', recovery: 'Close the book and test what you can recall.', guideId: '23-014' },
      { prompt: 'An exam is a few weeks away.', detour: 'Save all practice for one heroic night.', recovery: 'Spread short retrieval sessions over several days.', guideId: '23-015' },
      { prompt: 'You want to remember a procedure.', detour: 'Highlight every line in a color that feels academically serious.', recovery: 'Use questions that match how you will apply it.', guideId: '23-019' },
      { prompt: 'You are choosing a new skill to learn.', detour: 'Pick the course with the most impressive certificate graphic.', recovery: 'Check whether the skill has real practice and feedback.', guideId: '23-010' },
      { prompt: 'A class advertises guaranteed high wages.', detour: 'Take the banner as labor-market data.', recovery: 'Check current local occupation information.', guideId: '23-012' },
      { prompt: 'You keep changing study methods.', detour: 'Choose a method based on a personality quiz result.', recovery: 'Practice retrieving and applying the material.', guideId: '23-018' },
      { prompt: 'Practice problems all look the same.', detour: 'Repeat the easiest type until it feels like mastery.', recovery: 'Mix problem types and check what you can distinguish.', guideId: '23-017' },
      { prompt: 'You are making notes after a lesson.', detour: 'Polish the notes instead of checking whether you can use them.', recovery: 'Try one realistic question with the notes closed.', guideId: '23-016' },
      { prompt: 'A new professional certificate catches your eye.', detour: 'Assume the credential guarantees a job or raise.', recovery: 'Check the requirements and how employers use it.', guideId: '23-020' },
      { prompt: 'You have a spare half-hour for learning.', detour: 'Spend it comparing apps and postpone the practice.', recovery: 'Do one small exercise in the tool you already have.', guideId: '23-014' },
    ],
  },
  {
    theme: 'Relationships',
    scenarios: [
      { prompt: 'You are wondering whether a new person enjoys your company.', detour: 'Read a neutral emoji like a detective solving a cold case.', recovery: 'Look at clear actions and communicate directly.', guideId: '10-003' },
      { prompt: 'You are meeting someone new.', detour: 'Decide compatibility from a profile before saying hello.', recovery: 'Let real interaction provide information.', guideId: '10-001' },
      { prompt: 'You and a friend have time for a conversation.', detour: 'Turn every question into a test of closeness.', recovery: 'Ask one open question and let either person pass.', guideId: '10-005' },
      { prompt: 'You are reviewing a relationship.', detour: 'Score the other person’s résumé instead of noticing how the relationship feels.', recovery: 'Name your own experience and needs.', guideId: '10-004' },
      { prompt: 'A friend replies later than usual.', detour: 'Draft six interpretations before sending a normal check-in.', recovery: 'Ask simply, without assuming intent.', guideId: '10-003' },
      { prompt: 'You want more meaningful conversations.', detour: 'Print a 36-question script and require completion by dessert.', recovery: 'Choose a topic together and skip anything unwelcome.', guideId: '10-005' },
      { prompt: 'You are looking at a statistic about marriage.', detour: 'Treat a national annual ratio as a prediction about one couple.', recovery: 'Check the denominator and what the statistic measures.', guideId: '10-007' },
      { prompt: 'A household chore keeps causing friction.', detour: 'Wait for someone to infer your preferred division of labor.', recovery: 'Discuss the work and agree who owns each task.', guideId: '10-009' },
      { prompt: 'You are deciding whether to make plans with someone.', detour: 'Keep the invitation vague so nobody can answer it.', recovery: 'Suggest a specific time and accept a clear yes or no.', guideId: '10-003' },
      { prompt: 'You are talking with a close friend.', detour: 'Fill every pause before the other person has finished thinking.', recovery: 'Leave room for a reply or a change of topic.', guideId: '10-005' },
      { prompt: 'A relationship decision feels complicated.', detour: 'Ask a poll to decide what only the people involved can discuss.', recovery: 'Name the question each person needs answered.', guideId: '10-004' },
      { prompt: 'You are preparing for a long-distance move-in.', detour: 'Assume logistics will solve themselves because the relationship is strong.', recovery: 'Talk through routines and expectations before the move.', guideId: '10-006' },
    ],
  },
  {
    theme: 'Learning',
    scenarios: [
      { prompt: 'You finished reading a chapter.', detour: 'Reread the same pages until the layout feels familiar.', recovery: 'Close the book and recall the key points.', guideId: '23-014' },
      { prompt: 'You have several days before a test.', detour: 'Save all review for the night before.', recovery: 'Schedule shorter reviews across the week.', guideId: '23-015' },
      { prompt: 'You want to check whether you understand a concept.', detour: 'Count pages highlighted as evidence of learning.', recovery: 'Try explaining it or solving a new question without notes.', guideId: '23-016' },
      { prompt: 'You are practicing multiple problem types.', detour: 'Repeat one familiar type and avoid the rest.', recovery: 'Mix the exercises so you must choose a method.', guideId: '23-017' },
      { prompt: 'A topic has several ways to practice.', detour: 'Pick the method that sounds most like your learning identity.', recovery: 'Test the method by recalling and applying the material.', guideId: '23-018' },
      { prompt: 'You want a skill you can use at work.', detour: 'Choose only by how elegant the course description sounds.', recovery: 'Check whether practice resembles the real task.', guideId: '23-019' },
      { prompt: 'You keep collecting tutorial bookmarks.', detour: 'Add another tutorial instead of attempting one exercise.', recovery: 'Use one saved resource to produce a small result.', guideId: '23-014' },
      { prompt: 'A learning app offers a streak badge.', detour: 'Protect the badge while avoiding the difficult question.', recovery: 'Spend the session retrieving one thing from memory.', guideId: '23-015' },
      { prompt: 'You are not sure a course is worth paying for.', detour: 'Assume a high price is proof of a better fit.', recovery: 'Check lower-cost or subsidized options and the syllabus.', guideId: '23-009' },
      { prompt: 'You are choosing a technical shortcut.', detour: 'Memorize a button sequence without understanding when it applies.', recovery: 'Practice the task and check the result.', guideId: '23-017' },
      { prompt: 'You learn a new term.', detour: 'Copy the definition without connecting it to an example.', recovery: 'Explain the term in your own words, then test it.', guideId: '23-014' },
      { prompt: 'A course says a certificate is universally required.', detour: 'Accept the claim without checking the actual job requirements.', recovery: 'Compare the credential with current role criteria.', guideId: '23-020' },
    ],
  },
  {
    theme: 'Leisure',
    scenarios: [
      { prompt: 'You are choosing a venue with friends.', detour: 'Assume posted rules and prices will reveal themselves later.', recovery: 'Check the conditions before committing to an order.', guideId: '22-002' },
      { prompt: 'You arrive at a new entertainment venue.', detour: 'Wait until you need the exit to discover where it is.', recovery: 'Notice the available exits when you arrive.', guideId: '22-001' },
      { prompt: 'A venue’s safety information looks inconvenient.', detour: 'Treat a blocked exit as part of the décor.', recovery: 'Choose a place whose exits are clear.', guideId: '22-001' },
      { prompt: 'A friend suggests a new place to relax.', detour: 'Ignore the location and building details because the photos look good.', recovery: 'Check the venue’s basic conditions before going.', guideId: '22-005' },
      { prompt: 'You are deciding whether to accept an unexpected extra charge.', detour: 'Pay first and research the displayed prices on the way home.', recovery: 'Ask for the price list before ordering.', guideId: '22-002' },
      { prompt: 'You have a free evening.', detour: 'Spend the whole evening searching for the ideal activity.', recovery: 'Pick a simple option nearby and keep the plan flexible.', guideId: '22-010' },
      { prompt: 'You need a low-effort break.', detour: 'Open five entertainment feeds and decide none is quite right.', recovery: 'Choose one small activity, or choose to do nothing.', guideId: '22-010' },
      { prompt: 'A venue feels uncomfortable after you arrive.', detour: 'Stay only because the trip across town is already paid for.', recovery: 'Use current conditions to decide whether to leave.', guideId: '22-001' },
      { prompt: 'A complicated activity is marketed as a bargain.', detour: 'Skip the location and price details because the discount has a countdown.', recovery: 'Read the conditions and decide without the countdown.', guideId: '22-002' },
      { prompt: 'Your group cannot settle on a plan.', detour: 'Keep reopening the same debate until the evening is over.', recovery: 'Offer two simple choices and let the group pick.', guideId: '22-010' },
      { prompt: 'You are booking an escape room or game venue.', detour: 'Assume the building layout does not matter because it is entertainment.', recovery: 'Check that the setting meets basic venue guidance.', guideId: '22-005' },
      { prompt: 'The best plan seems to require a long search.', detour: 'Treat choosing a pleasant local walk as a research project.', recovery: 'Use a nearby green space if that suits you.', guideId: '22-010' },
    ],
  },
];

function buildQuestion(theme: QuizTheme, seed: QuizSeed, index: number): QuizQuestion {
  const recoveryOptions = [seed.recovery, 'Check what the guide actually says before deciding.', 'Choose one small step and stop there.', 'Keep the choice reversible and easy to skip.'];
  const answerIndex = index % 4;
  const options = [...recoveryOptions];
  options[answerIndex] = seed.detour;

  return {
    id: `${theme.toLocaleLowerCase('en').replaceAll(' ', '-')}-${String(index + 1).padStart(2, '0')}`,
    theme,
    prompt: `${seed.prompt} Which response is the classic low-ROI detour?`,
    options: options as QuizQuestion['options'],
    answerIndex,
    explanation: `That answer turns a small decision into a familiar detour. A safer reset is: ${seed.recovery} Related source entry: ${seed.guideId}.`,
    guideId: seed.guideId,
  };
}

export const quizQuestions = themeSeeds.flatMap(({ theme, scenarios }) => scenarios.map((scenario, index) => buildQuestion(theme, scenario, index)));
