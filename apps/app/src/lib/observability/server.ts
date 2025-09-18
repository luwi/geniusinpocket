import * as Sentry from "@sentry/nextjs";
import { PostHog } from "posthog-node";

let posthogClient: PostHog | undefined;

export function initObservability() {
  if (typeof process === "undefined") {
    return;
  }

  if (!Sentry.getCurrentHub().getClient()) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      tracesSampleRate: 1.0,
      debug: process.env.NODE_ENV === "development"
    });
  }

  if (!posthogClient && process.env.POSTHOG_KEY) {
    posthogClient = new PostHog(process.env.POSTHOG_KEY, {
      host: process.env.POSTHOG_HOST || "https://app.posthog.com",
      flushAt: 1
    });
  }
}

initObservability();

export function getPostHog() {
  if (!posthogClient) {
    throw new Error("PostHog client is not initialised. Set POSTHOG_KEY and POSTHOG_HOST.");
  }

  return posthogClient;
}
