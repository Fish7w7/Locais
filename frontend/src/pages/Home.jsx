import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Briefcase,
  FileText,
  MessageCircle,
  Search,
  Shield,
  UserCheck,
  Users
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useActivityNotifications } from '../contexts/ActivityNotificationContext';
import { useChatNotifications } from '../contexts/ChatNotificationContext';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { counts } = useActivityNotifications();
  const { totalUnread } = useChatNotifications();

  const isProvider = user.type === 'provider';
  const isCompany = user.type === 'company';
  const isAdmin = user.type === 'admin' || user.role === 'admin';

  const roleLabels = {
    client: 'Cliente',
    provider: 'Prestador',
    company: 'Empresa',
    admin: 'Administrador'
  };

  const primaryActions = [
    {
      show: user.type === 'client',
      label: 'Buscar prestadores',
      description: 'Encontre profissionais por categoria',
      icon: Search,
      variant: 'primary',
      onClick: () => navigate('/services')
    },
    {
      show: user.type === 'client',
      label: 'Minhas solicitações',
      description: 'Acompanhe serviços enviados',
      icon: FileText,
      count: counts.services,
      onClick: () => navigate('/services', { state: { tab: 'my-requests' } })
    },
    {
      show: isProvider,
      label: 'Serviços recebidos',
      description: 'Veja solicitações de clientes',
      icon: Briefcase,
      variant: 'primary',
      count: counts.receivedServices,
      onClick: () => navigate('/services', { state: { tab: 'received' } })
    },
    {
      show: isProvider,
      label: 'Propostas recebidas',
      description: 'Responda oportunidades de empresas',
      icon: FileText,
      count: counts.jobProposals,
      onClick: () => navigate('/jobs', { state: { tab: 'my-proposals' } })
    },
    {
      show: isCompany,
      label: 'Criar vaga',
      description: 'Publique uma oportunidade',
      icon: Briefcase,
      variant: 'primary',
      onClick: () => navigate('/jobs', { state: { openCreateModal: true } })
    },
    {
      show: isCompany,
      label: 'Propostas enviadas',
      description: 'Acompanhe respostas dos prestadores',
      icon: FileText,
      onClick: () => navigate('/jobs', { state: { tab: 'sent-proposals' } })
    },
    {
      show: isCompany,
      label: 'Minhas vagas',
      description: 'Gerencie candidaturas recebidas',
      icon: Users,
      count: counts.jobApplications,
      onClick: () => navigate('/jobs', { state: { tab: 'my-jobs' } })
    },
    {
      show: isAdmin,
      label: 'Painel admin',
      description: 'Acompanhe usuários, vagas e moderação',
      icon: Shield,
      variant: 'primary',
      onClick: () => navigate('/admin')
    },
    {
      show: isAdmin,
      label: 'Serviços',
      description: 'Navegue pelos fluxos de contratação',
      icon: Search,
      onClick: () => navigate('/services')
    }
  ].filter((action) => action.show);

  const secondaryActions = [
    {
      label: 'Mensagens',
      description: totalUnread > 0 ? `${totalUnread} conversa(s) com mensagem nova` : 'Abra suas conversas',
      icon: MessageCircle,
      count: totalUnread,
      onClick: () => navigate('/chat')
    },
    {
      label: 'Perfil',
      description: 'Revise seus dados e preferências',
      icon: UserCheck,
      onClick: () => navigate('/profile')
    }
  ];

  const nextSteps = getNextSteps(user);
  const metrics = getMetrics(user, counts, totalUnread);
  const activityItems = [
    counts.receivedServices > 0 && {
      label: 'Solicitações de serviço pendentes',
      value: counts.receivedServices,
      onClick: () => navigate('/services', { state: { tab: 'received' } })
    },
    counts.jobProposals > 0 && {
      label: 'Propostas de vaga pendentes',
      value: counts.jobProposals,
      onClick: () => navigate('/jobs', { state: { tab: 'my-proposals' } })
    },
    counts.jobApplications > 0 && {
      label: 'Candidaturas aguardando resposta',
      value: counts.jobApplications,
      onClick: () => navigate('/jobs', { state: { tab: 'my-jobs' } })
    },
    totalUnread > 0 && {
      label: 'Mensagens não lidas',
      value: totalUnread,
      onClick: () => navigate('/chat')
    }
  ].filter(Boolean);

  return (
    <div className="space-y-5">
      <section className="rounded-lg bg-white p-5 shadow dark:bg-gray-800">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-medium text-primary-600 dark:text-primary-400">
              {roleLabels[user.type] || user.type}
            </p>
            <h2 className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
              Olá, {user.name}
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Continue de onde parou e resolva as pendências mais importantes primeiro.
            </p>
          </div>
          <button
            onClick={() => navigate('/profile')}
            className="shrink-0 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            Perfil
          </button>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Ações rápidas
        </h3>
        <div className="space-y-2">
          {primaryActions.map((action) => (
            <ActionButton key={action.label} {...action} />
          ))}
          {secondaryActions.map((action) => (
            <ActionButton key={action.label} {...action} />
          ))}
        </div>
      </section>

      <section className="rounded-lg bg-white p-5 shadow dark:bg-gray-800">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Pendências
        </h3>
        {activityItems.length > 0 ? (
          <div className="mt-3 space-y-2">
            {activityItems.map((item) => (
              <button
                key={item.label}
                onClick={item.onClick}
                className="flex w-full items-center justify-between rounded-lg bg-gray-50 px-3 py-3 text-left transition-colors hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600"
              >
                <span className="text-sm font-medium text-gray-800 dark:text-gray-100">
                  {item.label}
                </span>
                <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
                  {item.value}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
            Nenhuma pendência no momento.
          </p>
        )}
      </section>

      {nextSteps.length > 0 && (
        <section className="rounded-lg bg-white p-5 shadow dark:bg-gray-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Próximos passos
          </h3>
          <div className="mt-3 space-y-2">
            {nextSteps.map((step) => (
              <button
                key={step.label}
                onClick={step.onClick ? () => step.onClick(navigate) : undefined}
                className="flex w-full items-center justify-between rounded-lg border border-gray-200 px-3 py-3 text-left transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{step.label}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{step.description}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400" />
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

const MetricCard = ({ label, value, icon: Icon }) => (
  <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
    <div className="flex items-center gap-3">
      <div className="rounded-lg bg-primary-100 p-2 dark:bg-primary-900">
        <Icon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value || 0}</p>
        <p className="text-xs text-gray-600 dark:text-gray-400">{label}</p>
      </div>
    </div>
  </div>
);

const getMetrics = (user, counts, totalUnread) => {
  if (user.type === 'provider') {
    return [
      { label: 'Serviços recebidos', value: counts.receivedServices, icon: Search },
      { label: 'Propostas', value: counts.jobProposals, icon: Briefcase }
    ];
  }

  if (user.type === 'company') {
    return [
      { label: 'Candidaturas', value: counts.jobApplications, icon: Users },
      { label: 'Mensagens', value: totalUnread, icon: MessageCircle }
    ];
  }

  if (user.type === 'admin' || user.role === 'admin') {
    return [
      { label: 'Serviços', value: counts.services, icon: Search },
      { label: 'Vagas', value: counts.jobs, icon: Briefcase }
    ];
  }

  return [
    { label: 'Mensagens', value: totalUnread, icon: MessageCircle },
    { label: 'Pendências', value: counts.services + counts.jobs, icon: FileText }
  ];
};

const ActionButton = ({ label, description, icon: Icon, count, variant, onClick }) => {
  const isPrimary = variant === 'primary';

  return (
    <button
      onClick={onClick}
      className={`flex min-h-[64px] w-full items-center gap-3 rounded-lg p-4 text-left transition-colors ${
        isPrimary
          ? 'bg-primary-600 text-white hover:bg-primary-700'
          : 'border border-gray-200 bg-white text-gray-900 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700'
      }`}
    >
      <Icon className="h-5 w-5 shrink-0" />
      <div className="min-w-0 flex-1">
        <span className="block font-medium">{label}</span>
        <span className={`text-xs ${isPrimary ? 'text-primary-100' : 'text-gray-500 dark:text-gray-400'}`}>
          {description}
        </span>
      </div>
      {count > 0 && (
        <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </button>
  );
};

const getNextSteps = (user) => {
  if (user.type === 'provider') {
    const missingProviderInfo = !user.category || !user.pricePerHour || !user.description;
    return missingProviderInfo
      ? [{
          label: 'Completar perfil de prestador',
          description: 'Categoria, preço e descrição ajudam você a aparecer melhor nas buscas.',
          onClick: (navigate) => navigate('/profile')
        }]
      : [];
  }

  if (user.type === 'company') {
    return [
      {
        label: 'Encontrar prestadores',
        description: 'Envie propostas vinculadas às suas vagas abertas.',
        onClick: (navigate) => navigate('/services')
      }
    ];
  }

  if (user.type === 'client') {
    return [
      {
        label: 'Buscar seu primeiro prestador',
        description: 'Escolha uma categoria e envie uma solicitação de serviço.',
        onClick: (navigate) => navigate('/services')
      }
    ];
  }

  return [];
};

export default Home;
