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
                title="1. Aceitacao dos Termos"
              >
                <p>
                  Ao acessar ou usar a plataforma Servicos Locais, voce concorda com estes Termos de Uso e com a Politica de Privacidade. Se nao concordar com qualquer parte destes termos, nao devera usar a plataforma.
                </p>
              </TermSection>

              <TermSection
                icon={Users}
                iconClassName="text-green-600 dark:text-green-400"
                title="2. Uso da Plataforma"
              >
                <p>Nossa plataforma conecta clientes, prestadores, empresas e visitantes:</p>
                <ul className="ml-4 mt-2 list-disc space-y-1">
                  <li><strong>Visitantes:</strong> podem explorar informacoes publicas, buscas, filtros, prestadores e vagas.</li>
                  <li><strong>Clientes:</strong> podem solicitar servicos, acompanhar respostas e conversar com prestadores.</li>
                  <li><strong>Prestadores:</strong> podem oferecer servicos, receber solicitacoes e se candidatar a vagas.</li>
                  <li><strong>Empresas:</strong> podem publicar vagas, acompanhar candidatos e enviar propostas.</li>
                </ul>
                <p className="mt-2">
                  Acoes como solicitar servico, candidatar-se, publicar vaga, enviar mensagem, editar perfil ou acessar areas privadas exigem login.
                </p>
              </TermSection>

              <TermSection
                icon={Shield}
                iconClassName="text-purple-600 dark:text-purple-400"
                title="3. Responsabilidades do Usuario"
              >
                <p>Voce se compromete a:</p>
                <ul className="ml-4 mt-2 list-disc space-y-1">
                  <li>fornecer informacoes verdadeiras, atualizadas e compativeis com sua atividade;</li>
                  <li>manter sua senha em seguranca e nao compartilhar sua conta;</li>
                  <li>usar a plataforma de forma etica, legal e respeitosa;</li>
                  <li>nao publicar conteudo falso, ofensivo, discriminatorio, ilegal, spam ou golpe;</li>
                  <li>nao tentar burlar regras, limites, sistemas de seguranca ou areas administrativas.</li>
                </ul>
              </TermSection>

              <TermSection title="4. Servicos, Vagas, Propostas e Acordos">
                <p>
                  O Servicos Locais atua como intermediador para aproximar pessoas e empresas. A plataforma ajuda no contato e na organizacao inicial, mas nao executa servicos, nao contrata profissionais em nome proprio e nao garante que uma proposta, candidatura ou conversa resulte em contratacao.
                </p>
                <p className="mt-2">
                  Prazos, valores, forma de pagamento, escopo do servico, deslocamento, materiais e demais condicoes devem ser combinados diretamente entre os envolvidos.
                </p>
              </TermSection>

              <TermSection title="5. Sistema de Comunicacao (Chat)">
                <p>
                  O chat deve ser usado para assuntos relacionados a plataforma, como solicitacoes, candidaturas, propostas e alinhamento de servicos. E proibido usar o chat para assedio, ameacas, spam, fraudes ou conteudo ilegal.
                </p>
                <p className="mt-2">
                  Em caso de denuncia, disputa, abuso ou necessidade de seguranca, a plataforma podera analisar informacoes relacionadas a conversa dentro dos limites legais e da Politica de Privacidade.
                </p>
              </TermSection>

              <TermSection title="6. Perfis Publicos, Avaliacoes e Moderacao">
                <p>
                  Algumas informacoes podem aparecer publicamente, como nome, tipo de conta, categoria, cidade, avaliacao, preco por hora e descricao profissional. Dados sensiveis, como email e telefone, nao devem ser exibidos para visitantes.
                </p>
                <p className="mt-2">
                  Avaliacoes devem ser reais, honestas e respeitosas. Conteudos falsos, ofensivos ou abusivos podem ser removidos, revisados por administradores ou gerar restricoes na conta. A plataforma pode usar filtro automatico e revisao manual para apoiar a moderacao.
                </p>
              </TermSection>

              <TermSection title="7. Pagamentos e Responsabilidade">
                <p>
                  Nesta etapa, pagamentos, contratos formais, reembolsos, garantias, notas fiscais e acordos financeiros nao sao processados pela plataforma. A execucao do servico, a combinacao final e o pagamento sao responsabilidade das partes envolvidas.
                </p>
                <p className="mt-2">
                  A plataforma nao substitui contratos, comprovantes, orcamentos formais ou verificacoes diretas entre as partes. Ainda assim, quando houver denuncias, indicios de abuso, fraude ou risco a usuarios, a plataforma podera analisar registros necessarios, aplicar restricoes ou sancoes e preservar informacoes essenciais para seguranca, moderacao e cumprimento legal.
                </p>
              </TermSection>

              <TermSection title="8. Seguranca, Suspensao e Encerramento">
                <p>
                  Podemos restringir, suspender ou encerrar contas que violem estes termos, coloquem outros usuarios em risco, tentem acessar areas indevidas ou usem a plataforma de forma fraudulenta.
                </p>
                <p className="mt-2">
                  Usuarios logados podem solicitar desativacao ou exclusao da conta pela area de configuracoes. Em caso de exclusao, dados pessoais podem ser anonimizados, enquanto registros minimos necessarios para seguranca, auditoria, denuncias e cumprimento legal podem ser preservados pelo periodo aplicavel.
                </p>
              </TermSection>

              <TermSection title="9. Alteracoes nos Termos">
                <p>
                  Estes termos podem ser atualizados conforme o produto evoluir. Quando houver mudancas relevantes, elas serao refletidas nesta tela e poderao ser comunicadas dentro da plataforma.
                </p>
              </TermSection>

              <TermSection title="10. Contato">
                <p>
                  Para duvidas sobre estes termos, suporte ou solicitacoes relacionadas a conta, entre em contato pelo email{' '}
                  <a href="mailto:contato@servicoslocais.com" className="text-primary-600 hover:underline dark:text-primary-400">
                    contato@servicoslocais.com
                  </a>.
                </p>
              </TermSection>

              <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Ultima atualizacao: 26/05/2026
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
