const DSN = import.meta.env.VITE_SENTRY_DSN || '';
const QUEUE_LIMIT = 20;

type Report = (error: unknown) => void;

let send: Report | null = null;
const queue: unknown[] = [];

export function reportError(error: unknown) {
  if (!DSN) return;
  if (send) send(error);
  else if (queue.length < QUEUE_LIMIT) queue.push(error);
}

function onEarlyError(event: ErrorEvent | PromiseRejectionEvent) {
  const error = 'reason' in event ? event.reason : event.error;
  if (error) reportError(error);
}

export function initErrorTracking() {
  if (DSN) {
    window.addEventListener('error', onEarlyError);
    window.addEventListener('unhandledrejection', onEarlyError);
    import('./sentry')
      .then(({ startSentry }) => {
        // From here on the SDK catches unhandled errors itself
        window.removeEventListener('error', onEarlyError);
        window.removeEventListener('unhandledrejection', onEarlyError);
        send = startSentry(DSN);
        for (const error of queue.splice(0)) send(error);
      })
      .catch(() => {
        // Blocked (an ad blocker) or offline: the site works without it
      });
  }
}
