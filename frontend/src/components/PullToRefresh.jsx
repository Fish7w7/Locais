// frontend/src/components/PullToRefresh.jsx
import { useState, useRef } from 'react';
import { RefreshCw } from 'lucide-react';

const PullToRefresh = ({ onRefresh, children }) => {
  const [pulling, setPulling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(0);
  const currentY = useRef(0);

  const handleTouchStart = (e) => {
    if (window.scrollY === 0) {
      startY.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e) => {
    if (window.scrollY === 0 && startY.current > 0) {
      currentY.current = e.touches[0].clientY;
      const pullDistance = currentY.current - startY.current;
      
      if (pullDistance > 80 && !refreshing) {
        setPulling(true);
      }
    }
  };

  const handleTouchEnd = async () => {
    if (pulling && !refreshing) {
      setRefreshing(true);
      setPulling(false);
      
      try {
        await onRefresh();
      } catch (error) {
        console.error('Erro ao atualizar:', error);
      } finally {
        setRefreshing(false);
      }
    }
    
    startY.current = 0;
    currentY.current = 0;
    setPulling(false);
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="min-h-screen"
    >
      {/* Pull indicator */}
      {(pulling || refreshing) && (
        <div className="flex justify-center py-4 bg-white dark:bg-gray-800">
          <RefreshCw 
            className={`w-6 h-6 text-primary-600 dark:text-primary-400 ${refreshing ? 'animate-spin' : ''}`} 
          />
        </div>
      )}
      
      {children}
    </div>
  );
};

export default PullToRefresh;