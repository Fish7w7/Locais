import { AlertCircle, FileText, Shield, Users, X } from 'lucide-react';

const TermsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-2xl transform overflow-hidden rounded-lg bg-white shadow-xl transition-all dark:bg-gray-800">
          <div className="flex items-center justify-between border-b border-gray-200 p-6 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary-100 p-2 dark:bg-primary-900">
                <FileText className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Termos de Uso
              </h3>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          <div className="max-h-[60vh] overflow-y-auto p-6">
            <div className="space-y-6 text-gray-700 dark:text-gray-300">
              <TermSection
                icon={AlertCircle}
                iconClassName="text-blue-600 dark:text-blue-400"
                title="1. Aceitação dos Termos"
              >
                <p>
                  Ao acessar ou usar a plataforma Serviços Locais, você concorda com estes Termos de Uso e com a Política de Privacidade. Se não concordar com qualquer parte destes termos, não deverá usar a plataforma.
                </p>
              </TermSection>

              <TermSection
                icon={Users}
                iconClassName="text-green-600 dark:text-green-400"
                title="2. Uso da Plataforma"
              >
                <p>Nossa plataforma conecta clientes, prestadores, empresas e visitantes:</p>
                <ul className="ml-4 mt-2 list-disc space-y-1">
                  <li><strong>Visitantes:</strong> podem explorar informações públicas, buscas, filtros, prestadores e vagas.</li>
                  <li><strong>Clientes:</strong> podem solicitar serviços, acompanhar respostas e conversar com prestadores.</li>
                  <li><strong>Prestadores:</strong> podem oferecer serviços, receber solicitações e se candidatar a vagas.</li>
                  <li><strong>Empresas:</strong> podem publicar vagas, acompanhar candidatos e enviar propostas.</li>
                </ul>
                <p className="mt-2">
                  Ações como solicitar serviço, candidatar-se, publicar vaga, enviar mensagem, editar perfil ou acessar áreas privadas exigem login.
                </p>
              </TermSection>

              <TermSection
                icon={Shield}
                iconClassName="text-purple-600 dark:text-purple-400"
                title="3. Responsabilidades do Usuário"
              >
                <p>Você se compromete a:</p>
                <ul className="ml-4 mt-2 list-disc space-y-1">
                  <li>fornecer informações verdadeiras, atualizadas e compatíveis com sua atividade;</li>
                  <li>manter sua senha em segurança e não compartilhar sua conta;</li>
                  <li>usar a plataforma de forma ética, legal e respeitosa;</li>
                  <li>não publicar conteúdo falso, ofensivo, discriminatório, ilegal, spam ou golpe;</li>
                  <li>não tentar burlar regras, limites, sistemas de segurança ou áreas administrativas.</li>
                </ul>
              </TermSection>

              <TermSection title="4. Serviços, Vagas, Propostas e Acordos">
                <p>
                  O Serviços Locais atua como intermediador para aproximar pessoas e empresas. A plataforma não executa os serviços, não contrata profissionais em nome próprio e não garante que uma proposta, candidatura ou conversa resulte em contratação.
                </p>
                <p className="mt-2">
                  Prazos, valores, forma de pagamento, escopo do serviço, deslocamento, materiais e demais condições devem ser combinados diretamente entre os envolvidos.
                </p>
              </TermSection>

              <TermSection title="5. Sistema de Comunicação (Chat)">
                <p>
                  O chat deve ser usado para assuntos relacionados à plataforma, como solicitações, candidaturas, propostas e alinhamento de serviços. É proibido usar o chat para assédio, ameaças, spam, fraudes ou conteúdo ilegal.
                </p>
                <p className="mt-2">
                  Em caso de denúncia, disputa, abuso ou necessidade de segurança, a plataforma poderá analisar informações relacionadas à conversa dentro dos limites legais e da Política de Privacidade.
                </p>
              </TermSection>

              <TermSection title="6. Perfis Públicos, Avaliações e Moderação">
                <p>
                  Algumas informações podem aparecer publicamente, como nome, tipo de conta, categoria, cidade, avaliação, preço por hora e descrição profissional. Dados sensíveis, como email e telefone, não devem ser exibidos para visitantes.
                </p>
                <p className="mt-2">
                  Avaliações devem ser reais, honestas e respeitosas. Conteúdos falsos, ofensivos ou abusivos podem ser removidos, revisados por administradores ou gerar restrições na conta.
                </p>
              </TermSection>

              <TermSection title="7. Pagamentos e Responsabilidade">
                <p>
                  Nesta versão do MVP, pagamentos e contratos formais não são processados pela plataforma. Qualquer pagamento, reembolso, garantia, nota fiscal, material, visita técnica ou acordo financeiro é responsabilidade direta das partes envolvidas.
                </p>
                <p className="mt-2">
                  A plataforma não se responsabiliza pela qualidade do serviço prestado, cumprimento de acordos externos, danos, atrasos, perdas financeiras ou disputas entre usuários.
                </p>
              </TermSection>

              <TermSection title="8. Segurança, Suspensão e Encerramento">
                <p>
                  Podemos restringir, suspender ou encerrar contas que violem estes termos, coloquem outros usuários em risco, tentem acessar áreas indevidas ou usem a plataforma de forma fraudulenta.
                </p>
                <p className="mt-2">
                  Usuários logados podem solicitar desativação ou exclusão da conta pela área de configurações.
                </p>
              </TermSection>

              <TermSection title="9. Alterações nos Termos">
                <p>
                  Estes termos podem ser atualizados conforme o produto evoluir. Quando houver mudanças relevantes, elas serão refletidas nesta tela e poderão ser comunicadas dentro da plataforma.
                </p>
              </TermSection>

              <TermSection title="10. Contato">
                <p>
                  Para dúvidas sobre estes termos, suporte ou solicitações relacionadas à conta, entre em contato pelo email{' '}
                  <a href="mailto:contato@servicoslocais.com" className="text-primary-600 hover:underline dark:text-primary-400">
                    contato@servicoslocais.com
                  </a>.
                </p>
              </TermSection>

              <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Última atualização: 26/05/2026
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 bg-white p-6 shadow-[0_-8px_20px_rgba(15,23,42,0.06)] dark:border-gray-700 dark:bg-gray-800 dark:shadow-[0_-8px_20px_rgba(0,0,0,0.18)]">
            <button
              onClick={onClose}
              className="w-full rounded-lg bg-primary-600 px-4 py-2.5 font-medium text-white transition-colors hover:bg-primary-700 active:bg-primary-800"
            >
              Entendi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const TermSection = ({ icon: Icon, iconClassName = 'text-gray-500 dark:text-gray-400', title, children }) => (
  <section>
    <div className="mb-3 flex items-start gap-3">
      {Icon && <Icon className={`mt-0.5 h-5 w-5 flex-shrink-0 ${iconClassName}`} />}
      <div>
        <h4 className="mb-2 font-semibold text-gray-900 dark:text-white">
          {title}
        </h4>
        <div className="space-y-2 text-sm">
          {children}
        </div>
      </div>
    </div>
  </section>
);

export default TermsModal;
