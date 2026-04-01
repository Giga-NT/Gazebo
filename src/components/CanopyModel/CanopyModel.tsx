import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sky } from '@react-three/drei';
import { useAuth } from '../../hooks/useAuth';
import CanopyControls from '../Controls/CanopyControls';
import Canopy from '../Canopy/Canopy';
import './CanopyModel.css';

interface CanopyParams {
  width: number;
  length: number;
  height: number;
  roofHeight: number;
  overhang: number;
  frameColor: string;
  roofColor: string;
}

const CanopyModel = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [params, setParams] = useState<CanopyParams>({
    width: 6,
    length: 4,
    height: 3,
    roofHeight: 0.8,
    overhang: 0.4,
    frameColor: '#1e3a5f',
    roofColor: '#00a896'
  });

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const [showOrientationAlert, setShowOrientationAlert] = useState(false);

  const isMobile = useIsMobile();

  // Проверка ориентации экрана
  useEffect(() => {
    const checkOrientation = () => {
      const isLandscape = window.innerWidth > window.innerHeight;
      setShowOrientationAlert(isMobile && !isLandscape);
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, [isMobile]);

  const handleParamChange = (name: keyof CanopyParams, value: any) => {
    setParams(prev => ({ ...prev, [name]: value }));
  };

  return (
    <>
      {/* Orientation Alert - блокировка портретного режима */}
      {showOrientationAlert && (
        <div className="canopy-orientation-alert">
          <div style={{ fontSize: '80px', marginBottom: '30px', animation: 'rotate 2s ease-in-out infinite' }}>📱</div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '16px' }}>Переверните устройство</h2>
          <p style={{ fontSize: '16px', lineHeight: '1.6', maxWidth: '400px', opacity: '0.9' }}>
            Для комфортной работы пожалуйста переверните устройство в горизонтальное положение
          </p>
          <p style={{ marginTop: '30px', fontSize: '14px', opacity: '0.7' }}>
            Конфигуратор работает в ландшафтном режиме
          </p>
        </div>
      )}

      <div style={{ display: 'flex', height: '100vh', width: '100vw' }}>
        {/* Burger Button - слева (только в ландшафте и без alert) */}
        {!showOrientationAlert && (
          <button
            className="canopy-burger-btn"
            onClick={() => setIsMenuOpen(true)}
            aria-label="Открыть меню"
          >
            ☰
          </button>
        )}

        {/* Actions Button - справа (только в ландшафте и без alert) */}
        {!showOrientationAlert && (
          <button
            className="canopy-actions-btn"
            onClick={() => setIsActionsOpen(true)}
            aria-label="Действия"
          >
            ⋮
          </button>
        )}

        {/* Overlay */}
        <div
          className={`canopy-overlay ${isMenuOpen || isActionsOpen ? 'active' : ''}`}
          onClick={() => {
            setIsMenuOpen(false);
            setIsActionsOpen(false);
          }}
        />

        {/* Side Panel - слева с контролами */}
        <div className={`canopy-side-panel ${isMenuOpen ? 'active' : ''}`}>
          <div className="canopy-panel-header">
            <h3 className="canopy-panel-title">🏠 Конструктор навеса</h3>
            <button
              className="canopy-panel-close"
              onClick={() => setIsMenuOpen(false)}
              aria-label="Закрыть меню"
            >
              ✕
            </button>
          </div>
          <div className="canopy-panel-content">
            <CanopyControls params={params} onChange={handleParamChange} />
          </div>
        </div>

        {/* Actions Panel - справа */}
        <div className={`canopy-actions-panel ${isActionsOpen ? 'active' : ''}`}>
          <div className="canopy-panel-header">
            <h3 className="canopy-panel-title">Действия</h3>
            <button
              className="canopy-panel-close"
              onClick={() => setIsActionsOpen(false)}
              aria-label="Закрыть"
            >
              ✕
            </button>
          </div>
          <div className="canopy-panel-content">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                onClick={() => navigate('/dashboard')}
                style={{
                  padding: '14px 18px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '15px',
                  fontWeight: '600',
                  boxShadow: '0 4px 12px rgba(108, 117, 125, 0.3)',
                }}
              >
                📁 Личный кабинет
              </button>

              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                style={{
                  padding: '14px 18px',
                  backgroundColor: '#e74c3c',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '15px',
                  fontWeight: '600',
                  boxShadow: '0 4px 12px rgba(231, 76, 60, 0.3)',
                }}
              >
                🚪 Выйти
              </button>
            </div>
          </div>
        </div>

        {/* 3D View */}
        <div style={{ flex: 1, position: 'relative' }}>
          <Canvas
            shadows
            ref={canvasRef}
            camera={{ position: [10, 10, 20], fov: 50 }}
            style={{ background: '#87CEEB' }}
          >
            <Sky distance={10000} sunPosition={[10, 20, 10]} />
            <ambientLight intensity={0.5} />
            <directionalLight
              position={[10, 10, 10]}
              intensity={1}
              castShadow
              shadow-mapSize={2048}
            />

            <Canopy params={params} />

            <OrbitControls
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              minPolarAngle={0}
              maxPolarAngle={Math.PI / 2}
            />
          </Canvas>
        </div>
      </div>
    </>
  );
};

// Хук для определения мобильного устройства
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
};

export default CanopyModel;
