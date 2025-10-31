import React, { useState, useEffect } from 'react';
import UserSelection from './screens/UserSelection';
import ClientHome from './screens/ClientHome';
import ProviderHome from './screens/ProviderHome';
import CompanyHome from './screens/CompanyHome';
import JobsList from './screens/JobsList';
import ProfileScreen from './screens/ProfileScreen';
import SettingsScreen from './screens/SettingsScreen';
import RequestsDemo from './components/RequestsDemo';

const App = () => {
  const [currentScreen, setCurrentScreen] = useState('userSelection');
  const [userType, setUserType] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const screenProps = {
    currentScreen,
    setCurrentScreen,
    userType,
    setUserType,
    menuOpen,
    setMenuOpen,
    darkMode,
    setDarkMode
  };

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-gray-900 transition-colors" style={{ minHeight: '100vh' }}>
      {currentScreen === 'userSelection' && <UserSelection {...screenProps} />}
      {currentScreen === 'clientHome' && <ClientHome {...screenProps} />}
      {currentScreen === 'settings' && <SettingsScreen {...screenProps} />}
      {currentScreen === 'providerHome' && <ProviderHome {...screenProps} />}
      {currentScreen === 'companyHome' && <CompanyHome {...screenProps} />}
      {currentScreen === 'requests' && <RequestsDemo userType={userType} setCurrentScreen={setCurrentScreen} />}
      {currentScreen === 'jobsList' && <JobsList {...screenProps} />}
      {currentScreen === 'profile' && <ProfileScreen {...screenProps} />}
    </div>
  );
};

export default App;