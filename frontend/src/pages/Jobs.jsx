import { useState, useEffect } from 'react';
import { Briefcase, MapPin, DollarSign, Clock, Users, Plus, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { jobAPI } from '../api/services';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';

const Jobs = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [myProposals, setMyProposals] = useState([]);
  const [myCompanyJobs, setMyCompanyJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('available');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');

  const jobTypes = {
    temporary: 'Temporária',
    trial: 'Experiência',
    permanent: 'Efetiva'
  };

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      if (activeTab === 'available') {
        const res = await jobAPI.getJobs({ type: selectedType });
        setJobs(res.data.jobs);
      } else if (activeTab === 'my-applications') {
        const res = await jobAPI.getMyApplications();
        setMyApplications(res.data.applications);
      } else if (activeTab === 'my-proposals' && (user.type === 'provider' || user.type === 'admin')) {
        const res = await jobAPI.getMyProposals();
        setMyProposals(res.data.proposals);
      } else if (activeTab === 'my-jobs' && user.type === 'company') {
        const res = await jobAPI.getJobs();
        const companyJobs = res.data.jobs.filter(job => job.companyId._id === user.id);
        setMyCompanyJobs(companyJobs);
      }
    } catch (error) {
      console.error('Erro ao carregar vagas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (jobId) => {
    try {
      await jobAPI.applyToJob(jobId, {
        message: 'Gostaria de me candidatar para esta vaga.'
      });
      alert('Candidatura enviada com sucesso!');
      loadData();
    } catch (error) {
      alert(error.response?.data?.message || 'Erro ao candidatar-se');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      reviewing: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      accepted: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    };
    return colors[status] || colors.pending;
  };

  const getStatusText = (status) => {
    const texts = {
      pending: 'Pendente',
      reviewing: 'Em Análise',
      accepted: 'Aceita',
      rejected: 'Rejeitada',
      cancelled: 'Cancelada'
    };
    return texts[status] || status;
  };

  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Vagas
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {user.type === 'company' && 'Gerencie suas vagas e candidatos'}
            {user.type === 'provider' && 'Veja propostas de empresas'}
            {user.type === 'client' && 'Encontre oportunidades de trabalho'}
          </p>
        </div>
        
        {(user.type === 'company' || user.type === 'admin') && (
          <Button icon={Plus} size="sm">
            Nova Vaga
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab('available')}
          className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
            activeTab === 'available'
              ? 'bg-primary-600 text-white'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
          }`}
        >
          Vagas Disponíveis
        </button>
        
        {user.type === 'client' && (
          <button
            onClick={() => setActiveTab('my-applications')}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
              activeTab === 'my-applications'
                ? 'bg-primary-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            Minhas Candidaturas
          </button>
        )}
        
        {(user.type === 'provider' || user.type === 'admin') && (
          <button
            onClick={() => setActiveTab('my-proposals')}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
              activeTab === 'my-proposals'
                ? 'bg-primary-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            Propostas Recebidas
          </button>
        )}
        
        {(user.type === 'company' || user.type === 'admin') && (
          <button
            onClick={() => setActiveTab('my-jobs')}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
              activeTab === 'my-jobs'
                ? 'bg-primary-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            Minhas Vagas
          </button>
        )}
      </div>

      {/* Vagas Disponíveis */}
      {activeTab === 'available' && (
        <>
          {/* Search and Filters */}
          <div className="space-y-3">
            <Input
              placeholder="Buscar vagas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={Briefcase}
            />

            <div className="flex gap-2 overflow-x-auto pb-2">
              <button
                onClick={() => setSelectedType('')}
                className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${
                  selectedType === ''
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                Todas
              </button>
              {Object.entries(jobTypes).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setSelectedType(key)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${
                    selectedType === key
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Jobs List */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            </div>
          ) : filteredJobs.length === 0 ? (
            <Card>
              <p className="text-center py-8 text-gray-600 dark:text-gray-400">
                Nenhuma vaga disponível no momento
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredJobs.map((job) => (
                <Card key={job._id} hoverable>
                  <div className="flex items-start gap-3 mb-3">
                    <img
                      src={job.companyId.avatar || `https://ui-avatars.com/api/?name=${job.companyId.name}&background=random`}
                      alt={job.companyId.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {job.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {job.companyId.name}
                      </p>
                    </div>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200">
                      {jobTypes[job.type]}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                    {job.description}
                  </p>

                  <div className="flex flex-wrap gap-3 text-sm text-gray-600 dark:text-gray-400 mb-3">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {job.location}
                    </div>
                    {job.salary && (
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        R$ {job.salary.toLocaleString('pt-BR')}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {job.applicationsCount} candidatos
                    </div>
                  </div>

                  {user.type === 'client' && (
                    <Button 
                      variant="primary" 
                      fullWidth 
                      size="sm"
                      onClick={() => handleApply(job._id)}
                    >
                      Candidatar-se
                    </Button>
                  )}
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* Minhas Candidaturas */}
      {activeTab === 'my-applications' && (
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            </div>
          ) : myApplications.length === 0 ? (
            <Card>
              <p className="text-center py-8 text-gray-600 dark:text-gray-400">
                Você ainda não se candidatou a nenhuma vaga
              </p>
            </Card>
          ) : (
            myApplications.map((application) => (
              <Card key={application._id}>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {application.jobId.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {application.jobId.companyId.name}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                    {getStatusText(application.status)}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 mb-3">
                  <Calendar className="w-4 h-4" />
                  Candidatura em {new Date(application.createdAt).toLocaleDateString()}
                </div>

                {application.companyResponse && (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mt-3">
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Resposta da empresa:
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {application.companyResponse}
                    </p>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      )}

      {/* Propostas Recebidas (Prestador) */}
      {activeTab === 'my-proposals' && (user.type === 'provider' || user.type === 'admin') && (
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            </div>
          ) : myProposals.length === 0 ? (
            <Card>
              <p className="text-center py-8 text-gray-600 dark:text-gray-400">
                Você ainda não recebeu nenhuma proposta
              </p>
            </Card>
          ) : (
            myProposals.map((proposal) => (
              <Card key={proposal._id}>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {proposal.jobId.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {proposal.companyId.name}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(proposal.status)}`}>
                    {getStatusText(proposal.status)}
                  </span>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 mb-3">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {proposal.message}
                  </p>
                </div>

                {proposal.offeredSalary && (
                  <div className="flex items-center gap-2 mb-3">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span className="font-semibold text-green-600 dark:text-green-400">
                      R$ {proposal.offeredSalary.toLocaleString('pt-BR')}
                    </span>
                  </div>
                )}

                {proposal.status === 'pending' && (
                  <div className="flex gap-2 mt-3">
                    <Button variant="primary" fullWidth size="sm">
                      Aceitar
                    </Button>
                    <Button variant="danger" fullWidth size="sm">
                      Recusar
                    </Button>
                  </div>
                )}

                {proposal.providerResponse && (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mt-3">
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Sua resposta:
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {proposal.providerResponse}
                    </p>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      )}

      {/* Minhas Vagas (Empresa) */}
      {activeTab === 'my-jobs' && (user.type === 'company' || user.type === 'admin') && (
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            </div>
          ) : myCompanyJobs.length === 0 ? (
            <Card>
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Você ainda não criou nenhuma vaga
                </p>
                <Button icon={Plus}>
                  Criar Primeira Vaga
                </Button>
              </div>
            </Card>
          ) : (
            myCompanyJobs.map((job) => (
              <Card key={job._id}>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {job.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {job.category} • {jobTypes[job.type]}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    job.isActive 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                  }`}>
                    {job.isActive ? 'Ativa' : 'Inativa'}
                  </span>
                </div>

                <div className="flex flex-wrap gap-3 text-sm text-gray-600 dark:text-gray-400 mb-3">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {job.applicationsCount} candidaturas
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Criada em {new Date(job.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="secondary" fullWidth size="sm">
                    Ver Candidatos
                  </Button>
                  <Button variant="ghost" size="sm">
                    Editar
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
  
};

export default Jobs;