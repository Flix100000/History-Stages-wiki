// What people searched for is the most useful thing a young wiki can learn: a term with
// hits says which page is being read, a term without says which page is missing. The
// search runs entirely in the browser, so nothing records it unless we say so.
//
// Sent as a GoatCounter event, not a page view, so it cannot be confused with traffic.
// GoatCounter skips localhost on its own, so a dev server adds nothing.

let pending = null;
let lastTerm = '';
let lastSentAt = 0;

// One page load fires the route update more than once, and a search page that rewrites its
// query while somebody types would otherwise file "reci", "recip" and "recipe" as three
// searches. Wait for the query to sit still, then send it once.
const SETTLE_MS = 1200;
const REPEAT_WINDOW_MS = 30000;

export function onRouteUpdate({location}) {
  if (typeof window === 'undefined') {
    return;
  }
  if (!location.pathname.replace(/\/$/, '').endsWith('/search')) {
    return;
  }

  const query = new URLSearchParams(location.search).get('q');
  const term = (query ?? '').trim().toLowerCase().slice(0, 80);
  if (!term) {
    return;
  }

  window.clearTimeout(pending);
  pending = window.setTimeout(() => {
    const now = Date.now();
    if (term === lastTerm && now - lastSentAt < REPEAT_WINDOW_MS) {
      return;
    }
    if (!window.goatcounter || typeof window.goatcounter.count !== 'function') {
      return;
    }
    lastTerm = term;
    lastSentAt = now;
    window.goatcounter.count({
      path: `search/${term}`,
      title: `Search: ${term}`,
      event: true,
    });
  }, SETTLE_MS);
}
