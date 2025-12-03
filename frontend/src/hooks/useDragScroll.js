// frontend/src/hooks/useDragScroll.js
import { useRef, useEffect } from 'react';

export const useDragScroll = () => {
  const scrollRef = useRef(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;

    const handleMouseDown = (e) => {
      isDragging.current = true;
      element.style.cursor = 'grabbing';
      element.style.userSelect = 'none';
      
      startX.current = e.pageX - element.offsetLeft;
      scrollLeft.current = element.scrollLeft;
    };

    const handleMouseMove = (e) => {
      if (!isDragging.current) return;
      e.preventDefault();
      
      const x = e.pageX - element.offsetLeft;
      const walk = (x - startX.current) * 2; 
      element.scrollLeft = scrollLeft.current - walk;
    };

    const handleMouseUp = () => {
      isDragging.current = false;
      element.style.cursor = 'grab';
      element.style.userSelect = '';
    };

    const handleMouseLeave = () => {
      if (isDragging.current) {
        isDragging.current = false;
        element.style.cursor = 'grab';
        element.style.userSelect = '';
      }
    };

    const handleTouchStart = (e) => {
      isDragging.current = true;
      startX.current = e.touches[0].pageX - element.offsetLeft;
      scrollLeft.current = element.scrollLeft;
    };

    const handleTouchMove = (e) => {
      if (!isDragging.current) return;
      
      const x = e.touches[0].pageX - element.offsetLeft;
      const walk = (x - startX.current) * 2;
      element.scrollLeft = scrollLeft.current - walk;
    };

    const handleTouchEnd = () => {
      isDragging.current = false;
    };

    element.addEventListener('mousedown', handleMouseDown);
    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseup', handleMouseUp);
    element.addEventListener('mouseleave', handleMouseLeave);
    
    element.addEventListener('touchstart', handleTouchStart);
    element.addEventListener('touchmove', handleTouchMove);
    element.addEventListener('touchend', handleTouchEnd);

    element.style.cursor = 'grab';

    return () => {
      element.removeEventListener('mousedown', handleMouseDown);
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseup', handleMouseUp);
      element.removeEventListener('mouseleave', handleMouseLeave);
      
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  return scrollRef;
};

export default useDragScroll;