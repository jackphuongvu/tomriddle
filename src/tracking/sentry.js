import * as Sentry from '@sentry/browser';
import { Integrations } from '@sentry/tracing';

if (process.env.NODE_ENV === 'production') {
  Sentry.init({
    dsn:
      'https://ce393e73e1e74437accc9886f98abb7d@o69899.ingest.sentry.io/149608',

    // To set your release version
    release: `typewritesomething@${process.env.npm_package_version}`,
    integrations: [new Integrations.BrowserTracing()],

    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0,
  });
}
