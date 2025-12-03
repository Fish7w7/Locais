// frontend/src/components/Badge.jsx

export const StatusBadge = ({ status }) => {
  const getStatusConfig = (status) => {
    const configs = {
      pending: { 
        label: 'Pendente', 
        color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' 
      },
      accepted: { 
        label: 'Aceito', 
        color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
      },
      rejected: { 
        label: 'Rejeitado', 
        color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' 
      },
      completed: { 
        label: 'Concluído', 
        color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
      },
      cancelled: { 
        label: 'Cancelado', 
        color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200' 
      },
      in_progress: { 
        label: 'Em Progresso', 
        color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' 
      },
      reviewing: { 
        label: 'Em Análise', 
        color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
      }
    };
    return configs[status] || configs.pending;
  };

  const config = getStatusConfig(status);

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${config.color}`}>
      {config.label}
    </span>
  );
};

export const JobTypeBadge = ({ type }) => {
  const getTypeConfig = (type) => {
    const configs = {
      temporary: { 
        label: 'Temporária', 
        color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' 
      },
      trial: { 
        label: 'Experiência', 
        color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
      },
      permanent: { 
        label: 'Efetiva', 
        color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
      }
    };
    return configs[type] || configs.temporary;
  };

  const config = getTypeConfig(type);

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  );
};

export default StatusBadge;