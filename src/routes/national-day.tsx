import { createFileRoute, Link } from '@tanstack/react-router';

import { GuideInfoPage, InfoSection } from '@/components/guide-info-page';

function NationalDayPage() {
  return (
    <GuideInfoPage
      eyebrow="ARCHIVE · SEASONAL PAGE"
      title="The day off that became a planning project."
      intro="An evergreen archive about turning a free day into a spreadsheet, three itineraries and one more round of comparison. No stale travel advice or live holiday schedule is implied."
    >
      <InfoSection title="A perfectly ordinary archive">
        <p>
          First, compare every possible plan. Then check the weather in four
          cities you are not visiting. Add a shared document, color-code the
          options and call that “making the most of it.” The day remains free to
          be unoptimized.
        </p>
      </InfoSection>
      <InfoSection title="A lower-stakes ending">
        <p>
          Choose something that fits today, or do nothing with the page. Travel,
          spending and holiday decisions depend on personal circumstances; this
          archive is a joke, not an itinerary.
        </p>
        <p>
          <Link to="/book">Browse the source guide</Link> or draw a{' '}
          <Link to="/daily">small daily detour</Link>.
        </p>
      </InfoSection>
    </GuideInfoPage>
  );
}

export const Route = createFileRoute('/national-day')({
  head: () => ({
    meta: [
      { title: 'Archived day-off guide | HowToLiveWorse' },
      {
        name: 'description',
        content:
          'A seasonal archive about over-planning a day off, without stale travel recommendations.',
      },
    ],
  }),
  component: NationalDayPage,
});
