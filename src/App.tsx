/**
 * Copyright (c) 2026 Giga-NT (Григорьев Константин Владимирович)
 * Все права защищены.
 * 
 * License: Proprietary
 * См. LICENSE файл в корне проекта.
 */

import { Routes, Route, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';  // ← ДОБАВЬТЕ ИМПОРТ
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { RegisterForm as RegisterPage } from './pages/RegisterPage';
import FrameModel from './components/FrameModel/FrameModel';
import { UserDashboard } from './pages/UserDashboard';
import { VerifyAccount } from './pages/VerifyAccount';
import GreenhouseModel from './components/GreenhouseModel/GreenhouseModel';
import { OrderPage } from './pages/OrderPage';
import { OrderDetailsPage } from './pages/OrderDetailsPage';
import GazeboModel from './components/GazeboModel/GazeboModel';
import WarehouseModel from './components/WarehouseModel/WarehouseModel';
// import BaniaBarrelModel from './components/BaniaBarrelModel/BaniaBarrelModel';
import AdminRoute from './components/AdminRoute';
import PriceEditor from './components/PriceEditor';
import { PWAInstallPrompt } from './components/UI/PWAInstallPrompt';

// Импорт компонентов для страниц документов
import { PrivacyPolicyPage } from './pages/PrivacyPolicy';
import { TermsOfUsePage } from './pages/TermsOfUse';

function App() {
  return (
    <>
      {/* Базовые мета-теги для всего приложения */}
      <Helmet>
        <title>FrameConstructor | 3D конструктор беседок и навесов</title>
        <meta name="description" content="Создайте 3D модель беседки, навеса или теплицы под ключ. ✅ Визуализация в реальном времени. ✅ Расчет стоимости. ✅ 50+ проектов." />
        <meta name="keywords" content="3D конструктор беседок, навес под ключ, арочный навес, двускатная беседка, теплица из поликарбоната" />
      </Helmet>
      
      <PWAInstallPrompt />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify" element={<VerifyAccount />} />
        
        {/* Страницы документов (открываются без авторизации) */}
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/terms" element={<TermsOfUsePage />} />
        
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <UserDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/frame"
          element={
            <ProtectedRoute>
              <FrameModel />
            </ProtectedRoute>
          }
        />
		// В App.tsx, найдите и измените:
		<Route path="/greenhouse" element={<GreenhouseModel />} />  // без ProtectedRoute
        <Route
          path="/gazebo"
          element={
            <ProtectedRoute>
              <GazeboModel />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/warehouse"
          element={
            <ProtectedRoute>
              <WarehouseModel />
            </ProtectedRoute>
          }
        />

        <Route path="/admin/prices" element={
          <AdminRoute>
            <PriceEditor />
          </AdminRoute>
        } />
        <Route
          path="/order"
          element={
            <ProtectedRoute>
              <OrderPage />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/order-details" 
          element={
            <ProtectedRoute>
              <OrderDetailsPage />
            </ProtectedRoute>
          } 
        />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  );
}

export default App;