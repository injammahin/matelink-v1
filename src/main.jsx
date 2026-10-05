import React from 'react';

import ReactDOM from 'react-dom/client';

import {
  BrowserRouter,
} from 'react-router-dom';

import '@fontsource/manrope/400.css';
import '@fontsource/manrope/500.css';
import '@fontsource/manrope/600.css';
import '@fontsource/manrope/700.css';
import '@fontsource/manrope/800.css';

import './styles/index.css';

import App from './app/App';

import {
  AppProvider,
} from './context/AppContext';

import {
  AuthProvider,
} from './context/AuthContext';

ReactDOM
  .createRoot(
    document.getElementById('root')
  )
  .render(
    <React.StrictMode>
      <BrowserRouter>
        <AppProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </AppProvider>
      </BrowserRouter>
    </React.StrictMode>
  );