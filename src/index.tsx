/**
 * Copyright (c) 2026 Giga-NT (Григорьев Константин Владимирович)
 * Все права защищены.
 * 
 * License: Proprietary
 * См. LICENSE файл в корне проекта.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';  // ← ДОБАВЬТЕ ЭТУ СТРОКУ
import App from './App';
import './index.css';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <HelmetProvider>           {/* ← ОБЕРНИТЕ BrowserRouter В HelmetProvider */}
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
);

// Регистрация Service Worker для PWA
serviceWorkerRegistration.register({
  onSuccess: (registration) => {
    console.log('✅ PWA установлено успешно!');
  },
  onUpdate: (registration) => {
    console.log('🔄 Доступно обновление PWA');
    if (window.confirm('Доступна новая версия приложения. Обновить?')) {
      window.location.reload();
    }
  }
});