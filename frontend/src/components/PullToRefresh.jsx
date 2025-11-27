// frontend/src/components/PullToRefresh.jsx
import { useState, useRef, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

const PullToRefresh = ({ 
  onRefresh, 
  children,
  threshold = 80,
  maxPullDistance = 120
}) => {
  const [pulling, setPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  
  const startY = useRef(0);
  const containerRef = useRef(null);

  const handleTouchStart = (e) => {
    if (window.scrollY === 0) {
      startY.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e) => {
    if (refreshing || window.scrollY > 0) return;

    const currentY = e.touches[0].clientY;
    const distance = currentY - startY.current;

    if (distance > 0) {
      setPulling(true);
      setPullDistance(Math.min(distance, maxPullDistance));
    }
  };

  const handleTouchEnd = async () => {
    if (pullDistance >= threshold && !refreshing) {
      setRefreshing(true);
      
      try {
        await onRefresh?.();
      } catch (error) {
        console.error('Erro ao atualizar:', error);
      } finally {
        setTimeout(() => {
          setRefreshing(false);
          setPulling(false);
          setPullDistance(0);
        }, 500);
      }
    } else {
      setPulling(false);
      setPullDistance(0);
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('touchstart', handleTouchStart);
    container.addEventListener('touchmove', handleTouchMove);
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [pullDistance, refreshing]);

  const pullPercentage = Math.min((pullDistance / threshold) * 100, 100);
  const shouldRelease = pullDistance >= threshold;

  return (
    <div ref={containerRef} className="relative">
      {/* Indicador de Pull */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-center transition-all duration-200 overflow-hidden"
        style={{
          height: pulling || refreshing ? `${Math.min(pullDistance, 60)}px` : '0px',
          opacity: pulling || refreshing ? 1 : 0
        }}
      >
        <div className="flex flex-col items-center gap-1">
          <RefreshCw
            className={`w-6 h-6 text-primary-600 dark:text-primary-400 transition-transform ${
              refreshing ? 'animate-spin' : ''
            }`}
            style={{
              transform: refreshing ? 'rotate(0deg)' : `rotate(${pullPercentage * 3.6}deg)`
            }}
          />
          <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
            {refreshing 
              ? 'Atualizando...'
              : shouldRelease 
                ? 'Solte para atualizar'
                : 'Puxe para atualizar'
            }
          </span>
        </div>
      </div>

      {/* Conteúdo */}
      <div
        className="transition-transform duration-200"
        style={{
          transform: pulling || refreshing 
            ? `translateY(${Math.min(pullDistance, 60)}px)` 
            : 'translateY(0)'
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default PullToRefresh;

// Hook customizado para facilitar uso
// frontend/src/hooks/usePullToRefresh.js
import { useCallback } from 'react';

export const usePullToRefresh = (refreshFunction) => {
  const handleRefresh = useCallback(async () => {
    try {
      await refreshFunction();
    } catch (error) {
      console.error('Erro ao atualizar:', error);
      throw error;
    }
  }, [refreshFunction]);

  return handleRefresh;
};

// Voce pode usar o PullToRefresh assim:
/*
import PullToRefresh from '../components/PullToRefresh';
import { usePullToRefresh } from '../hooks/usePullToRefresh';

const MyListPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const response = await api.get('/data');
    setData(response.data);
    setLoading(false);
  };

  const handleRefresh = usePullToRefresh(loadData);

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="space-y-3">
        {data.map(item => (
          <Card key={item.id}>{item.name}</Card>
        ))}
      </div>
    </PullToRefresh>
  );
};
*/