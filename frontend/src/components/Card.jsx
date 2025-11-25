const Card = ({ children, className = '', padding = true, hoverable = false }) => {
  const baseClasses = 'bg-white dark:bg-gray-800 rounded-lg shadow';
  const paddingClass = padding ? 'p-6' : '';
  const hoverClass = hoverable ? 'hover:shadow-md transition-shadow cursor-pointer' : '';
  
  return (
    <div className={`${baseClasses} ${paddingClass} ${hoverClass} ${className}`}>
      {children}
    </div>
  );
};


export default Card;