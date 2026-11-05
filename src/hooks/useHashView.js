import { useEffect, useState, useCallback } from 'react';

/** Minimal hash-based navigation so views are linkable without a router dependency. */
export function useHashView(views, fallback) {
  const read = useCallback(() => {
    const v = window.location.hash.replace(/^#\/?/, '');
    return views.includes(v) ? v : fallback;
  }, [views, fallback]);

  const [view, setView] = useState(read);

  useEffect(() => {
    const onChange = () => setView(read());
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, [read]);

  const navigate = useCallback((next) => {
    window.location.hash = `/${next}`;
    setView(next);
  }, []);

  return [view, navigate];
}
