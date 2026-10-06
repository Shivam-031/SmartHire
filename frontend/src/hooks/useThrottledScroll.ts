import { useEffect, useRef } from 'react';

/**
 * Throttles a scroll callback to the specified interval.
 * The callback receives an object describing whether the page is scrolled
 * and the scroll progress as a percentage of total scrollable height.
 */
export const useThrottledScroll = (
  callback: (data: { isScrolled: boolean; progress: number }) => void,
  ms = 100
) => {
  const lastCall = useRef(0);
  useEffect(() => {
    const onScroll = () => {
      const now = Date.now();
      if (now - lastCall.current < ms) return;
      lastCall.current = now;
      const y = window.scrollY;
      const max = document.body.scrollHeight - window.innerHeight;
      const progress = max ? (y / max) * 100 : 0;
      callback({ isScrolled: y > 0, progress });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    // Initial call to set correct state on load
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [callback, ms]);
};
