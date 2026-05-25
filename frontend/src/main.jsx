import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { LoadingProvider } from './contexts/LoadingContext';
import { ChatNotificationProvider } from './contexts/ChatNotificationContext';
import { ActivityNotificationProvider } from './contexts/ActivityNotificationContext';
import ErrorBoundary from './components/ErrorBoundary';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <ChatNotificationProvider>
            <ActivityNotificationProvider>
              <NotificationProvider>
                <LoadingProvider>
                  <App />
                </LoadingProvider>
              </NotificationProvider>
            </ActivityNotificationProvider>
          </ChatNotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
