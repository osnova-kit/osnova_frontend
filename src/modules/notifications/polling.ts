const POLL_MS = 60_000;

/**
 * Calls `tick` now, every `interval` while the page is visible, and again when it
 * becomes visible. Returns a function that stops it.
 */
export function startPolling(tick: () => void, interval = POLL_MS): () => void {
  const run = () => {
    if (document.visibilityState === 'visible') tick();
  };

  run();
  const timer = setInterval(run, interval);
  document.addEventListener('visibilitychange', run);
  return () => {
    clearInterval(timer);
    document.removeEventListener('visibilitychange', run);
  };
}
