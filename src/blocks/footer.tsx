import { SiteFooter, type FooterColumn } from '@/components/site-footer';

export function Footer() {
  const columns: FooterColumn[] = [
    {
      title: 'Read',
      links: [
        { label: 'Complete guide', href: '/book' },
        { label: 'Stories', href: '/articles' },
        { label: 'Glossary', href: '/glossary' },
      ],
    },
    {
      title: 'Explore',
      links: [
        { label: 'Daily card', href: '/daily' },
        { label: 'Quiz', href: '/quiz' },
        { label: 'My list', href: '/dashboard' },
      ],
    },
    {
      title: 'Project',
      links: [
        { label: 'About', href: '/about' },
        { label: 'Privacy', href: '/privacy-policy' },
        { label: 'Terms', href: '/terms-of-service' },
      ],
    },
  ];

  return (
    <SiteFooter
      tagline="A full guide, with the sources still attached."
      columns={columns}
    />
  );
}
