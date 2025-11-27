// frontend/src/components/Badge.jsx

const Badge = ({ 
  children, 
  variant = 'default',
  size = 'md',
  rounded = false,
  icon: Icon,
  className = ''
}) => {
  const variants = {
    default: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    primary: 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200',
    success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    danger: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    pink: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
    indigo: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
  };

  const sizes = {
    xs: 'px-2 py-0.5 text-xs',
    sm: 'px-2 py-1 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base'
  };

  const roundedClass = rounded ? 'rounded-full' : 'rounded';

  return (
    <span 
      className={`
        inline-flex items-center gap-1 font-medium
        ${variants[variant]} 
        ${sizes[size]} 
        ${roundedClass}
        ${className}
      `}
    >
      {Icon && <Icon className="w-3 h-3" />}
      {children}
    </span>
  );
};

// Badges pré-configurados para status
export const StatusBadge = ({ status }) => {
  const statusConfig = {
    pending: { label: 'Pendente', variant: 'warning' },
    accepted: { label: 'Aceito', variant: 'info' },
    in_progress: { label: 'Em Andamento', variant: 'purple' },
    completed: { label: 'Concluído', variant: 'success' },
    cancelled: { label: 'Cancelado', variant: 'danger' },
    rejected: { label: 'Rejeitado', variant: 'default' },
    reviewing: { label: 'Em Análise', variant: 'info' }
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <Badge variant={config.variant} size="sm" rounded>
      {config.label}
    </Badge>
  );
};

// Badge para tipo de vaga
export const JobTypeBadge = ({ type }) => {
  const typeConfig = {
    temporary: { label: 'Temporária', variant: 'info' },
    trial: { label: 'Experiência', variant: 'warning' },
    permanent: { label: 'Efetiva', variant: 'success' }
  };

  const config = typeConfig[type] || typeConfig.temporary;

  return (
    <Badge variant={config.variant} size="sm" rounded>
      {config.label}
    </Badge>
  );
};

// Badge para tipo de usuário
export const UserTypeBadge = ({ type }) => {
  const typeConfig = {
    client: { label: 'Cliente', variant: 'success' },
    provider: { label: 'Prestador', variant: 'purple' },
    company: { label: 'Empresa', variant: 'primary' },
    admin: { label: 'Admin', variant: 'danger' }
  };

  const config = typeConfig[type] || typeConfig.client;

  return (
    <Badge variant={config.variant} size="sm" rounded>
      {config.label}
    </Badge>
  );
};

// Badge com contador
export const CountBadge = ({ count, max = 99 }) => {
  const displayCount = count > max ? `${max}+` : count;

  return (
    <Badge variant="danger" size="xs" rounded className="absolute -top-1 -right-1 min-w-[1.25rem] h-5 flex items-center justify-center">
      {displayCount}
    </Badge>
  );
};

export default Badge;

// se quiser usar o Badge em algum lugar, importe e utilize assim:
/*
import Badge, { StatusBadge, JobTypeBadge, CountBadge } from '../components/Badge';
import { Bell } from 'lucide-react';

const MyComponent = () => {
  return (
    <div className="space-y-4">
      { Badge simples }
      <Badge variant="primary">Novo</Badge>
      
      {/* Badge com ícone }
      <Badge variant="success" icon={CheckCircle}>Verificado</Badge>
      
      {/* Status badges }
      <StatusBadge status="pending" />
      <StatusBadge status="completed" />
      
      {/* Job type badge }
      <JobTypeBadge type="permanent" />
      
      {/* Contador }
      <div className="relative inline-block">
        <Bell className="w-6 h-6" />
        <CountBadge count={5} />
      </div>
    </div>
    
  );
};
*/