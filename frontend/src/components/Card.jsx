const Card = ({ 
  children, 
  className = '', 
  padding = true, 
  hoverable = false,
  onClick
}) => {
  const baseClasses = 'bg-white dark:bg-gray-800 rounded-lg shadow w-full max-w-full overflow-hidden';
  const paddingClass = padding ? 'p-4 sm:p-6' : '';
  const hoverClass = hoverable ? 'hover:shadow-md transition-shadow cursor-pointer' : '';
  const clickClass = onClick ? 'cursor-pointer' : '';
  
  return (
    <div 
      className={`${baseClasses} ${paddingClass} ${hoverClass} ${clickClass} ${className}`}
      onClick={onClick}
      style={{ 
        boxSizing: 'border-box',
        maxWidth: '100%',
        wordWrap: 'break-word',
        overflowWrap: 'break-word'
      }}
    >
      {children}
    </div>
  );
};

export default Card;