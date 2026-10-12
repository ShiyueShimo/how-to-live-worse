import { createFileRoute } from '@tanstack/react-router';

import { envConfigs } from '@/config';
import { buildRobotsTxt } from '@/lib/public-discovery';

export const Route = createFileRoute('/robots.txt')({
  server: {
    handlers: {
      GET: () =>
        new Response(buildRobotsTxt(envConfigs.app_url), {
          headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        }),
    },
  },
});
