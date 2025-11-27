// frontend/src/hooks/useInfiniteScroll.js
import { useState, useEffect, useRef } from 'react';

/**
 * Hook para infinite scroll
 * @param {Function} loadMore 
 * @param {boolean} hasMore 
 */
export const useInfiniteScroll = (loadMore, hasMore) => {
  const [loading, setLoading] = useState(false);
  const observerRef = useRef(null);
  const loadingRef = useRef(null);

  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '100px',
      threshold: 0.1
    };

    observerRef.current = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && hasMore && !loading) {
        setLoading(true);
        loadMore().finally(() => setLoading(false));
      }
    }, options);

    const currentRef = loadingRef.current;
    if (currentRef) {
      observerRef.current.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observerRef.current?.unobserve(currentRef);
      }
    };
  }, [hasMore, loading, loadMore]);

  return { loadingRef, loading };
};

export default useInfiniteScroll;