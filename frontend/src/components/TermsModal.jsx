import { X, FileText, Shield, Users, AlertCircle } from 'lucide-react';

const TermsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl transform transition-all">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-lg">
                <FileText className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Termos de Uso
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            <div className="space-y-6 text-gray-700 dark:text-gray-300">
              
              {/* Introdução */}
              <section>
                <div className="flex items-start gap-3 mb-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                      1. Aceitação dos Termos
                    </h4>
                    <p className="text-sm">
                      Ao acessar e usar a plataforma Serviços Locais, você concorda em cumprir e estar vinculado aos seguintes termos e condições de uso. Se você não concordar com qualquer parte destes termos, não deverá usar nossa plataforma.
                    </p>
                  </div>
                </div>
              </section>

              {/* Uso da Plataforma */}
              <section>
                <div className="flex items-start gap-3 mb-3">
                  <Users className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                      2. Uso da Plataforma
                    </h4>
                    <p className="text-sm mb-2">
                      Nossa plataforma conecta três tipos de usuários:
                    </p>
                    <ul className="text-sm space-y-1 ml-4 list-disc">
                      <li><strong>Clientes:</strong> Pessoas que buscam contratar serviços ou se candidatar a vagas</li>
                      <li><strong>Prestadores:</strong> Profissionais que oferecem serviços especializados</li>
                      <li><strong>Empresas:</strong> Organizações que publicam vagas e contratam serviços</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Responsabilidades */}
              <section>
                <div className="flex items-start gap-3 mb-3">
                  <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                      3. Responsabilidades do Usuário
                    </h4>
                    <p className="text-sm mb-2">Você se compromete a:</p>
                    <ul className="text-sm space-y-1 ml-4 list-disc">
                      <li>Fornecer informações verdadeiras e atualizadas</li>
                      <li>Manter a confidencialidade de sua senha</li>
                      <li>Usar a plataforma de forma ética e legal</li>
                      <li>Respeitar os direitos de outros usuários</li>
                      <li>Não publicar conteúdo ofensivo ou ilegal</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Serviços e Vagas */}
              <section>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  4. Serviços e Vagas
                </h4>
                <p className="text-sm mb-2">
                  A plataforma atua apenas como intermediária, facilitando o contato entre usuários. Não somos responsáveis por:
                </p>
                <ul className="text-sm space-y-1 ml-4 list-disc">
                  <li>Qualidade dos serviços prestados</li>
                  <li>Cumprimento de acordos entre usuários</li>
                  <li>Pagamentos e transações financeiras</li>
                  <li>Disputas entre clientes e prestadores</li>
                </ul>
              </section>

              {/* Sistema de Comunicação (Chat) */}
              <section>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  5. Sistema de Comunicação (Chat)
                </h4>
                <p className="text-sm mb-2">
                  A plataforma oferece um sistema de chat para facilitar a comunicação direta entre Clientes, Prestadores e Empresas sobre serviços, candidaturas e propostas.
                </p>
                <p className="text-sm mb-2">
                  Você concorda que:
                </p>
                <ul className="text-sm space-y-1 ml-4 list-disc">
                  <li>O chat deve ser usado exclusivamente para fins relacionados à plataforma.</li>
                  <li>É proibido o envio de conteúdo ofensivo, ilegal, spam ou qualquer forma de assédio.</li>
                  <li>A plataforma não monitora ativamente as conversas, mas se reserva o direito de acessar e revisar o conteúdo em caso de denúncias ou disputas.</li>
                  <li>A troca de informações pessoais de contato (como telefone ou e-mail) para contornar a plataforma é de sua inteira responsabilidade.</li>
                </ul>
              </section>

              {/* Privacidade */}
              <section>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  6. Privacidade e Dados
                </h4>
                <p className="text-sm">
                  Coletamos e processamos seus dados pessoais de acordo com nossa Política de Privacidade. Ao usar a plataforma, você consente com a coleta, uso e compartilhamento de suas informações conforme descrito em nossa política.
                </p>
              </section>

              {/* Avaliações */}
              <section>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  7. Sistema de Avaliações
                </h4>
                <p className="text-sm">
                  As avaliações devem ser honestas e baseadas em experiências reais. Avaliações falsas, ofensivas ou que violem nossos termos podem ser removidas, e o usuário responsável pode ter sua conta suspensa.
                </p>
              </section>

              {/* Limitação de Responsabilidade */}
              <section>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  8. Limitação de Responsabilidade
                </h4>
                <p className="text-sm">
                  A plataforma é fornecida "como está". Não garantimos que o serviço será ininterrupto ou livre de erros. Não nos responsabilizamos por danos diretos ou indiretos resultantes do uso da plataforma.
                </p>
              </section>

              {/* Suspensão de Conta */}
              <section>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  9. Suspensão e Encerramento
                </h4>
                <p className="text-sm">
                  Reservamos o direito de suspender ou encerrar contas que violem estes termos, sem aviso prévio. Você pode encerrar sua conta a qualquer momento através das configurações de perfil.
                </p>
              </section>

              {/* Modificações */}
              <section>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  10. Modificações dos Termos
                </h4>
                <p className="text-sm">
                  Podemos atualizar estes termos periodicamente. Alterações significativas serão notificadas através da plataforma. O uso continuado após as alterações constitui aceitação dos novos termos.
                </p>
              </section>

              {/* Contato */}
              <section>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  11. Contato
                </h4>
                <p className="text-sm">
                  Para dúvidas sobre estes termos, entre em contato através do email:{' '}
                  <a href="mailto:contato@servicoslocais.com" className="text-primary-600 dark:text-primary-400 hover:underline">
                    contato@servicoslocais.com
                  </a>
                </p>
              </section>

              {/* Data */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                Última atualização: {'03/12/2025'}
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
            >
              Entendi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsModal;