import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Sky } from '@react-three/drei';
import * as THREE from 'three';
import styled from 'styled-components';
import Modal from 'react-modal';
import { HexColorPicker } from 'react-colorful';
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter';
import ErrorBoundary from '../ErrorBoundary';
import { GreenhouseParams, initialGreenhouseParams } from '../../types/GreenhouseTypes';
import GreenhouseControls from '../Controls/GreenhouseControls';
import { useAuth } from '../../hooks/useAuth';
import './GreenhouseModel.css';
import ArchedRoof from '../Greenhouse/ArchedRoof';
import GableRoof from '../Greenhouse/GableRoof';
import GreenhouseWalls from '../Greenhouse/GreenhouseWalls';
import GreenhouseFoundation from '../Greenhouse/GreenhouseFoundation';
import SEO from '../SEO';  // ← ДОБАВЬТЕ ЭТУ СТРОКУ
import { GreenhouseDemo } from '../Greenhouse/GreenhouseDemo';

interface MaterialPrices {
  material: number;
  work: number;
}

interface Prices {
  polycarbonate: MaterialPrices;
  glass: MaterialPrices;
  film: MaterialPrices;
  tube: {
    '100x100': number;
    '80x80': number;
    '60x60': number;
    '40x20': number;
  };
  foundation: {
    wood: MaterialPrices;
    concrete: MaterialPrices;
    piles: MaterialPrices;
    none: MaterialPrices;
  };
  screws: MaterialPrices;
  frame: {
    work: number;
  };
  painting: MaterialPrices;
  doors: MaterialPrices;
}

const prices: Prices = {
  polycarbonate: { material: 600, work: 400 },
  glass: { material: 1500, work: 700 },
  film: { material: 200, work: 100 },
  tube: {
    '100x100': 1200,
    '80x80': 900,
    '60x60': 700,
    '40x20': 500
  },
  foundation: {
    wood: { material: 2000, work: 1000 },
    concrete: { material: 3500, work: 1500 },
    piles: { material: 2500, work: 1200 },
    none: { material: 0, work: 0 }
  },
  screws: { material: 10, work: 0.5 },
  frame: { work: 800 },
  painting: { material: 200, work: 100 },
  doors: { material: 5000, work: 2000 }
};


// Стилизованные компоненты с адаптацией для мобильных устройств
const Container = styled.div<{ $isMobile: boolean }>`
  display: flex;
  height: 100vh;
  width: 100vw;
  flex-direction: ${({ $isMobile }) => ($isMobile ? 'column' : 'row')};
  font-family: 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
  overflow: hidden;
  position: relative;
`;

const ModelView = styled.div<{ $isMobile: boolean }>`
  flex: 1;
  position: relative;
  width: 100%;
  height: 100vh;
  background: #f0f2f5;
  overflow: hidden;
`;

const PrintContainer = styled.div`
  padding: 20px;
  background: white;
  color: black;
`;

const PrintHeader = styled.h1`
  text-align: center;
  margin-bottom: 30px;
`;

const PrintTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
`;

const PrintTableHeader = styled.th`
  text-align: left;
  padding: 8px;
  border-bottom: 2px solid #333;
`;

const PrintTableRow = styled.tr`
  &:nth-child(even) {
    background-color: #f8f8f8;
  }
`;

const PrintTableCell = styled.td`
  padding: 8px;
  border-bottom: 1px solid #ddd;
`;

const PrintTotalRow = styled.tr`
  font-weight: bold;
  background-color: #e8e8e8 !important;
`;

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

// Компонент Ground с улучшенной типизацией
const Ground = ({ groundType = 'grass' }: { groundType?: 'grass' | 'wood' | 'concrete' }) => {
  const { scene } = useThree();
  
  useEffect(() => {
    const groundGeometry = new THREE.CircleGeometry(100, 32);
    let groundTexture: THREE.Texture;
    
    if (groundType === 'grass') {
      groundTexture = new THREE.TextureLoader().load(
        'https://threejs.org/examples/textures/terrain/grasslight-big.jpg'
      );
    } else if (groundType === 'wood') {
      groundTexture = new THREE.TextureLoader().load(
        'https://threejs.org/examples/textures/hardwood2_diffuse.jpg'
      );
    } else {
      groundTexture = new THREE.TextureLoader().load(
        'https://threejs.org/examples/textures/terrain/grasslight-big.jpg'
      );
    }

    groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
    groundTexture.repeat.set(10, 10);
    
    const groundMaterial = new THREE.MeshStandardMaterial({ 
      map: groundTexture,
      roughness: 0.4,
      metalness: 0.0
    });
    
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.1;
    ground.receiveShadow = true;
    scene.add(ground);

    return () => {
      scene.remove(ground);
    };
  }, [groundType, scene]);

  return null;
};

// Функция для расчета стоимости теплицы
const calculateGreenhouseCost = (params: GreenhouseParams) => {
  // Проверка существования материала в prices
  const coverMaterial = params.coverMaterial;
  if (!(coverMaterial in prices)) {
    throw new Error(`Unknown cover material: ${coverMaterial}`);
  }
  const coverPrices = prices[coverMaterial];

  // Расчет площади покрытия
  const coverArea = params.width * params.length * (params.type === 'gable' ? 1.2 : 1);
  
  // Расчет длины каркаса
  const frameLength = (params.width * 2 + params.length * 2) * params.height;
  
  // Расчет стоимости материалов
  const coverMaterialCost = coverArea * coverPrices.material;
  
  // Расчет стоимости каркаса
  const tubeSize = params.frameMaterial === 'metal' ? '40x20' : '60x60';
  const tubeCost = frameLength * prices.tube[tubeSize];
  
  // Расчет фундамента
  const foundationPerimeter = (params.length * 2) + (params.width * 2);
  const foundationType = params.foundationType;
  const foundationMaterialCost = foundationPerimeter * prices.foundation[foundationType].material;
  const foundationWorkCost = foundationPerimeter * prices.foundation[foundationType].work;
  
  // Дополнительные элементы (двери, крепеж)
  const screwCount = Math.ceil(coverArea * 8);
  const screwsMaterialCost = screwCount * prices.screws.material;
  const screwsWorkCost = screwCount * prices.screws.work;
  const doorsCost = params.hasDoors ? prices.doors.material : 0;
  const doorsWorkCost = params.hasDoors ? prices.doors.work : 0;
  
  // Монтажные работы
  const coverWorkCost = coverArea * coverPrices.work;
  const frameWorkCost = frameLength * prices.frame.work;
  const paintingCost = frameLength * (prices.painting.material + prices.painting.work);
  
  // Итоговые суммы
  const materialsCost = coverMaterialCost + tubeCost + foundationMaterialCost + screwsMaterialCost + doorsCost;
  const workCost = coverWorkCost + frameWorkCost + foundationWorkCost + screwsWorkCost + doorsWorkCost + paintingCost;
  const totalCost = materialsCost + workCost;

  return {
    coverMaterial: {
      name: 'Материал покрытия',
      cost: coverMaterialCost,

      details: `${coverArea.toFixed(1)} м² × ${coverPrices.material} ₽/м²`
    },
    frame: {
      name: 'Каркас',
      cost: tubeCost,
      details: `Трубы: ${frameLength.toFixed(1)} м × ${prices.tube[tubeSize]} ₽/м`
    },
    foundation: {
      name: 'Фундамент',
      cost: foundationMaterialCost,
      work: foundationWorkCost,
      details: `Периметр: ${foundationPerimeter.toFixed(1)} м × ${prices.foundation[params.foundationType].material} ₽/м`
    },
    additional: {
      name: 'Дополнительные элементы',
      cost: screwsMaterialCost + doorsCost,
      work: screwsWorkCost + doorsWorkCost,
      details: `Крепеж: ${screwCount} шт × ${prices.screws.material} ₽` + 
               (params.hasDoors ? `\nДвери: 1 × ${prices.doors.material} ₽` : '')
    },
    coverWork: {
      name: 'Монтаж покрытия',
      cost: coverWorkCost,
      details: `${coverArea.toFixed(1)} м² × ${prices[params.coverMaterial].work} ₽/м²`
    },
    frameWork: {
      name: 'Сборка каркаса',
      cost: frameWorkCost,
      details: `${frameLength.toFixed(1)} м × ${prices.frame.work} ₽/м`
    },
    painting: {
      name: 'Покраска',
      cost: paintingCost,
      details: `${frameLength.toFixed(1)} м × ${prices.painting.material + prices.painting.work} ₽/м`
    },
    totalCost,
    frameLength,
    coverArea
  };
};

Modal.setAppElement('#root');

const GreenhouseModel: React.FC = () => {
  const isMounted = useRef(false);
  const { currentUser, saveProject, logout } = useAuth();
  const navigate = useNavigate();
  const sceneRef = useRef<THREE.Scene>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const projectId = searchParams.get('project');
  const initialParams = location.state?.projectParams || initialGreenhouseParams;

  const [params, setParams] = useState<GreenhouseParams>(initialParams);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [isCostModalOpen, setIsCostModalOpen] = useState(false);
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [isTakingScreenshot, setIsTakingScreenshot] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  const [doorsOpen, setDoorsOpen] = useState(false);
  const [ventsOpen, setVentsOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const [showOrientationAlert, setShowOrientationAlert] = useState(false);
  const isAuthenticated = !!currentUser;
  const [showLoginModal, setShowLoginModal] = useState(false);

  const isMobile = useIsMobile();

  // Расчёт стоимости
  const costData = calculateGreenhouseCost(params);

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

  useEffect(() => {
    try {
      if (params && params.width && params.length && params.height) {
        const calculatedCost = calculateGreenhouseCost(params);
        // Обновляем состояние, если нужно
      }
    } catch (error) {
      console.error('Ошибка расчета стоимости:', error);
    }
  }, [params]);

  // Загрузка проекта при наличии projectId
// В начале компонента, ПОСЛЕ вызова useAuth():
const { getUserProjects } = useAuth();

useEffect(() => {
  const loadProject = async () => {
    if (projectId && currentUser) {
      try {
        // useAuth() уже вызван выше, здесь просто используем функцию
        const projects = await getUserProjects();
        const project = projects.find(p => p.id === projectId);
        if (project) {
          setParams(project.params);
        }
      } catch (error) {
        console.error('Error loading project:', error);
      }
    }
  };
  
  loadProject();
}, [projectId, currentUser, getUserProjects]); // Добавьте getUserProjects в зависимости

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
    }
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleParamChange = (name: keyof GreenhouseParams, value: any) => {
    setParams(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProject = async () => {
    if (!currentUser) {
      alert('Для сохранения проекта необходимо войти в систему');
      navigate('/login');
      return;
    }

    if (!projectName.trim()) {
      alert('Пожалуйста, укажите название проекта');
      return;
    }

    try {
      await saveProject(projectName, params, 'greenhouse');
      setProjectName('');
      setSaveModalOpen(false);
      alert('Проект успешно сохранен в вашем аккаунте!');
    } catch (error) {
      console.error('Ошибка при сохранении проекта:', error);
      alert('Не удалось сохранить проект. Попробуйте снова.');
    }
  };

const handlePrint = async () => {
  // Проверка авторизации
  if (!isAuthenticated) {
    setShowLoginModal(true);
    return;
  }

  setIsTakingScreenshot(true);

  try {
    await new Promise(resolve => requestAnimationFrame(resolve));
    
    const canvas = canvasRef.current;
    if (!canvas) {
      console.error('Canvas не найден');
      return;
    }

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const ctx = tempCanvas.getContext('2d');
    if (!ctx) return;
    
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    ctx.drawImage(canvas, 0, 0);

    const screenshot = tempCanvas.toDataURL('image/jpeg', 0.9);
    setScreenshot(screenshot);

    await new Promise(resolve => setTimeout(resolve, 500));

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printContent = printRef.current?.innerHTML;
    if (!printContent) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Проект теплицы</title>
          <style>
            @page { size: A4; margin: 10mm; }
            body { font-family: Arial; padding: 20px; }
            img { max-width: 100%; height: auto; margin: 20px 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          ${printContent}
          <script>
            setTimeout(() => {
              window.print();
              window.close();
            }, 500);
          <\/script>
        </body>
      </html>
    `);
    printWindow.document.close();

  } catch (error) {
    console.error('Ошибка:', error);
  } finally {
    setIsTakingScreenshot(false);
  }
};

  const SaveProjectModal = () => (
    <Modal
      isOpen={saveModalOpen}
      onRequestClose={() => setSaveModalOpen(false)}
      style={{
        overlay: {
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        },
        content: {
          position: 'relative',
          inset: 'auto',
          width: '400px',
          maxWidth: '90%',
          padding: '25px',
          borderRadius: '8px',
          border: 'none',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
        }
      }}
    >
      <h2 style={{ marginTop: 0, color: '#2c3e50' }}>Сохранение проекта</h2>
      <div style={{ margin: '25px 0' }}>
        <label style={{ display: 'block', marginBottom: '10px', fontWeight: 500 }}>
          Название проекта:
        </label>
        <input
          type="text"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '6px',
            border: '1px solid #ddd',
            fontSize: '16px'
          }}
          placeholder="Например: Теплица для овощей"
          autoFocus
        />
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
        <button
          onClick={() => setSaveModalOpen(false)}
          style={{
            padding: '10px 18px',
            background: '#f5f5f5',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '15px',
            transition: 'background 0.2s'
          }}
        >
          Отмена
        </button>
        <button
          onClick={handleSaveProject}
          disabled={!projectName.trim()}
          style={{
            padding: '10px 18px',
            background: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '15px',
            transition: 'opacity 0.2s',
            opacity: !projectName.trim() ? 0.6 : 1
          }}
        >
          Сохранить
        </button>
      </div>
    </Modal>
  );

  const PrintComponent = React.forwardRef<HTMLDivElement>((_, ref) => {
    return (
      <PrintContainer ref={ref}>
        <PrintHeader>Детальный расчет стоимости теплицы</PrintHeader>
        
        {screenshot && (
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <img 
              src={screenshot} 
              alt="3D модель теплицы"
              style={{ 
                maxWidth: '100%', 
                height: 'auto',
                border: '1px solid #ddd',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }} 
            />
          </div>
        )}
        
        <div>
          <h2>Основные параметры</h2>
          <p>Размеры: {params.width.toFixed(1)}м × {params.length.toFixed(1)}м × {params.height.toFixed(1)}м</p>
          <p>Тип: {params.type === 'arched' ? 'Арочная' : 'Двухскатная'}</p>
          <p>Материал покрытия: {params.coverMaterial === 'polycarbonate' ? 'Поликарбонат' : 'Стекло'}</p>
          <p>Фундамент: {params.foundationType === 'wood' ? 'Деревянный' : 
                         params.foundationType === 'concrete' ? 'Бетонный' : 'Свайный'}</p>
        </div>
        
        <PrintTable>
          <thead>
            <tr>
              <PrintTableHeader>Позиция</PrintTableHeader>
              <PrintTableHeader>Материалы</PrintTableHeader>
              <PrintTableHeader>Работы</PrintTableHeader>
              <PrintTableHeader>Детали</PrintTableHeader>
            </tr>
          </thead>
          <tbody>
            <PrintTableRow>
              <PrintTableCell>{costData.coverMaterial.name}</PrintTableCell>
              <PrintTableCell>{Math.round(costData.coverMaterial.cost).toLocaleString('ru-RU')} ₽</PrintTableCell>
              <PrintTableCell>-</PrintTableCell>
              <PrintTableCell>{costData.coverMaterial.details}</PrintTableCell>
            </PrintTableRow>
            
            <PrintTableRow>
              <PrintTableCell>{costData.frame.name}</PrintTableCell>
              <PrintTableCell>{Math.round(costData.frame.cost).toLocaleString('ru-RU')} ₽</PrintTableCell>
              <PrintTableCell>-</PrintTableCell>
              <PrintTableCell>{costData.frame.details}</PrintTableCell>
            </PrintTableRow>

            <PrintTableRow>
              <PrintTableCell>{costData.foundation.name}</PrintTableCell>
              <PrintTableCell>{Math.round(costData.foundation.cost).toLocaleString('ru-RU')} ₽</PrintTableCell>
              <PrintTableCell>{Math.round(costData.foundation.work).toLocaleString('ru-RU')} ₽</PrintTableCell>
              <PrintTableCell>{costData.foundation.details}</PrintTableCell>
            </PrintTableRow>

            <PrintTableRow>
              <PrintTableCell>{costData.additional.name}</PrintTableCell>
              <PrintTableCell>{Math.round(costData.additional.cost).toLocaleString('ru-RU')} ₽</PrintTableCell>
              <PrintTableCell>{Math.round(costData.additional.work).toLocaleString('ru-RU')} ₽</PrintTableCell>
              <PrintTableCell>
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{costData.additional.details}</pre>
              </PrintTableCell>
            </PrintTableRow>

            <PrintTableRow>
              <PrintTableCell>{costData.coverWork.name}</PrintTableCell>
              <PrintTableCell>-</PrintTableCell>
              <PrintTableCell>{Math.round(costData.coverWork.cost).toLocaleString('ru-RU')} ₽</PrintTableCell>
              <PrintTableCell>{costData.coverWork.details}</PrintTableCell>
            </PrintTableRow>

            <PrintTableRow>
              <PrintTableCell>{costData.frameWork.name}</PrintTableCell>
              <PrintTableCell>-</PrintTableCell>
              <PrintTableCell>{Math.round(costData.frameWork.cost).toLocaleString('ru-RU')} ₽</PrintTableCell>
              <PrintTableCell>{costData.frameWork.details}</PrintTableCell>
            </PrintTableRow>

            <PrintTableRow>
              <PrintTableCell>{costData.painting.name}</PrintTableCell>
              <PrintTableCell>-</PrintTableCell>
              <PrintTableCell>{Math.round(costData.painting.cost).toLocaleString('ru-RU')} ₽</PrintTableCell>
              <PrintTableCell>{costData.painting.details}</PrintTableCell>
            </PrintTableRow>

            <PrintTotalRow>
              <PrintTableCell colSpan={2}>Итого материалы: {Math.round(
                costData.coverMaterial.cost + 
                costData.frame.cost + 
                costData.foundation.cost + 
                costData.additional.cost
              ).toLocaleString('ru-RU')} ₽</PrintTableCell>
              <PrintTableCell colSpan={2}>Итого работы: {Math.round(
                costData.foundation.work + 
                costData.additional.work + 
                costData.coverWork.cost + 
                costData.frameWork.cost + 
                costData.painting.cost
              ).toLocaleString('ru-RU')} ₽</PrintTableCell>
            </PrintTotalRow>
            <PrintTotalRow>
              <PrintTableCell colSpan={4}>Общая стоимость: {Math.round(costData.totalCost).toLocaleString('ru-RU')} ₽</PrintTableCell>
            </PrintTotalRow>
          </tbody>
        </PrintTable>
      </PrintContainer>
    );
  });

// Модальное окно входа (добавьте после SaveProjectModal)
const LoginModal = () => (
  <Modal
    isOpen={showLoginModal}
    onRequestClose={() => setShowLoginModal(false)}
    style={{
      overlay: { backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
      content: { position: 'relative', inset: 'auto', width: '350px', maxWidth: '90%', padding: '30px', borderRadius: '16px', border: 'none', textAlign: 'center' }
    }}
  >
    <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔐</div>
    <h3 style={{ margin: '0 0 8px', color: '#2c3e50' }}>Требуется регистрация</h3>
    <p style={{ color: '#666', marginBottom: '24px' }}>Зарегистрируйтесь, чтобы сохранять проекты и получать детальные расчёты</p>
    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
      <button onClick={() => navigate('/login')} style={{ padding: '10px 20px', background: '#3498db', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Войти</button>
      <button onClick={() => navigate('/register')} style={{ padding: '10px 20px', background: '#2ecc71', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Регистрация</button>
    </div>
    <button onClick={() => setShowLoginModal(false)} style={{ marginTop: '20px', background: 'none', border: 'none', color: '#999', cursor: 'pointer' }}>Позже</button>
  </Modal>
);

return (
  <>
    <SEO 
      title="3D конструктор теплицы | Расчет теплицы из поликарбоната"
      description="Спроектируйте теплицу из поликарбоната в 3D. ✅ Визуализация в реальном времени. ✅ Бесплатная демо-версия. ✅ Регистрация для сохранения проектов."
      keywords="конструктор теплицы, теплица из поликарбоната, 3D модель теплицы"
      canonicalUrl="/greenhouse"
    />

    {/* Демо-баннер для незарегистрированных */}
    {!isAuthenticated && (
      <div style={{
        position: 'fixed',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'linear-gradient(135deg, #00a896, #008f7f)',
        color: 'white',
        padding: '10px 20px',
        borderRadius: '40px',
        display: 'flex',
        gap: '16px',
        alignItems: 'center',
        zIndex: 200,
        boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
        fontSize: '14px'
      }}>
        <span>🔓 Демо-режим</span>
        <button onClick={() => navigate('/register')} style={{
          background: 'white',
          color: '#008f7f',
          border: 'none',
          padding: '6px 16px',
          borderRadius: '30px',
          cursor: 'pointer',
          fontWeight: 'bold'
        }}>Зарегистрироваться → Полный доступ</button>
      </div>
    )}

    {/* Информационная панель для демо */}
    {!isAuthenticated && (
      <div style={{
        position: 'fixed',
        left: '20px',
        bottom: '20px',
        background: 'rgba(0,0,0,0.8)',
        backdropFilter: 'blur(10px)',
        color: 'white',
        padding: '16px',
        borderRadius: '16px',
        maxWidth: '260px',
        zIndex: 200,
        fontSize: '13px'
      }}>
        <h3 style={{ margin: '0 0 8px', fontSize: '16px' }}>🌱 Демо-теплица</h3>
        <p>📐 Размер: 3×4×2.5 м</p>
        <p>🏗️ Тип: Арочная</p>
        <p>🔧 Материал: Поликарбонат</p>
        <button onClick={() => navigate('/register')} style={{
          background: '#00a896',
          border: 'none',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '8px',
          marginTop: '12px',
          cursor: 'pointer',
          width: '100%'
        }}>🔓 Получить полный доступ</button>
        <ul style={{ margin: '12px 0 0 20px', padding: 0, fontSize: '12px' }}>
          <li>✓ Менять размеры</li>
          <li>✓ Рассчитать стоимость</li>
          <li>✓ Сохранять проекты</li>
        </ul>
      </div>
    )}

    {/* Баннер авторизованного пользователя */}
    {isAuthenticated && (
      <div style={{
        position: 'fixed',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: '#2ecc71',
        color: 'white',
        padding: '8px 20px',
        borderRadius: '40px',
        zIndex: 200,
        fontSize: '14px',
        display: 'flex',
        gap: '12px'
      }}>
        <span>✅ Полный доступ</span>
        <button onClick={() => { logout(); navigate('/login'); }} style={{
          background: 'rgba(255,255,255,0.2)',
          border: 'none',
          color: 'white',
          padding: '4px 12px',
          borderRadius: '20px',
          cursor: 'pointer'
        }}>Выйти</button>
      </div>
    )}

    {/* Блокировка портретного режима */}
    {showOrientationAlert && (
      <div className="greenhouse-orientation-alert">
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

    <Container $isMobile={isMobile}>
      {/* Burger Button */}
      {!showOrientationAlert && (
        <button
          className="greenhouse-burger-btn"
          onClick={() => setIsMenuOpen(true)}
          aria-label="Открыть меню"
        >
          ☰
        </button>
      )}
      
      {/* Actions Button */}
      {!showOrientationAlert && (
        <button
          className="greenhouse-actions-btn"
          onClick={() => setIsActionsOpen(true)}
          aria-label="Действия"
        >
          ⋮
        </button>
      )}

      {/* Overlay */}
      <div
        className={`greenhouse-overlay ${isMenuOpen || isActionsOpen ? 'active' : ''}`}
        onClick={() => {
          setIsMenuOpen(false);
          setIsActionsOpen(false);
        }}
      />

      {/* Side Panel - слева с контролами (только для авторизованных) */}
      {isAuthenticated && (
        <div className={`greenhouse-side-panel ${isMenuOpen ? 'active' : ''}`}>
          <div className="greenhouse-panel-header">
            <h3 className="greenhouse-panel-title">🌱 Конструктор теплицы</h3>
            <button
              className="greenhouse-panel-close"
              onClick={() => setIsMenuOpen(false)}
              aria-label="Закрыть меню"
            >
              ✕
            </button>
          </div>
          <div className="greenhouse-panel-content">
            <GreenhouseControls
              params={params}
              onChange={handleParamChange}
              ventsOpen={ventsOpen}
              setVentsOpen={setVentsOpen}
            />
          </div>
        </div>
      )}
      
      {/* Actions Panel - справа (только для авторизованных) */}
      {isAuthenticated && (
        <div className={`greenhouse-actions-panel ${isActionsOpen ? 'active' : ''}`}>
          <div className="greenhouse-panel-header">
            <h3 className="greenhouse-panel-title">Действия</h3>
            <button
              className="greenhouse-panel-close"
              onClick={() => setIsActionsOpen(false)}
              aria-label="Закрыть"
            >
              ✕
            </button>
          </div>
          <div className="greenhouse-panel-content">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                onClick={() => setIsCostModalOpen(true)}
                style={{
                  padding: '14px 18px',
                  backgroundColor: '#3498db',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '15px',
                  fontWeight: '600',
                }}
              >
                💰 Детальный расчет
              </button>
              
              <button
                onClick={() => setSaveModalOpen(true)}
                style={{
                  padding: '14px 18px',
                  backgroundColor: '#2ecc71',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '15px',
                  fontWeight: '600',
                }}
              >
                💾 Сохранить проект
              </button>
              
              <button
                onClick={() => setDoorsOpen(!doorsOpen)}
                style={{
                  padding: '14px 18px',
                  backgroundColor: doorsOpen ? '#e67e22' : '#f39c12',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '15px',
                  fontWeight: '600',
                }}
              >
                {doorsOpen ? '🚪 Закрыть двери' : '🚪 Открыть двери'}
              </button>
              
              <button
                onClick={() => setVentsOpen(!ventsOpen)}
                style={{
                  padding: '14px 18px',
                  backgroundColor: ventsOpen ? '#9b59b6' : '#8e44ad',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '15px',
                  fontWeight: '600',
                }}
              >
                {ventsOpen ? '💨 Закрыть форточки' : '💨 Открыть форточки'}
              </button>
              
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
                }}
              >
                📁 Личный кабинет
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3D View */}
      <ModelView $isMobile={isMobile}>
        <ErrorBoundary>
          {!isAuthenticated ? (
            <GreenhouseDemo doorsOpen={doorsOpen} ventsOpen={ventsOpen} />
          ) : (
            <Canvas
              shadows
              ref={canvasRef}
              style={{ width: '100%', height: '100%' }}
              camera={{
                position: [
                  params.width * (isMobile ? 1.2 : 1.5),
                  params.height * (isMobile ? 1.0 : 1.2),
                  params.length * (isMobile ? 1.2 : 1.5)
                ],
                fov: isMobile ? 60 : 50,
                near: 0.1,
                far: 1000
              }}
              onCreated={({ scene }) => { sceneRef.current = scene }}
            >
              <Sky distance={10000} sunPosition={[10, 20, 10]} />
              <Ground groundType={params.groundType} />
              <ambientLight intensity={1.2} />
              <directionalLight
                position={[10, 20, 10]}
                intensity={1.2}
                castShadow
                shadow-mapSize-width={1024}
                shadow-mapSize-height={1024}
              />
              <directionalLight position={[-10, 10, -10]} intensity={0.6} />

              {params.type === 'arched' && <ArchedRoof params={params} />}
              {params.type === 'gable' && <GableRoof params={params} />}
              <GreenhouseWalls
                params={params}
                doorsOpen={doorsOpen}
                setDoorsOpen={setDoorsOpen}
                ventsOpen={ventsOpen}
              />
              <GreenhouseFoundation params={params} />

              <OrbitControls
                minDistance={Math.max(params.width, params.length) * 0.8}
                maxDistance={Math.max(params.width, params.length) * 3}
                enablePan={!isMobile}
                target={[0, params.height / 2, 0]}
              />
            </Canvas>
          )}
        </ErrorBoundary>
      </ModelView>

      {/* Модальные окна */}
      <SaveProjectModal />
      <LoginModal />
    </Container>
  </>
);
};

export default React.memo(GreenhouseModel);