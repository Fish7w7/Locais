// frontend/src/components/EmptyState.jsx
import { 
  Search, 
  Briefcase, 
  Users, 
  FileText, 
  Inbox,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import Button from './Button';
import Card from './Card';

const EmptyState = ({ 
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  variant = 'default' // default, search, error, success
}) => {
  const getIconColor = () => {
    const colors = {
      default: 'text-gray-400 dark:text-gray-600',
      search: 'text-blue-400 dark:text-blue-600',
      error: 'text-red-400 dark:text-red-600',
      success: 'text-green-400 dark:text-green-600'
    };
    return colors[variant] || colors.default;
  };

  return (
    <Card>
      <div className="text-center py-12 px-4">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
          <Icon className={`w-10 h-10 ${getIconColor()}`} />
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {title}
        </h3>
        
        <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-sm mx-auto">
          {description}
        </p>

        {actionLabel && onAction && (
          <Button onClick={onAction}>
            {actionLabel}
          </Button>
        )}
      </div>
    </Card>
  );
};

// Estados vazios pré-configurados
export const EmptyStateNoProviders = ({ onAction }) => (
  <EmptyState
    icon={Users}
    title="Nenhum prestador encontrado"
    description="Não encontramos prestadores de serviços com esses critérios. Tente ajustar os filtros."
    actionLabel="Limpar filtros"
    onAction={onAction}
    variant="search"
  />
);

export const EmptyStateNoJobs = ({ onAction }) => (
  <EmptyState
    icon={Briefcase}
    title="Nenhuma vaga disponível"
    description="Não há vagas publicadas no momento. Volte mais tarde para ver novas oportunidades."
    variant="default"
  />
);

export const EmptyStateNoApplications = ({ onAction }) => (
  <EmptyState
    icon={FileText}
    title="Nenhuma candidatura"
    description="Você ainda não se candidatou a nenhuma vaga. Explore as vagas disponíveis e candidate-se!"
    actionLabel="Ver Vagas"
    onAction={onAction}
  />
);

export const EmptyStateNoServices = ({ onAction }) => (
  <EmptyState
    icon={Inbox}
    title="Nenhum serviço solicitado"
    description="Você ainda não solicitou nenhum serviço. Encontre prestadores qualificados e solicite agora!"
    actionLabel="Buscar Prestadores"
    onAction={onAction}
  />
);

export const EmptyStateNoReceivedServices = () => (
  <EmptyState
    icon={Inbox}
    title="Nenhuma solicitação recebida"
    description="Você ainda não recebeu solicitações de serviço. Mantenha seu perfil atualizado para aparecer nas buscas."
    variant="default"
  />
);

export const EmptyStateNoProposals = () => (
  <EmptyState
    icon={FileText}
    title="Nenhuma proposta recebida"
    description="Você ainda não recebeu propostas de empresas. Continue prestando serviços de qualidade para ser notado!"
    variant="default"
  />
);

export const EmptyStateNoMyJobs = ({ onAction }) => (
  <EmptyState
    icon={Briefcase}
    title="Nenhuma vaga criada"
    description="Você ainda não publicou nenhuma vaga. Crie sua primeira vaga e comece a receber candidatos!"
    actionLabel="Criar Vaga"
    onAction={onAction}
  />
);

export const EmptyStateSearchNoResults = ({ searchTerm, onClear }) => (
  <EmptyState
    icon={Search}
    title="Nenhum resultado encontrado"
    description={`Não encontramos resultados para "${searchTerm}". Tente outros termos de busca.`}
    actionLabel="Limpar busca"
    onAction={onClear}
    variant="search"
  />
);

export const EmptyStateError = ({ message, onRetry }) => (
  <EmptyState
    icon={AlertCircle}
    title="Erro ao carregar"
    description={message || "Ocorreu um erro ao carregar os dados. Por favor, tente novamente."}
    actionLabel="Tentar novamente"
    onAction={onRetry}
    variant="error"
  />
);

export const EmptyStateSuccess = ({ message }) => (
  <EmptyState
    icon={CheckCircle}
    title="Tudo certo!"
    description={message}
    variant="success"
  />
);

export default EmptyState;

// Caso queira usar algum dos EmptyStates pré-configurados, importe e utilize assim:
/*
import { 
  EmptyStateNoProviders, 
  EmptyStateError,
  EmptyStateSearchNoResults 
} from '../components/EmptyState';

const ProvidersPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [providers, setProviders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  if (loading) {
    return <SkeletonList />;
  }

  if (error) {
    return <EmptyStateError message={error} onRetry={loadProviders} />;
  }

  if (providers.length === 0 && searchTerm) {
    return (
      <EmptyStateSearchNoResults 
        searchTerm={searchTerm}
        onClear={() => setSearchTerm('')}
      />
    );
  }

  if (providers.length === 0) {
    return <EmptyStateNoProviders onAction={clearFilters} />;
  }

  return (
    <div className="space-y-3">
      {providers.map(provider => (
        <ProviderCard key={provider.id} provider={provider} />
      ))}
    </div>
  );
};
*/