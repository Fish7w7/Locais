import React, { useState } from 'react';
import { 
  ChevronLeft, 
  Moon, 
  Sun, 
  Bell, 
  Lock, 
  Globe, 
  HelpCircle, 
  Info,
  ChevronRight,
  Shield,
  Smartphone,
  Mail
} from 'lucide-react';

const SettingsScreen = (props) => {
  const [notifications, setNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);

  const SettingItem = ({ icon: Icon, title, subtitle, onClick, rightContent }) => (
    <button
      onClick={onClick}
      className="w-full bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm mb-3 flex items-center justify-between hover:shadow-md transition-all border border-transparent dark:border-gray-700"
    >
      <div className="flex items-center space-x-3">
        <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg">
          <Icon size={20} className="text-blue-600 dark:text-blue-400" />
        </div>
        <div className="text-left">
          <div className="font-semibold text-gray-800 dark:text-white">{title}</div>
          {subtitle && <div className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</div>}
        </div>
      </div>
      {rightContent || <ChevronRight size={20} className="text-gray-400" />}
    </button>
  );

  const ToggleSwitch = ({ enabled, onChange }) => (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onChange(!enabled);
      }}
      className={`relative w-12 h-6 rounded-full transition-colors ${
        enabled ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
      }`}
    >
      <div
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-0'
        }`}
      />
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50 transition-colors">
        <div className="flex items-center justify-between p-4">
          <button 
            onClick={() => {
              if (props.userType === 'client') props.setCurrentScreen('clientHome');
              else if (props.userType === 'provider') props.setCurrentScreen('providerHome');
              else if (props.userType === 'company') props.setCurrentScreen('companyHome');
              else props.setCurrentScreen('userSelection');
            }}
            className="text-blue-600 dark:text-blue-400 flex items-center space-x-1"
          >
            <ChevronLeft size={24} />
            <span>Voltar</span>
          </button>
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">Configurações</h1>
          <div className="w-16"></div>
        </div>
      </div>

      <div className="p-4">
        <div className="mb-6">
          <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-3 px-2">APARÊNCIA</h2>
          
          <SettingItem
            icon={props.darkMode ? Sun : Moon}
            title="Modo Escuro"
            subtitle={props.darkMode ? "Ativado" : "Desativado"}
            onClick={() => props.setDarkMode(!props.darkMode)}
            rightContent={<ToggleSwitch enabled={props.darkMode} onChange={props.setDarkMode} />}
          />
        </div>

        <div className="mb-6">
          <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-3 px-2">NOTIFICAÇÕES</h2>
          
          <SettingItem
            icon={Bell}
            title="Notificações"
            subtitle={notifications ? "Ativadas" : "Desativadas"}
            onClick={() => setNotifications(!notifications)}
            rightContent={<ToggleSwitch enabled={notifications} onChange={setNotifications} />}
          />
          
          {notifications && (
            <>
              <SettingItem
                icon={Smartphone}
                title="Notificações Push"
                subtitle="Alertas no dispositivo"
                onClick={() => setPushNotifications(!pushNotifications)}
                rightContent={<ToggleSwitch enabled={pushNotifications} onChange={setPushNotifications} />}
              />
              
              <SettingItem
                icon={Mail}
                title="Notificações por Email"
                subtitle="Receber emails sobre atualizações"
                onClick={() => setEmailNotifications(!emailNotifications)}
                rightContent={<ToggleSwitch enabled={emailNotifications} onChange={setEmailNotifications} />}
              />
            </>
          )}
        </div>

        <div className="mb-6">
          <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-3 px-2">CONTA</h2>
          
          <SettingItem
            icon={Lock}
            title="Privacidade e Segurança"
            subtitle="Senha, autenticação"
          />
          
          <SettingItem
            icon={Shield}
            title="Verificação de Conta"
            subtitle="Documente sua identidade"
          />
          
          <SettingItem
            icon={Globe}
            title="Idioma"
            subtitle="Português (Brasil)"
          />
        </div>

        <div className="mb-6">
          <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-3 px-2">SUPORTE</h2>
          
          <SettingItem
            icon={HelpCircle}
            title="Central de Ajuda"
            subtitle="FAQ e tutoriais"
          />
          
          <SettingItem
            icon={Info}
            title="Sobre o App"
            subtitle="Versão 1.0.0"
          />
        </div>

        <button
          onClick={() => props.setCurrentScreen('userSelection')}
          className="w-full bg-red-500 dark:bg-red-600 text-white p-4 rounded-xl font-bold hover:bg-red-600 dark:hover:bg-red-700 transition-colors shadow-md"
        >
          Sair da Conta
        </button>

        <div className="text-center mt-6 text-sm text-gray-500 dark:text-gray-400">
          <p>Serviços Locais</p>
          <p>Versão 1.0.0</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsScreen;