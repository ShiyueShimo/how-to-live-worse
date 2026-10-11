export type ReverseArticle = {
  slug: string;
  title: string;
  summary: string;
  applicability: string;
  mappedGuideIds: string[];
  sections: { heading: string; body: string }[];
};

export const articles: ReverseArticle[] = [
  {
    slug: '36-questions',
    title: 'How to turn a good conversation into a performance review',
    summary: 'A playful guide to over-planning a human conversation until everyone misses the part where they were together.',
    applicability: 'Relationship humor only. Questions are invitations, never obligations; skip anything that feels intrusive.',
    mappedGuideIds: ['10-001', '10-003', '10-004'],
    sections: [
      { heading: 'Prepare a rubric first', body: 'Before meeting a friend, draft categories for honesty, emotional range and follow-up potential. A quiet pause can then be entered as “insufficient data,” which is much easier than being present.' },
      { heading: 'Optimize the room out of the room', body: 'Spend the afternoon choosing the perfect question list, then cancel because the list is not quite ready. The low-cost repair is wonderfully unscalable: ask one real question, listen, and let the other person change the subject.' },
      { heading: 'Keep a human exit', body: 'A conversation is not an exam and nobody owes a disclosure. Stop, change topics or leave whenever either person wants.' },
    ],
  },
  {
    slug: 'new-chronic-diagnosis',
    title: 'The paperwork can wait; the facts cannot',
    summary: 'A satire of postponing ordinary organization after a difficult diagnosis, with the medical steps kept firmly outside the joke.',
    applicability: 'Health information is not a treatment plan. Follow the clinician who knows the person and the condition.',
    mappedGuideIds: ['16-001', '16-003', '16-004', '29-001'],
    sections: [
      { heading: 'Make one folder into a future project', body: 'Put every report in a different drawer so that each appointment becomes a fresh archaeological expedition. It saves a few minutes today and guarantees an exciting filing system tomorrow.' },
      { heading: 'Confuse “not thinking about it” with recovery', body: 'Avoid writing down questions because a blank page cannot contain bad news. A trusted person can instead help organize dates, questions and records in whatever way feels manageable.' },
      { heading: 'The non-satirical part', body: 'Do not use this joke to delay urgent care, change prescribed treatment or skip follow-up. For symptoms or treatment decisions, contact the care team or a local emergency service.' },
    ],
  },
  {
    slug: 'before-and-after-birth',
    title: 'Turn a new baby into a project-management theatre',
    summary: 'The comic temptation to buy dashboards and color-coded folders while the useful help is still unassigned.',
    applicability: 'Pregnancy, newborn care and workplace rules are high-stakes and location-specific. Confirm details with qualified local services.',
    mappedGuideIds: ['27-001', '27-002', '20-001', '20-002', '18-001'],
    sections: [
      { heading: 'Buy the organizer before assigning the task', body: 'A new spreadsheet can make every appointment feel complete, even when nobody knows who will make it or when. If a checklist helps, keep it short and share it with the people who will actually use it.' },
      { heading: 'Assume every family has the same calendar', body: 'Treat benefits, registration and leave as universal facts because checking the local rules requires opening another tab. A better version is to verify deadlines and eligibility with the relevant clinic, employer or government service.' },
      { heading: 'Keep safety information factual', body: 'The humor stops at the planning habit. For pregnancy, birth, infant health or an urgent symptom, use qualified medical advice and local emergency care.' },
    ],
  },
  {
    slug: 'changing-jobs-or-cities',
    title: 'Build a spreadsheet that decides nothing',
    summary: 'A low-ROI tour of endlessly comparing hypothetical jobs and cities while avoiding the one question that changes the decision.',
    applicability: 'Employment, housing, tax and social-insurance rules vary by place and date; check the current local source.',
    mappedGuideIds: ['19-001', '19-003', '04-003', '15-001'],
    sections: [
      { heading: 'Give every uncertainty a new tab', body: 'Compare rent, commute, salary and weather to three decimal places. Leave health, relationships and the option to change your mind in the notes column, where they cannot interrupt the formula.' },
      { heading: 'Count the cost already paid', body: 'A move becomes impossible once enough effort has gone into researching it. Past effort is a compelling narrator, even though it cannot be recovered; compare the remaining options from today forward.' },
      { heading: 'Use a decision window', body: 'Write down what information would change the decision, who can confirm it, and when to decide. That turns research into a tool instead of a hobby with rent.' },
    ],
  },
  {
    slug: 'after-a-layoff',
    title: 'After a layoff, alphabetize your inbox first',
    summary: 'The familiar detour of doing tidy, low-stakes tasks while consequential dates and local support options stay unopened.',
    applicability: 'This is not employment or legal advice. Preserve relevant documents and check deadlines with local labor authorities or a qualified adviser.',
    mappedGuideIds: ['07-001', '07-002', '19-001', '29-003'],
    sections: [
      { heading: 'Start with the easiest task, forever', body: 'Rename every file before finding out whether it matters. A calmer approach is to make one folder for notices and dates, then identify the next deadline with a local official source.' },
      { heading: 'Treat asking for help as a later milestone', body: 'Wait until the perfect résumé, perfect mood and perfect plan arrive together. Meanwhile, a trusted person can help list immediate expenses and check what support may be available.' },
      { heading: 'Protect the person doing the planning', body: 'A job loss can be a serious shock. Keep basic routines where possible, ask someone reliable to check in, and seek professional support when distress becomes hard to manage.' },
    ],
  },
  {
    slug: 'marriage',
    title: 'Turn a relationship into a quarterly business review',
    summary: 'A satire of reducing a relationship to a spreadsheet, while still taking money, safety and honest communication seriously.',
    applicability: 'This is not relationship, legal or financial advice. For coercion or immediate danger, contact a trusted local support service.',
    mappedGuideIds: ['10-001', '10-004', '10-005', '12-001'],
    sections: [
      { heading: 'Score every kind gesture', body: 'Assign a point value to making dinner, remembering a date and sharing the remote. The method produces an immaculate ledger and a sudden shortage of affection.' },
      { heading: 'Skip the conversation; model it instead', body: 'A chart feels safer than asking what each person wants. For real decisions, speak plainly about expectations, money, care work, boundaries and what each person can freely choose.' },
      { heading: 'Safety is not a punchline', body: 'No financial comparison is a reason to stay in an unsafe situation. The linked book items are reading material, not a substitute for individual legal, financial or relationship support.' },
    ],
  },
  {
    slug: 'home-emergency-kit',
    title: 'Own five emergency kits and know where none of them are',
    summary: 'The low-ROI version of preparedness: shopping is finished, maintenance is postponed, and the flashlight is decorative.',
    applicability: 'Preparedness depends on local hazards, household needs and official guidance. This article is not an emergency checklist.',
    mappedGuideIds: ['01-003', '13-001', '13-002'],
    sections: [
      { heading: 'Buy the satisfying object', body: 'A new gadget gives an instant sense of readiness. Checking batteries, expiry dates, accessibility and whether everyone can find it is less photogenic, so naturally it goes on next month’s list.' },
      { heading: 'Prepare for a fictional household', body: 'Choose supplies for an imaginary average person, then forget medicines, mobility needs, pets or local weather. Use guidance from the local emergency authority and adjust it with the people who share the home.' },
      { heading: 'During an emergency, follow emergency services', body: 'This satire is for ordinary planning habits. If an urgent event is happening, contact local emergency services and follow their instructions.' },
    ],
  },
  {
    slug: 'helping-a-stranger',
    title: 'Post a poll while someone needs help',
    summary: 'A gentle roast of turning uncertainty into an online debate instead of choosing a safe, useful next step.',
    applicability: 'Do not put yourself or another person in danger. Call local emergency services and follow dispatcher instructions.',
    mappedGuideIds: ['13-001', '13-002', '13-003'],
    sections: [
      { heading: 'Crowdsource the first minute', body: 'Write a detailed thread about whether the situation looks serious enough. An emergency dispatcher has the inconvenient advantage of being able to tell you what to do next.' },
      { heading: 'Make help smaller and safer', body: 'You do not have to perform a rescue to be useful. Alert emergency services, ask another bystander to help, and follow instructions within your training and safety.' },
      { heading: 'Do not turn one scenario into a universal rule', body: 'The right action depends on what is happening and local guidance. If someone appears in immediate danger, contact emergency services now.' },
    ],
  },
  {
    slug: 'platform-licenses',
    title: 'Launch first; discover the business model in the error log',
    summary: 'A founder satire about treating compliance as a deployment toggle instead of a question to resolve before launch.',
    applicability: 'Legal requirements change and depend on activity and jurisdiction. This article is not legal advice; check current official rules or consult qualified counsel.',
    mappedGuideIds: ['26-001', '26-002', '26-005', '11-016'],
    sections: [
      { heading: 'Call everything “just a website”', body: 'A product may publish information, process transactions, host user posts and collect personal data at once. Putting “blog” in the repository name does not answer which rules apply.' },
      { heading: 'Turn a checklist into a launch-day surprise', body: 'Avoid asking what the service actually does, where it operates and whose data it handles. Those are precisely the inputs a current official checklist or local adviser needs.' },
      { heading: 'Verify before people rely on the service', body: 'This page is a planning joke, not a legal checklist. Check current primary sources for the country and activity involved before accepting users, money or personal information.' },
    ],
  },
  {
    slug: 'circadian-rhythm',
    title: 'Assume the body clock accepts calendar invites',
    summary: 'A satire of scheduling around biology as if a changing shift were just another notification setting.',
    applicability: 'Sleep and work-health decisions depend on individual circumstances. Speak with a qualified clinician or occupational-health service about symptoms or risk.',
    mappedGuideIds: ['02-039', '03-002', '03-003', '19-009'],
    sections: [
      { heading: 'Rename the night shift “flexibility”', body: 'A renamed calendar block looks less tiring. The body still gets the schedule, not the label, so keep the discussion grounded in actual hours, rest and workplace protections.' },
      { heading: 'Fix every difficult week with a productivity app', body: 'Try a new alarm, then a sleep score, then an even louder alarm. Useful records can help describe a pattern, but an app cannot diagnose a sleep disorder or redesign an unsafe schedule.' },
      { heading: 'Treat persistent symptoms as information', body: 'The punchline is the promise that a better calendar can solve everything. For ongoing sleep or health problems, ask a qualified clinician or occupational-health service.' },
    ],
  },
];
