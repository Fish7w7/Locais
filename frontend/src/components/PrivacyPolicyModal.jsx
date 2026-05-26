import { Shield } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';

const PrivacyPolicyModal = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Política de Privacidade" size="lg">
      <div className="space-y-5 text-sm text-gray-700 dark:text-gray-300">
        <div className="flex gap-3 rounded-lg bg-primary-50 p-3 dark:bg-primary-900/20">
          <Shield className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary-600 dark:text-primary-400" />
          <p>
            Esta política explica quais dados o Serviços Locais usa para conectar clientes, prestadores e empresas.
          </p>
        </div>

        <section>
          <h4 className="font-semibold text-gray-900 dark:text-white">Dados coletados</h4>
          <p className="mt-1">
            Podemos coletar nome, email, telefone, localização aproximada, tipo de conta, informações profissionais, mensagens, solicitações, vagas, candidaturas e avaliações.
          </p>
        </section>

        <section>
          <h4 className="font-semibold text-gray-900 dark:text-white">Uso dos dados</h4>
          <p className="mt-1">
            Usamos esses dados para criar sua conta, mostrar perfis públicos, permitir solicitações, candidaturas, propostas, chat, segurança da plataforma e suporte.
          </p>
        </section>

        <section>
          <h4 className="font-semibold text-gray-900 dark:text-white">Visitantes</h4>
          <p className="mt-1">
            Visitantes podem ver informações públicas limitadas, como nome, categoria, cidade, avaliação, preço e descrição básica. Dados sensíveis como email e telefone ficam restritos.
          </p>
        </section>

        <section>
          <h4 className="font-semibold text-gray-900 dark:text-white">Controle da conta</h4>
          <p className="mt-1">
            Usuários logados podem atualizar dados de perfil e solicitar desativação ou exclusão da conta pelas configurações.
          </p>
        </section>

        <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Última atualização: 26/05/2026
          </p>
        </div>

        <Button onClick={onClose} fullWidth>
          Entendi
        </Button>
      </div>
    </Modal>
  );
};

export default PrivacyPolicyModal;
