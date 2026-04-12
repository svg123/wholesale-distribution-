import { useState, useCallback, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * Custom hook that maintains an in-app navigation history stack,
 * independent of the browser's native history.
 *
 * Features:
 *  - Tracks visited paths in a stack
 *  - Supports goBack() / goForward()
 *  - Exposes canGoBack / canGoForward booleans
 *  - Ignores duplicate consecutive entries (e.g. re-renders)
 *  - Clears forward stack on new navigation (like a real browser)
 */
const MAX_HISTORY = 50;

export default function useNavigationHistory() {
  const location = useLocation();
  const navigate = useNavigate();

  // Using refs for the stack so we always read the latest value
  // without triggering re-renders on every push.
  const historyStack = useRef([]);
  const currentIndex = useRef(-1);

  // We use a simple counter to force re-render when back/forward availability changes
  const [, setTick] = useState(0);
  const forceUpdate = useCallback(() => setTick((t) => t + 1), []);

  const canGoBack = currentIndex.current > 0;
  const canGoForward = currentIndex.current < historyStack.current.length - 1;

  // Initialise on first mount — push the current location
  useEffect(() => {
    historyStack.current = [location.pathname + location.search];
    currentIndex.current = 0;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Listen for location changes (from react-router navigation, sidebar clicks, etc.)
  useEffect(() => {
    const path = location.pathname + location.search;
    const idx = currentIndex.current;

    // Skip if this is the same location we're already at (avoid duplicates from re-renders)
    if (historyStack.current[idx] === path) return;

    // If the user navigated forward (e.g. clicked a link after going back),
    // trim the forward history — just like a real browser
    if (idx < historyStack.current.length - 1) {
      historyStack.current = historyStack.current.slice(0, idx + 1);
    }

    // Push new entry
    historyStack.current.push(path);

    // Enforce max size — drop oldest entries
    if (historyStack.current.length > MAX_HISTORY) {
      historyStack.current = historyStack.current.slice(-MAX_HISTORY);
    }

    currentIndex.current = historyStack.current.length - 1;
    forceUpdate();
  }, [location.pathname, location.search, forceUpdate]);

  const goBack = useCallback(() => {
    if (currentIndex.current > 0) {
      currentIndex.current -= 1;
      const target = historyStack.current[currentIndex.current];
      navigate(target, { replace: false });
      forceUpdate();
    }
  }, [navigate, forceUpdate]);

  const goForward = useCallback(() => {
    if (currentIndex.current < historyStack.current.length - 1) {
      currentIndex.current += 1;
      const target = historyStack.current[currentIndex.current];
      navigate(target, { replace: false });
      forceUpdate();
    }
  }, [navigate, forceUpdate]);

  return {
    canGoBack,
    canGoForward,
    goBack,
    goForward,
    historyLength: historyStack.current.length,
    currentPath: location.pathname + location.search,
  };
}
