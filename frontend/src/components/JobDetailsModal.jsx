import { Briefcase, Calendar, DollarSign, MapPin, Users } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';
import { JobTypeBadge } from './Badge';

const JobDetailsModal = ({
  isOpen,
  onClose,
  job,
  companyName,
  companyAvatar,
  normalizeText,
  formatCurrency,
  canManage = false,
  hasApplied = false,
  onApply,
  onEdit,
  onViewCandidates
}) => {
  if (!job) return null;

  const title = normalizeText(job.title, 'Vaga sem título');
  const description = normalizeText(job.description, 'Descrição não informada.');
  const location = normalizeText(job.location, 'Local não informado');
  const category = normalizeText(job.category, 'Categoria não informada');

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detalhes da Vaga" size="lg">
      <div className="space-y-5">
        <div className="flex items-start gap-3">
          <img
            src={companyAvatar}
            alt={companyName}
            className="h-14 w-14 rounded-lg object-cover"
          />
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {title}
            </h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {companyName}
            </p>
            <div className="mt-2">
              <JobTypeBadge type={job.type} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <DetailItem icon={Briefcase} label="Categoria" value={category} />
          <DetailItem icon={MapPin} label="Local" value={location} />
          <DetailItem
            icon={DollarSign}
            label="Valor"
            value={job.salary ? formatCurrency(job.salary) : 'Não informado'}
          />
          <DetailItem
            icon={Users}
            label="Candidatos"
            value={`${job.applicationsCount || 0} ${Number(job.applicationsCount || 0) === 1 ? 'candidato' : 'candidatos'}`}
          />
          {job.createdAt && (
            <DetailItem
              icon={Calendar}
              label="Publicada em"
              value={new Date(job.createdAt).toLocaleDateString('pt-BR')}
            />
          )}
        </div>

        <section>
          <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
            Descrição
          </h3>
          <p className="whitespace-pre-line text-sm leading-6 text-gray-600 dark:text-gray-400">
            {description}
          </p>
        </section>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {canManage ? (
            <>
              <Button variant="primary" onClick={onEdit} fullWidth>
                Editar vaga
              </Button>
              <Button variant="secondary" onClick={onViewCandidates} fullWidth>
                Ver candidatos
              </Button>
            </>
          ) : hasApplied ? (
            <Button variant="secondary" disabled fullWidth>
              Candidatura enviada
            </Button>
          ) : (
            <Button variant="primary" onClick={onApply} fullWidth>
              Candidatar-se
            </Button>
          )}
          <Button variant="secondary" onClick={onClose} fullWidth>
            Fechar
          </Button>
        </div>
      </div>
    </Modal>
  );
};

const DetailItem = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
    <Icon className="h-5 w-5 flex-shrink-0 text-gray-500 dark:text-gray-400" />
    <div className="min-w-0">
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{value}</p>
    </div>
  </div>
);

export default JobDetailsModal;
