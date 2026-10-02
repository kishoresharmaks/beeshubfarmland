import { PostHog } from 'posthog-node';

let missingTokenWarned = false;

export function createPostHogClient() {
  const token = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;

  if (!token) {
    if (process.env.NODE_ENV !== 'production') {
      throw new Error(
        'NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN is configured'
      );
    }
    if (!missingTokenWarned) {
      missingTokenWarned = true;
      console.warn(
        'PostHog did not start: NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN is not set. Server events are missed. Set this variable in the hosting environment.'
      );
    }
    return null;
  }

  return new PostHog(token, {
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    flushAt: 1,
    flushInterval: 0,
    enableExceptionAutocapture: true,
  });
}

export function getPostHogDistinctId(request: Request, fallback: string) {
  return request.headers.get('x-posthog-distinct-id') || fallback;
}

export async function captureServerEvent(
  request: Request,
  event: string,
  properties: Record<string, unknown>,
  fallbackDistinctId: string
) {
  const client = createPostHogClient();
  if (!client) return;

  client.capture({
    distinctId: getPostHogDistinctId(request, fallbackDistinctId),
    event,
    properties,
  });
  await client.shutdown();
}

export async function captureServerException(
  request: Request,
  error: unknown,
  fallbackDistinctId: string
) {
  const client = createPostHogClient();
  if (!client) return;

  client.captureException(error, getPostHogDistinctId(request, fallbackDistinctId));
  await client.shutdown();
}
