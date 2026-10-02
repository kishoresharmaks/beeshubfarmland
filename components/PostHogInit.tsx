'use client';

import { useEffect } from 'react';
import posthog from 'posthog-js';

let missingTokenWarned = false;

export default function PostHogInit() {
  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;

    if (!token) {
      if (process.env.NODE_ENV !== 'production') {
        throw new Error(
          'NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN is configured'
        );
      }
      if (!missingTokenWarned) {
        missingTokenWarned = true;
        console.warn(
          'PostHog did not start: NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN is not set. This deploy sends no analytics events. Set this variable in the hosting environment.'
        );
      }
      return;
    }

    if (!posthog.__loaded) {
      posthog.init(token, {
        api_host: host,
        defaults: '2026-05-30',
        capture_pageview: 'history_change',
        capture_exceptions: true,
        debug: process.env.NODE_ENV === 'development',
        tracing_headers: [window.location.hostname],
      });
    }
  }, []);

  return null;
}
