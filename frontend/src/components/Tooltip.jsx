// frontend/src/components/Tooltip.jsx
import { useState } from 'react';

const Tooltip = ({ 
  children, 
  content,
  position = 'top', // top, bottom, left, right
  delay = 200
}) => {
  const [show, setShow] = useState(false);
  let timeout;

  const handleMouseEnter = () => {
    timeout = setTimeout(() => setShow(true), delay);
  };

  const handleMouseLeave = () => {
    clearTimeout(timeout);
    setShow(false);
  };

  const positions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  };

  const arrows = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-gray-900 dark:border-t-gray-700',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-gray-900 dark:border-b-gray-700',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-gray-900 dark:border-l-gray-700',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-gray-900 dark:border-r-gray-700'
  };

  if (!content) return children;

  return (
    <div 
      className="relative inline-flex"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
    >
      {children}
      
      {show && (
        <div className={`absolute z-50 ${positions[position]}`}>
          <div className="relative">
            {/* Tooltip */}
            <div className="bg-gray-900 dark:bg-gray-700 text-white text-xs rounded py-1 px-2 whitespace-nowrap shadow-lg">
              {content}
            </div>
            
            {/* Arrow */}
            <div className={`absolute w-0 h-0 border-4 border-transparent ${arrows[position]}`} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Tooltip;

// EXEMPLO DE USO:
/*
import Tooltip from '../components/Tooltip';
import { Info } from 'lucide-react';

const MyComponent = () => {
  return (
    <div>
      {/* Tooltip simples }
      <Tooltip content="Clique para mais informações">
        <button>Hover me</button>
      </Tooltip>

      {/* Tooltip com ícone }
      <Tooltip content="Esta é uma informação importante" position="right">
        <Info className="w-4 h-4 text-gray-400 cursor-help" />
      </Tooltip>

      {/* Tooltip em badges }
      <Tooltip content="Usuário verificado">
        <Badge variant="success">✓ Verificado</Badge>
      </Tooltip>
    </div>
  );
};
*/