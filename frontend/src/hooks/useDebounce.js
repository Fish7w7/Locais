// frontend/src/hooks/useDebounce.js
import { useState, useEffect } from 'react';

/**
 * Hook para fazer debounce de valores
 * @param {any} value 
 * @param {number} delay 
 * @returns {any} 
 */
export const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default useDebounce;