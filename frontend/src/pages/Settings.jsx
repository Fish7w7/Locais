import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, HelpCircle, Info, Lock, LogOut, Mail, Moon, Shield, Sun, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useConfirm } from '../hooks/useConfirm';
import Card from '../components/Card';
import Button from '../components/Button';
import ConfirmModal from '../components/ConfirmModal';
import AccountSettingsModal from '../components/AccountSettingsModal';
import TermsModal from '../components/TermsModal';
import PrivacyPolicyModal from '../components/PrivacyPolicyModal';

const Settings = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const { confirmState, confirm, cancel } = useConfirm();
  const [showAccountSettings, setShowAccountSettings] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  const handleLogout = async () => {
    await confirm({
      title: 'Sair da Conta',
      message: 'Tem certeza que deseja sair?',
      variant: 'warning',
      onConfirm: () => {
        logout();
        navigate('/');
      }
    });
  };

  if (!user) {
    return (
      <div className="space-y-4">
        <Card>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Configurações
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Algumas preferências ficam disponíveis sem conta. Para gerenciar perfil, notificações e segurança, entre ou crie uma conta.
          </p>
          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Button
              onClick={() => navigate('/login', {
                state: { authMode: 'login', suggestedType: 'client', returnTo: '/settings' }
              })}
              fullWidth
            >
              Entrar
            </Button>
            <Button
              variant="secondary"
              onClick={() => navigate('/login', {
                state: { authMode: 'register', suggestedType: 'client', returnTo: '/settings' }
              })}
              fullWidth
            >
              Cadastrar
            </Button>
          </div>
        </Card>

        <SettingsRow
          icon={darkMode ? Sun : Moon}
          title="Tema"
          description={darkMode ? 'Modo escuro ativado' : 'Modo claro ativado'}
          actionLabel="Alternar"
          onClick={toggleTheme}
        />

        <LegalSection onTerms={() => setShowTerms(true)} onPrivacy={() => setShowPrivacy(true)} />
        <SupportSection />

        <TermsModal isOpen={showTerms} onClose={() => setShowTerms(false)} />
        <PrivacyPolicyModal isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Configurações
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Preferências, segurança, privacidade e informações da conta.
        </p>
      </div>

      <Card>
        <div className="flex items-center gap-3">
          <img
            src={user.avatar || `https://ui-avatars.com/api/name=${encodeURIComponent(user.name)}&background=random`}
            alt={user.name}
            className="h-12 w-12 rounded-full object-cover"
          />
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 dark:text-white">{user.name}</p>
            <p className="truncate text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
          </div>
        </div>
      </Card>

      <SettingsSection title="Preferências">
        <SettingsRow
          icon={darkMode ? Sun : Moon}
          title="Tema"
          description={darkMode ? 'Modo escuro ativado' : 'Modo claro ativado'}
          actionLabel="Alternar"
          onClick={toggleTheme}
        />
        <SettingsRow
          icon={Bell}
          title="Notificações"
          description="Badges de chat, serviços e vagas ativos no app"
          actionLabel="Ativas"
        />
      </SettingsSection>

      <SettingsSection title="Conta e segurança">
        <SettingsRow
          icon={User}
          title="Editar perfil"
          description="Nome, telefone, localização e dados profissionais"
          actionLabel="Abrir"
          onClick={() => navigate('/profile')}
        />
        <SettingsRow
          icon={Lock}
          title="Gerenciar conta"
          description="Desativar ou excluir a conta"
          actionLabel="Abrir"
          onClick={() => setShowAccountSettings(true)}
        />
      </SettingsSection>

      <LegalSection onTerms={() => setShowTerms(true)} onPrivacy={() => setShowPrivacy(true)} />
      <SupportSection />

      <Card>
        <Button variant="danger" fullWidth icon={LogOut} onClick={handleLogout}>
          Sair da Conta
        </Button>
      </Card>

      <AccountSettingsModal
        isOpen={showAccountSettings}
        onClose={() => setShowAccountSettings(false)}
      />
      <TermsModal isOpen={showTerms} onClose={() => setShowTerms(false)} />
      <PrivacyPolicyModal isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} />
      <ConfirmModal
        isOpen={confirmState.isOpen}
        onClose={cancel}
        onConfirm={confirmState.onConfirm}
        title={confirmState.title}
        message={confirmState.message}
        variant={confirmState.variant}
      />
    </div>
  );
};

const SettingsSection = ({ title, children }) => (
  <section className="space-y-2">
    <h2 className="text-sm font-semibold uppercase text-gray-500 dark:text-gray-400">
      {title}
    </h2>
    {children}
  </section>
);

const SettingsRow = ({ icon: Icon, title, description, actionLabel, onClick }) => {
  const content = (
    <>
      <div className="rounded-lg bg-gray-100 p-2 dark:bg-gray-700">
        <Icon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-gray-900 dark:text-white">{title}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
      </div>
      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700 dark:bg-gray-700 dark:text-gray-200">
        {actionLabel}
      </span>
    </>
  );

  if (!onClick) {
    return (
      <Card>
        <div className="flex w-full items-center gap-3 text-left">
          {content}
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <button onClick={onClick} className="flex w-full items-center gap-3 text-left">
        {content}
      </button>
    </Card>
  );
};

const LegalSection = ({ onTerms, onPrivacy }) => (
  <SettingsSection title="Legal">
    <Card>
      <div className="space-y-2">
        <LegalRow
          icon={Shield}
          title="Termos de Uso"
          description="Regras de uso da plataforma"
          actionLabel="Abrir"
          onClick={onTerms}
        />
        <LegalRow
          icon={Shield}
          title="Política de Privacidade"
          description="Como os dados são usados e protegidos"
          actionLabel="Abrir"
          onClick={onPrivacy}
        />
      </div>
    </Card>
  </SettingsSection>
);

const SupportSection = () => (
  <SettingsSection title="Suporte e sobre">
    <Card>
      <div className="space-y-2">
        <LegalRow
          icon={HelpCircle}
          title="Suporte"
          description="Fale com a equipe sobre dúvidas, bugs ou problemas na conta"
          actionLabel="Email"
          onClick={() => {
            window.location.href = 'mailto:contato@servicoslocais.com';
          }}
        />
        <LegalRow
          icon={Mail}
          title="Contato"
          description="contato@servicoslocais.com"
          actionLabel="Abrir"
          onClick={() => {
            window.location.href = 'mailto:contato@servicoslocais.com';
          }}
        />
        <div className="flex w-full items-center gap-3 rounded-lg p-2 text-left">
          <Info className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          <div className="min-w-0 flex-1">
            <p className="font-medium text-gray-900 dark:text-white">Versão do aplicativo</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Plataforma em fase final de desenvolvimento</p>
          </div>
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
            0.9.0 Beta
          </span>
        </div>
      </div>
    </Card>
  </SettingsSection>
);

const LegalRow = ({ icon: Icon, title, description, actionLabel, onClick }) => (
  <button
    onClick={onClick}
    className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
  >
    <Icon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
    <div className="min-w-0 flex-1">
      <p className="font-medium text-gray-900 dark:text-white">{title}</p>
      <p className="text-xs text-gray-600 dark:text-gray-400">{description}</p>
    </div>
    <span className="text-xs font-semibold text-primary-600 dark:text-primary-400">
      {actionLabel}
    </span>
  </button>
);

export default Settings;
