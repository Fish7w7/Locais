import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Briefcase,
  FileText,
  Lock,
  MessageCircle,
  Search,
  Shield,
  UserCheck,
  Users
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useActivityNotifications } from '../contexts/ActivityNotificationContext';
import { useChatNotifications } from '../contexts/ChatNotificationContext';
import { useAuthPrompt } from '../contexts/AuthPromptContext';

const Home = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { requireAuth } = useAuthPrompt();
  const {
    counts,
    isLoading: isActivityLoading,
    hasLoaded: hasActivityLoaded
  } = useActivityNotifications();
  const {
    totalUnread,
    isLoading: isChatLoading,
    hasLoaded: hasChatLoaded
  } = useChatNotifications();

  const isVisitor = !isAuthenticated || !user;
  const countersAreLoading = !isVisitor && (isActivityLoading || isChatLoading || !hasActivityLoaded || !hasChatLoaded);
  const isProvider = user?.type === 'provider';
  const isCompany = user?.type === 'company';
  const isAdmin = user?.type === 'admin' || user?.role === 'admin';

  const roleLabels = {
    client: 'Cliente',
    provider: 'Prestador',
    company: 'Empresa',
    admin: 'Administrador',
    visitor: 'Visitante'
  };

  const primaryActions = [
    {
      show: isVisitor,
      label: 'Buscar prestadores',
      description: 'Veja profissionais por categoria antes de criar conta',
      icon: Search,
      variant: 'primary',
      access: 'open',
      onClick: () => navigate('/services')
    },
    {
      show: isVisitor,
      label: 'Ver vagas',
      description: 'Explore oportunidades publicadas por empresas',
      icon: Briefcase,
      access: 'open',
      onClick: () => navigate('/jobs')
    },
    {
      show: isVisitor,
      label: 'Solicitar serviço',
      description: 'Entre como Cliente para contratar prestadores',
      icon: FileText,
      access: 'locked',
      onClick: () => requireAuth({ suggestedType: 'client', returnTo: '/services' })
    },
    {
      show: isVisitor,
      label: 'Publicar vaga',
      description: 'Entre como Empresa para receber candidatos',
      icon: Users,
      access: 'locked',
      onClick: () => requireAuth({
        suggestedType: 'company',
        returnTo: '/jobs',
        returnState: { openCreateModal: true }
      })
    },
    {
      show: user?.type === 'client',
      label: 'Buscar prestadores',
      description: 'Encontre profissionais por categoria',
      icon: Search,
      variant: 'primary',
      onClick: () => navigate('/services')
    },
    {
      show: user?.type === 'client',
      label: 'Minhas solicitações',
      description: 'Acompanhe serviços enviados',
      icon: FileText,
      count: counts.myServiceRequests,
      countLoading: countersAreLoading,
      onClick: () => navigate('/services', { state: { tab: 'my-requests' } })
    },
    {
      show: isProvider,
      label: 'Buscar serviços',
      description: 'Veja solicitações enviadas para você',
      icon: Briefcase,
      variant: 'primary',
      count: counts.receivedServices,
      countLoading: countersAreLoading,
      onClick: () => navigate('/services', { state: { tab: 'received' } })
    },
    {
      show: isProvider,
      label: 'Propostas recebidas',
      description: 'Responda oportunidades de empresas',
      icon: FileText,
      count: counts.jobProposals,
      countLoading: countersAreLoading,
      onClick: () => navigate('/jobs', { state: { tab: 'my-proposals' } })
    },
    {
      show: isProvider,
      label: 'Minhas candidaturas',
      description: 'Acompanhe vagas em que você se candidatou',
      icon: Users,
      onClick: () => navigate('/jobs', { state: { tab: 'my-applications' } })
    },
    {
      show: isCompany,
      label: 'Publicar vaga/serviço',
      description: 'Crie uma publicação para encontrar profissionais',
      icon: Briefcase,
      variant: 'primary',
      onClick: () => navigate('/jobs', { state: { openCreateModal: true } })
    },
    {
      show: isCompany,
      label: 'Minhas publicações',
      description: 'Gerencie vagas e serviços publicados',
      icon: FileText,
      onClick: () => navigate('/jobs', { state: { tab: 'my-jobs' } })
    },
    {
      show: isCompany,
      label: 'Candidatos',
      description: 'Gerencie candidaturas recebidas',
      icon: Users,
      count: counts.jobApplications,
      countLoading: countersAreLoading,
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
      description: totalUnread > 0
        ? formatCountLabel(totalUnread, 'conversa com mensagem nova', 'conversas com mensagens novas')
        : isVisitor ? 'Entre para conversar com outros usuários' : 'Abra suas conversas',
      icon: MessageCircle,
      access: isVisitor ? 'locked' : undefined,
      count: isVisitor ? 0 : totalUnread,
      countLoading: !isVisitor && (isChatLoading || !hasChatLoaded),
      onClick: () => {
        if (isVisitor) {
          requireAuth({ suggestedType: 'client', returnTo: '/chat' });
          return;
        }
        navigate('/chat');
      }
    },
    {
      label: isVisitor ? 'Entrar ou cadastrar' : isCompany ? 'Perfil da empresa' : 'Perfil',
      description: isVisitor
        ? 'Crie uma conta para acompanhar solicitações e mensagens'
        : isCompany ? 'Revise dados e apresentação da empresa' : 'Revise seus dados e preferências',
      icon: UserCheck,
      onClick: () => navigate('/profile')
    }
  ];

  const hero = getHeroConfig(user, counts, countersAreLoading);
  const nextSteps = getNextSteps(user, counts, requireAuth);
  const metrics = getMetrics(user, counts, totalUnread);
  const attentionItems = getAttentionItems(user, counts, totalUnread, navigate);

  return (
    <div className="space-y-5">
      <section className="rounded-lg bg-white p-5 shadow dark:bg-gray-800">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 space-y-2">
            <p className="text-sm font-medium text-primary-600 dark:text-primary-400">
              {roleLabels[user?.type || 'visitor']} · {hero.status}
            </p>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {isVisitor ? 'Conheça o Serviços Locais' : `Olá, ${user.name}`}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {hero.description}
            </p>
          </div>
          <button
            onClick={() => hero.onClick(navigate, requireAuth)}
            className="shrink-0 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            {hero.actionLabel}
          </button>
        </div>
      </section>

      {metrics.length > 0 && (
        <section className="grid grid-cols-2 gap-3">
          {metrics.map((metric) => (
            <MetricCard key={metric.label} {...metric} isLoading={countersAreLoading} />
          ))}
        </section>
      )}

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
          {isVisitor ? 'Como funciona' : 'Pendências'}
        </h3>
        {isVisitor ? (
          <div className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <p>1. Encontre prestadores ou vagas usando filtros e busca.</p>
            <p>2. Crie uma conta quando quiser solicitar, candidatar-se ou conversar.</p>
            <p>3. Acompanhe tudo pelo painel depois do login.</p>
          </div>
        ) : countersAreLoading ? (
          <div className="mt-3 space-y-2">
            <SkeletonAttentionRow />
            <SkeletonAttentionRow />
          </div>
        ) : attentionItems.length > 0 ? (
          <div className="mt-3 space-y-2">
            {attentionItems.map((item) => (
              <button
                key={item.label}
                onClick={item.onClick}
                className="flex w-full items-center justify-between gap-3 rounded-lg bg-gray-50 px-3 py-3 text-left transition-colors hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600"
              >
                <span>
                  <span className="block text-sm font-medium text-gray-800 dark:text-gray-100">
                    {item.label}
                  </span>
                  <span className="block text-xs text-gray-500 dark:text-gray-400">
                    {item.description}
                  </span>
                </span>
                <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
                  {item.value}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
            {getNoAttentionText(user)}
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
                onClick={step.onClick ? () => step.onClick(navigate, requireAuth) : undefined}
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

const MetricCard = ({ label, value, icon: Icon, isLoading }) => (
  <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
    <div className="flex items-center gap-3">
      <div className="rounded-lg bg-primary-100 p-2 dark:bg-primary-900">
        <Icon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
      </div>
      <div>
        {isLoading ? (
          <span className="block h-8 w-10 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        ) : (
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value || 0}</p>
        )}
        <p className="text-xs text-gray-600 dark:text-gray-400">{label}</p>
      </div>
    </div>
  </div>
);

const getMetrics = (user, counts, totalUnread) => {
  if (!user) return [];

  if (user.type === 'provider') {
    return [
      { label: 'Serviços', value: counts.receivedServices, icon: Search },
      { label: 'Propostas', value: counts.jobProposals, icon: Briefcase }
    ];
  }

  if (user.type === 'company') {
    return [
      { label: 'Candidatos', value: counts.jobApplications, icon: Users },
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
    { label: 'Respostas', value: counts.myServiceRequests, icon: FileText },
    { label: 'Mensagens', value: totalUnread, icon: MessageCircle }
  ];
};

const ActionButton = ({ label, description, icon: Icon, count, countLoading, variant, access, onClick }) => {
  const isPrimary = variant === 'primary';
  const showAccessBadge = access === 'open' || access === 'locked';

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
        <span className="flex flex-wrap items-center gap-2 font-medium">
          {label}
          {showAccessBadge && (
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
              access === 'locked'
                ? isPrimary
                  ? 'bg-white/15 text-white'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                : isPrimary
                  ? 'bg-white/15 text-white'
                  : 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
            }`}>
              {access === 'locked' && <Lock className="h-3 w-3" />}
              {access === 'locked' ? 'Login necessário' : 'Aberto'}
            </span>
          )}
        </span>
        <span className={`text-xs ${isPrimary ? 'text-primary-100' : 'text-gray-500 dark:text-gray-400'}`}>
          {description}
        </span>
      </div>
      {countLoading ? (
        <span className="h-5 w-7 shrink-0 animate-pulse rounded-full bg-gray-300 dark:bg-gray-600" />
      ) : count > 0 && (
        <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </button>
  );
};

const SkeletonAttentionRow = () => (
  <div className="rounded-lg bg-gray-50 px-3 py-3 dark:bg-gray-700">
    <span className="block h-4 w-36 animate-pulse rounded bg-gray-200 dark:bg-gray-600" />
    <span className="mt-2 block h-3 w-52 animate-pulse rounded bg-gray-200 dark:bg-gray-600" />
  </div>
);

const formatCountLabel = (count, singular, plural) => `${count} ${count === 1 ? singular : plural}`;

const getNoAttentionText = (user) => {
  if (user?.type === 'provider') return 'Nenhum serviço ou proposta aguardando resposta.';
  if (user?.type === 'company') return 'Nenhum candidato aguardando análise.';
  if (user?.type === 'admin' || user?.role === 'admin') return 'Nenhuma pendência administrativa no momento.';
  return 'Nenhuma resposta nova nas suas solicitações.';
};

const getHeroConfig = (user, counts, isLoading) => {
  if (!user) {
    return {
      status: 'Explore antes de criar conta',
      description: 'Veja prestadores, vagas e categorias. Você só precisa entrar quando quiser solicitar, candidatar-se ou conversar.',
      actionLabel: 'Explorar',
      onClick: (navigate) => navigate('/services')
    };
  }

  if (isLoading) {
    return {
      status: 'Atualizando',
      description: 'Conferindo suas movimentações mais recentes.',
      actionLabel: 'Perfil',
      onClick: (navigate) => navigate('/profile')
    };
  }

  if (user.type === 'provider') {
    const pending = counts.receivedServices + counts.jobProposals;
    const missingProviderInfo = !user.category || !user.pricePerHour || !user.description;

    if (missingProviderInfo) {
      return {
        status: 'Perfil incompleto',
        description: 'Complete categoria, preço e descrição para aparecer melhor nas buscas.',
        actionLabel: 'Completar',
        onClick: (navigate) => navigate('/profile')
      };
    }

    return {
      status: pending > 0 ? formatCountLabel(pending, 'item para responder', 'itens para responder') : 'Tudo em dia',
      description: pending > 0
        ? 'Responda clientes e empresas para manter suas oportunidades andando.'
        : 'Seu painel está limpo. Novas solicitações aparecerão aqui.',
      actionLabel: pending > 0 ? 'Responder' : 'Perfil',
      onClick: (navigate) => {
        if (counts.receivedServices > 0) return navigate('/services', { state: { tab: 'received' } });
        if (counts.jobProposals > 0) return navigate('/jobs', { state: { tab: 'my-proposals' } });
        return navigate('/profile');
      }
    };
  }

  if (user.type === 'company') {
    return {
      status: counts.jobApplications > 0
        ? formatCountLabel(counts.jobApplications, 'candidato aguardando', 'candidatos aguardando')
        : 'Pronto para contratar',
      description: counts.jobApplications > 0
        ? 'Analise candidatos recebidos e acompanhe suas publicações.'
        : 'Publique uma vaga ou envie proposta para um prestador disponível.',
      actionLabel: counts.jobApplications > 0 ? 'Ver candidatos' : 'Publicar',
      onClick: (navigate) => navigate('/jobs', {
        state: counts.jobApplications > 0 ? { tab: 'my-jobs' } : { openCreateModal: true }
      })
    };
  }

  if (user.type === 'admin' || user.role === 'admin') {
    return {
      status: 'Visão geral',
      description: 'Acompanhe cadastros, serviços, vagas e moderação pelo painel administrativo.',
      actionLabel: 'Admin',
      onClick: (navigate) => navigate('/admin')
    };
  }

  const activeItems = counts.myServiceRequests;
  return {
    status: activeItems > 0
      ? formatCountLabel(activeItems, 'resposta nova', 'respostas novas')
      : 'Comece por uma busca',
    description: activeItems > 0
      ? 'Veja solicitações que foram aceitas ou recusadas pelos prestadores.'
      : 'Busque prestadores por categoria para resolver o que você precisa.',
    actionLabel: activeItems > 0 ? 'Ver andamento' : 'Buscar',
    onClick: (navigate) => {
      if (counts.myServiceRequests > 0) return navigate('/services', { state: { tab: 'my-requests' } });
      return navigate('/services');
    }
  };
};

const getAttentionItems = (user, counts, totalUnread, navigate) => {
  const items = [];
  if (!user) return items;

  if (user.type === 'client' && counts.myServiceRequests > 0) {
    items.push({
      label: 'Ver andamento',
      description: formatCountLabel(counts.myServiceRequests, 'solicitação foi respondida.', 'solicitações foram respondidas.'),
      value: counts.myServiceRequests,
      onClick: () => navigate('/services', { state: { tab: 'my-requests' } })
    });
  }

  if (user.type === 'provider') {
    if (counts.receivedServices > 0) {
      items.push({
        label: 'Responder clientes',
        description: 'Solicitações aguardam aceite ou recusa.',
        value: counts.receivedServices,
        onClick: () => navigate('/services', { state: { tab: 'received' } })
      });
    }

    if (counts.jobProposals > 0) {
      items.push({
        label: 'Responder empresas',
        description: 'Propostas de vaga ainda estão pendentes.',
        value: counts.jobProposals,
        onClick: () => navigate('/jobs', { state: { tab: 'my-proposals' } })
      });
    }
  }

  if (user.type === 'company' && counts.jobApplications > 0) {
    items.push({
      label: 'Ver candidatos',
      description: 'Profissionais aguardam resposta nas suas vagas.',
      value: counts.jobApplications,
      onClick: () => navigate('/jobs', { state: { tab: 'my-jobs' } })
    });
  }

  if (totalUnread > 0) {
    items.push({
      label: 'Responder mensagens',
      description: 'Conversas com mensagens não lidas.',
      value: totalUnread,
      onClick: () => navigate('/chat')
    });
  }

  return items;
};

const getNextSteps = (user, counts, requireAuth) => {
  if (!user) {
    return [
      {
        label: 'Criar conta de Cliente',
        description: 'Ideal para solicitar serviços e acompanhar retornos.',
        onClick: () => requireAuth({ suggestedType: 'client', returnTo: '/services' })
      },
      {
        label: 'Criar conta de Prestador',
        description: 'Ideal para se candidatar a vagas e receber propostas.',
        onClick: () => requireAuth({ suggestedType: 'provider', returnTo: '/jobs' })
      },
      {
        label: 'Criar conta de Empresa',
        description: 'Ideal para publicar vagas e receber candidatos.',
        onClick: () => requireAuth({
          suggestedType: 'company',
          returnTo: '/jobs',
          returnState: { openCreateModal: true }
        })
      }
    ];
  }

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
    return [{
      label: 'Encontrar prestadores',
      description: 'Envie propostas vinculadas às suas vagas abertas.',
      onClick: (navigate) => navigate('/services')
    }];
  }

  if (user.type === 'client' && counts.myServiceRequests === 0) {
    return [{
      label: 'Buscar seu primeiro prestador',
      description: 'Escolha uma categoria e envie uma solicitação de serviço.',
      onClick: (navigate) => navigate('/services')
    }];
  }

  return [];
};

export default Home;
