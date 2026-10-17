import { useState, useRef, useCallback } from 'react';

/**
 * useHeaderScroll - Native lightweight hook to hide top header on scroll down
 * and reveal on scroll up. Optimized with a delta buffer to prevent jitter.
 */
export const useHeaderScroll = (threshold = 30) => {
  const [isHeaderHidden, setIsHeaderHidden] = useState(false);
  const lastScrollTop = useRef(0);

  const handleIonScroll = useCallback(
    (e: CustomEvent<{ scrollTop: number }>) => {
      const current = e.detail?.scrollTop ?? 0;

      // Scroll down past threshold -> hide header
      if (current > lastScrollTop.current + 6 && current > threshold) {
        setIsHeaderHidden((prev) => (prev ? prev : true));
      }
      // Scroll up or near top -> show header
      else if (current < lastScrollTop.current - 6 || current <= 15) {
        setIsHeaderHidden((prev) => (!prev ? prev : false));
      }

      lastScrollTop.current = current;
    },
    [threshold]
  );

  return { isHeaderHidden, handleIonScroll };
};
