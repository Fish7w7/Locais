// frontend/src/components/Card.jsx 
const Card = ({ children, className = '', hoverable = false, onClick, ...props }) => {
  return (
    <div 
      onClick={onClick}
      {...props}
      className={`
        bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4
        ${hoverable ? 'hover:shadow-md transition-shadow cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default Card;
