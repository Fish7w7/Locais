// frontend/src/hooks/useSearch.js
import { useState, useEffect } from 'react';
import { useDebounce } from './useDebounce';

/**
 * Hook para busca com debounce
 * @param {Function} searchFn 
 * @param {number} delay 
 */
export const useSearch = (searchFn, delay = 500) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const debouncedSearchTerm = useDebounce(searchTerm, delay);

  useEffect(() => {
    if (!debouncedSearchTerm) {
      setResults([]);
      return;
    }

    const search = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await searchFn(debouncedSearchTerm);
        setResults(data);
      } catch (err) {
        setError(err.message);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    search();
  }, [debouncedSearchTerm, searchFn]);

  return {
    searchTerm,
    setSearchTerm,
    results,
    loading,
    error,
    hasSearched: debouncedSearchTerm.length > 0
  };
};

export default useSearch;