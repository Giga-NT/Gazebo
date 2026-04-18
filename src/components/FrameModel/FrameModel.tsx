import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Sky } from '@react-three/drei';
import * as THREE from 'three';
import styled from 'styled-components';
import Modal from 'react-modal';
import { HexColorPicker } from 'react-colorful';
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter';
import ErrorBoundary from '../ErrorBoundary';
import MainControls from '../Controls/MainControls';
import ConstructionControls from '../Controls/ConstructionControls';
import TubeControls from '../Controls/TubeControls';
import AppearanceControls from '../Controls/AppearanceControls';
import FoundationControls from '../Controls/FoundationControls';
import './FrameModel.css';
import { CanopyParams } from '../../types/types';
import Pillars from '../Beams/Pillars';
import Foundations from '../Foundations/Foundations';
import Trusses from '../Beams/Trusses';
import Lathing from '../Beams/Lathing';
import RoofCover from '../Roof/RoofCover';
import { useAuth } from '../../hooks/useAuth';
import { useLocation } from 'react-router-dom';
import ArchedTruss from '../Beams/ArchedTruss';
import LongitudinalBeams from '../Beams/LongitudinalBeams';
import { calculateCanopyCost } from '../../utils/canopyCalculator';

// Стилизованные компоненты
const Container = styled.div<{ $isMobile: boolean }>`
  display: flex;
  height: 100vh;
  width: 100vw;
  flex-direction: ${({ $isMobile }) => ($isMobile ? 'column' : 'row')};
  font-family: 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
  overflow: hidden;
`;

const ControlsPanel = styled.div<{ $isMobile: boolean }>`
  width: ${({ $isMobile }) => ($isMobile ? '100%' : '380px')};
  padding: 20px;
  background: #ffffff;
  overflow-y: auto;
  flex-shrink: 0;
  box-shadow: ${({ $isMobile }) => ($isMobile ? 'none' : '2px 0 10px rgba(0,0,0,0.1)')};
  z-index: 10;
`;

const ModelView = styled.div<{ $isMobile: boolean }>`
  flex: 1;
  position: relative;
  min-height: ${({ $isMobile }) => ($isMobile ? '60vh' : '100vh')};
  width: 100%;
  background: #f0f2f5;
`;

const Title = styled.h2`
  margin: 0 0 20px 0;
  color: #2c3e50;
  font-weight: 600;
  font-size: 1.5rem;
`;

const ControlSection = styled.div`
  margin-bottom: 25px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eaeaea;
`;

const SectionTitle = styled.h3`
  margin: 0 0 15px 0;
  color: #34495e;
  font-weight: 500;
  font-size: 1.1rem;
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

const PrintSection = styled.div`
  margin-bottom: 20px;
  page-break-inside: avoid;
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

const BackgroundControls = styled.div`
  margin-top: 15px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 4px;
`;

const CheckboxContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 15px;
`;

const CustomCheckbox = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
`;

const HiddenCheckbox = styled.input.attrs({ type: 'checkbox' })`
  position: absolute;
  opacity: 0;
  height: 0;
  width: 0;
`;

const StyledCheckbox = styled.div<{ checked: boolean }>`
  width: 20px;
  height: 20px;
  background: ${props => props.checked ? '#3498db' : '#f8f9fa'};
  border: 2px solid ${props => props.checked ? '#3498db' : '#ccc'};
  border-radius: 4px;
  margin-right: 10px;
  transition: all 0.2s;

  &:after {
    content: ${props => props.checked ? '"✓"' : '""'};
    color: white;
    display: block;
    text-align: center;
    line-height: 18px;
  }
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  font-size: 0.9rem;
  color: #34495e;
  cursor: pointer;
  user-select: none;
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

// Компонент Ground
const Ground = ({ groundType }: { groundType: string }) => {
  const { scene } = useThree();

  useEffect(() => {
    const groundGeometry = new THREE.CircleGeometry(100, 32);
    const groundTexture = new THREE.TextureLoader().load(
      groundType === 'grass' 
        ? 'https://threejs.org/examples/textures/terrain/grasslight-big.jpg'
        : 'https://threejs.org/examples/textures/hardwood2_diffuse.jpg'
    );
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

const exportToSTL = (scene: THREE.Scene) => {
  const exporter = new STLExporter();
  const result = exporter.parse(scene);
  const blob = new Blob([result], { type: 'application/octet-stream' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'model.stl';
  link.click();
};

const PrintComponent = React.forwardRef<HTMLDivElement, {
  params: CanopyParams;
  costs: any;
  screenshot: string | null;
}>(({ params, costs, screenshot }, ref) => {
  if (!costs) return <div>Загрузка цен...</div>;
  
  return (
    <PrintContainer ref={ref}>
      <PrintHeader>"Giga-NT" - навесы и металлоконструкции</PrintHeader>
      
      {screenshot ? (
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <img 
            src={screenshot} 
            alt="3D модель" 
            style={{ 
              maxWidth: '100%', 
              height: 'auto',
              border: '1px solid #ddd',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }} 
          />
        </div>
      ) : (
        <div style={{ textAlign: 'center', color: 'gray' }}>Изображение загружается...</div>
      )}

      <PrintSection>
        <h2>Основные параметры</h2>
        <p>Размеры: {params.width.toFixed(1)}м × {params.length.toFixed(1)}м × {(params.height + params.roofHeight).toFixed(1)}м</p>
        <p>Тип кровли: {params.roofType === 'gable' ? 'Двухскатная' : 'Односкатная'}</p>
        <p>Материал кровли: {params.roofMaterial === 'metal' ? 'Металл' : 'Поликарбонат'}</p>
        <p>Количество стоек: {params.pillarCount * 2}</p>
        <p>Количество ферм: {params.trussCount}</p>
      </PrintSection>

      <PrintSection>
        <h2>Расчет стоимости</h2>
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
              <PrintTableCell>{costs.roof?.name || 'Материал кровли'}</PrintTableCell>
              <PrintTableCell>{Math.round(costs.roof?.cost || 0).toLocaleString('ru-RU')} ₽</PrintTableCell>
              <PrintTableCell>-</PrintTableCell>
              <PrintTableCell>{costs.roof?.details || ''}</PrintTableCell>
            </PrintTableRow>
            
            <PrintTableRow>
              <PrintTableCell>{costs.frame?.name || 'Металлоконструкции'}</PrintTableCell>
              <PrintTableCell>{Math.round(costs.frame?.cost || 0).toLocaleString('ru-RU')} ₽</PrintTableCell>
              <PrintTableCell>-</PrintTableCell>
              <PrintTableCell>{costs.frame?.details || ''}</PrintTableCell>
            </PrintTableRow>

            <PrintTableRow>
              <PrintTableCell>{costs.foundation?.name || 'Фундамент'}</PrintTableCell>
              <PrintTableCell>{Math.round(costs.foundation?.cost || 0).toLocaleString('ru-RU')} ₽</PrintTableCell>
              <PrintTableCell>{Math.round(costs.foundation?.work || 0).toLocaleString('ru-RU')} ₽</PrintTableCell>
              <PrintTableCell>
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{costs.foundation?.details || ''}</pre>
              </PrintTableCell>
            </PrintTableRow>

            <PrintTableRow>
              <PrintTableCell>{costs.fasteners?.name || 'Крепеж'}</PrintTableCell>
              <PrintTableCell>{Math.round(costs.fasteners?.cost || 0).toLocaleString('ru-RU')} ₽</PrintTableCell>
              <PrintTableCell>{Math.round(costs.fasteners?.work || 0).toLocaleString('ru-RU')} ₽</PrintTableCell>
              <PrintTableCell>{costs.fasteners?.details || ''}</PrintTableCell>
            </PrintTableRow>

            <PrintTableRow>
              <PrintTableCell>{costs.roofWork?.name || 'Монтаж кровли'}</PrintTableCell>
              <PrintTableCell>-</PrintTableCell>
              <PrintTableCell>{Math.round(costs.roofWork?.cost || 0).toLocaleString('ru-RU')} ₽</PrintTableCell>
              <PrintTableCell>{costs.roofWork?.details || ''}</PrintTableCell>
            </PrintTableRow>

            <PrintTableRow>
              <PrintTableCell>{costs.frameWork?.name || 'Сборка каркаса'}</PrintTableCell>
              <PrintTableCell>-</PrintTableCell>
              <PrintTableCell>{Math.round(costs.frameWork?.cost || 0).toLocaleString('ru-RU')} ₽</PrintTableCell>
              <PrintTableCell>{costs.frameWork?.details || ''}</PrintTableCell>
            </PrintTableRow>

            <PrintTableRow>
              <PrintTableCell>{costs.painting?.name || 'Покраска'}</PrintTableCell>
              <PrintTableCell>-</PrintTableCell>
              <PrintTableCell>{Math.round(costs.painting?.cost || 0).toLocaleString('ru-RU')} ₽</PrintTableCell>
              <PrintTableCell>{costs.painting?.details || ''}</PrintTableCell>
            </PrintTableRow>

            <PrintTotalRow>
              <PrintTableCell colSpan={2}>Итого материалы: {Math.round(
                (costs.roof?.cost || 0) + 
                (costs.frame?.cost || 0) + 
                (costs.foundation?.cost || 0) + 
                (costs.fasteners?.cost || 0)
              ).toLocaleString('ru-RU')} ₽</PrintTableCell>
              <PrintTableCell colSpan={2}>Итого работы: {Math.round(
                (costs.foundation?.work || 0) + 
                (costs.fasteners?.work || 0) + 
                (costs.roofWork?.cost || 0) + 
                (costs.frameWork?.cost || 0) + 
                (costs.painting?.cost || 0)
              ).toLocaleString('ru-RU')} ₽</PrintTableCell>
            </PrintTotalRow>
            <PrintTotalRow>
              <PrintTableCell colSpan={4}>Общая стоимость: {Math.round(costs.totalAmount || 0).toLocaleString('ru-RU')} ₽</PrintTableCell>
            </PrintTotalRow>
          </tbody>
        </PrintTable>
      </PrintSection>
    </PrintContainer>
  );
});

Modal.setAppElement('#root');

const FrameModel: React.FC = () => {
  const isMounted = useRef(false);
  const isMobile = useIsMobile();
  const { currentUser, saveProject, logout } = useAuth();
  const navigate = useNavigate();
  const sceneRef = useRef<THREE.Scene>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const projectId = searchParams.get('project');
  
  const { getUserProjects } = useAuth();

  useEffect(() => {
    const loadProject = async () => {
      if (projectId && currentUser) {
        try {
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
  }, [projectId, currentUser, getUserProjects]);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
    }
    return () => {
      isMounted.current = false;
    };
  }, []);

  const [params, setParams] = useState<CanopyParams>({
    length: 6,
    width: 4,
    height: 3,
    roofHeight: 1,
    overhang: 0.3,
    pillarCount: 2,
    trussCount: 2,
    roofType: 'gable',
    trussType: 'simple',
    constructionType: 'truss',
    beamSize: 'medium',
    lathingStep: 0.5,
    showFoundations: true,
    materialType: 'metal',
    frameColor: '#4682B4',
    foundationColor: '#aaaaaa',
    roofMaterial: 'polycarbonate',
    roofColor: null,
    pillarTubeSize: '100x100',
    roofTubeSize: '80x80',
    trussTubeSize: '60x60',
    lathingTubeSize: '40x20',
    groundType: 'grass',
    showRidgeBeam: true,
    foundationType: 'pillars',
    slabThickness: 200,
    rebarRows: 2,
    showPaving: false,
    pavingColor: 'gray',
    slabExtension: 0.3,
    rebarDiameter: 12,
    rebarSpacing: 200,
    showBackgroundHouse: false,
    showBackgroundGarage: false,
    showFence: true,
    showWindowDetails: true,
    showScrews: false,
    screwColor: '#888888',
    metalColor: '#4682B4',
    hasInsulation: false,
    doubleRebar: false,
    showMaterialInfo: true
  });

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const [showOrientationAlert, setShowOrientationAlert] = useState(false);
  const [isCostModalOpen, setIsCostModalOpen] = useState(false);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [isTakingScreenshot, setIsTakingScreenshot] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  
  // Загрузка цен из priceService
  const [costs, setCosts] = useState<any>(null);

  useEffect(() => {
    const loadCost = async () => {
      try {
        const projectParams = {
          width: params.width,
          length: params.length,
          height: params.height,
          roofHeight: params.roofHeight,
          overhang: params.overhang,
          pillarCount: params.pillarCount,
          trussCount: params.trussCount,
          roofType: params.roofType === 'gable' ? 'gable' : 'single',
          roofMaterial: params.roofMaterial,
        };
        const result = await calculateCanopyCost(projectParams as any);
        setCosts(result);
      } catch (error) {
        console.error('Error loading costs:', error);
      }
    };
    loadCost();
  }, [params]);

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

  const handleExport = (format: string) => {
    if (!sceneRef.current) return;
    
    switch (format) {
      case 'stl':
        exportToSTL(sceneRef.current);
        break;
      default:
        alert('Формат не поддерживается');
    }
  };

  const handlePrint = async () => {
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
            <title>Проект навеса</title>
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
      if (!costs) {
        alert('Цены ещё не загружены, попробуйте ещё раз');
        return;
      }

      const projectData = {
        ...params,
        costCalculation: {
          materials: {
            roof: costs.roof?.cost || 0,
            frame: costs.frame?.cost || 0,
            foundation: costs.foundation?.cost || 0,
            fasteners: costs.fasteners?.cost || 0
          },
          works: {
            foundation: costs.foundation?.work || 0,
            roofInstallation: costs.roofWork?.cost || 0,
            frameAssembly: costs.frameWork?.cost || 0,
            painting: costs.painting?.cost || 0
          },
          totalMaterials: (costs.roof?.cost || 0) + (costs.frame?.cost || 0) + 
                         (costs.foundation?.cost || 0) + (costs.fasteners?.cost || 0),
          totalWorks: (costs.foundation?.work || 0) + (costs.roofWork?.cost || 0) + 
                     (costs.frameWork?.cost || 0) + (costs.painting?.cost || 0),
          totalAmount: costs.totalAmount || 0
        },
        totalAmount: costs.totalAmount || 0
      };

      await saveProject(projectName, projectData, 'canopy');
      setProjectName('');
      setSaveModalOpen(false);
      alert('Проект успешно сохранен в вашем аккаунте!');
    } catch (error) {
      console.error('Ошибка при сохранении проекта:', error);
      alert('Не удалось сохранить проект. Попробуйте снова.');
    }
  };

  const handleParamChange = (name: keyof CanopyParams, value: any) => {
    setParams(prev => ({ ...prev, [name]: value }));
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
          placeholder="Например: Навес для двоих авто"
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

  return (
    <>
      {/* Orientation Alert - блокировка портретного режима */}
      {showOrientationAlert && (
        <div className="frame-orientation-alert">
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
      {/* Burger Button - слева (только в ландшафте и без alert) */}
      {!showOrientationAlert && (
        <button
          className="frame-burger-btn"
          onClick={() => setIsMenuOpen(true)}
          aria-label="Открыть меню"
        >
          ☰
        </button>
      )}

      {/* Actions Button - справа (только в ландшафте и без alert) */}
      {!showOrientationAlert && (
        <button
          className="frame-actions-btn"
          onClick={() => setIsActionsOpen(true)}
          aria-label="Действия"
        >
          ⋮
        </button>
      )}

      {/* Overlay */}
      <div
        className={`frame-overlay ${isMenuOpen || isActionsOpen ? 'active' : ''}`}
        onClick={() => {
          setIsMenuOpen(false);
          setIsActionsOpen(false);
        }}
      />

      {/* Side Panel - слева с контролами */}
      <div className={`frame-side-panel ${isMenuOpen ? 'active' : ''}`}>
        <div className="frame-panel-header">
          <h3 className="frame-panel-title">🏗️ Конструктор навеса</h3>
          <button
            className="frame-panel-close"
            onClick={() => setIsMenuOpen(false)}
            aria-label="Закрыть меню"
          >
            ✕
          </button>
        </div>
        <div className="frame-panel-content">
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ margin: '0 0 15px', fontSize: '16px', color: '#2c3e50' }}>Основные параметры</h4>
            <MainControls params={params} onChange={handleParamChange} />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ margin: '0 0 15px', fontSize: '16px', color: '#2c3e50' }}>Конструкция</h4>
            <ConstructionControls params={params} onChange={handleParamChange} />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ margin: '0 0 15px', fontSize: '16px', color: '#2c3e50' }}>Размеры труб</h4>
            <TubeControls params={params} onChange={handleParamChange} />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ margin: '0 0 15px', fontSize: '16px', color: '#2c3e50' }}>Внешний вид</h4>
            <AppearanceControls params={params} onChange={handleParamChange} />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ margin: '0 0 15px', fontSize: '16px', color: '#2c3e50' }}>Фундамент</h4>
            <FoundationControls params={params} onChange={handleParamChange} />
          </div>
        </div>
      </div>

      {/* Actions Panel - справа */}
      <div className={`frame-actions-panel ${isActionsOpen ? 'active' : ''}`}>
        <div className="frame-panel-header">
          <h3 className="frame-panel-title">Действия</h3>
          <button
            className="frame-panel-close"
            onClick={() => setIsActionsOpen(false)}
            aria-label="Закрыть"
          >
            ✕
          </button>
        </div>
        <div className="frame-panel-content">
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
                boxShadow: '0 4px 12px rgba(52, 152, 219, 0.3)',
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
                boxShadow: '0 4px 12px rgba(46, 204, 113, 0.3)',
              }}
            >
              💾 Сохранить проект
            </button>

            <button
              onClick={handlePrint}
              style={{
                padding: '14px 18px',
                backgroundColor: '#9b59b6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '15px',
                fontWeight: '600',
                boxShadow: '0 4px 12px rgba(155, 89, 182, 0.3)',
              }}
            >
              🖨️ Печать / PDF
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

      {/* Original Controls Panel - только для десктопа */}
      <ControlsPanel $isMobile={isMobile} className="frame-controls-desktop">
        <Title>Конструктор навеса</Title>
        
        <ControlSection>
          <SectionTitle>Основные параметры</SectionTitle>
          <MainControls params={params} onChange={handleParamChange} />
        </ControlSection>

        <ControlSection>
          <SectionTitle>Конструкция</SectionTitle>
          <ConstructionControls params={params} onChange={handleParamChange} />
        </ControlSection>

        <ControlSection>
          <SectionTitle>Размеры труб</SectionTitle>
          <TubeControls params={params} onChange={handleParamChange} />
        </ControlSection>

        <ControlSection>
          <SectionTitle>Внешний вид</SectionTitle>
          <AppearanceControls params={params} onChange={handleParamChange} />
        </ControlSection>

		<ControlSection>
		  <SectionTitle>Фундамент</SectionTitle>
		  <FoundationControls params={params} onChange={handleParamChange} />
		  <CheckboxContainer>
			<CustomCheckbox onClick={() => handleParamChange('showMaterialInfo', !params.showMaterialInfo)}>
			  <HiddenCheckbox 
				checked={params.showMaterialInfo}
				onChange={(e) => handleParamChange('showMaterialInfo', e.target.checked)}
			  />
			  <StyledCheckbox checked={params.showMaterialInfo || false} />
			  <CheckboxLabel>Показывать параметры плиты</CheckboxLabel>
			</CustomCheckbox>
		  </CheckboxContainer>
		</ControlSection>
		
        <ControlSection>
          <SectionTitle>Фон и окружение</SectionTitle>
          <BackgroundControls>
            <CheckboxContainer>
              <CustomCheckbox onClick={() => handleParamChange('showBackgroundHouse', !params.showBackgroundHouse)}>
                <HiddenCheckbox 
                  checked={params.showBackgroundHouse}
                  onChange={(e) => handleParamChange('showBackgroundHouse', e.target.checked)}
                />
                <StyledCheckbox checked={params.showBackgroundHouse} />
                <CheckboxLabel>Показать дом на фоне</CheckboxLabel>
              </CustomCheckbox>

              <CustomCheckbox onClick={() => handleParamChange('showBackgroundGarage', !params.showBackgroundGarage)}>
                <HiddenCheckbox 
                  checked={params.showBackgroundGarage}
                  onChange={(e) => handleParamChange('showBackgroundGarage', e.target.checked)}
                />
                <StyledCheckbox checked={params.showBackgroundGarage} />
                <CheckboxLabel>Показать гараж</CheckboxLabel>
              </CustomCheckbox>

              {params.showBackgroundHouse && (
                <>
                  <CustomCheckbox onClick={() => handleParamChange('showFence', !params.showFence)}>
                    <HiddenCheckbox 
                      checked={params.showFence}
                      onChange={(e) => handleParamChange('showFence', e.target.checked)}
                    />
                    <StyledCheckbox checked={params.showFence} />
                    <CheckboxLabel>Показать забор</CheckboxLabel>
                  </CustomCheckbox>
                  
                  <CustomCheckbox onClick={() => handleParamChange('showWindowDetails', !params.showWindowDetails)}>
                    <HiddenCheckbox 
                      checked={params.showWindowDetails}
                      onChange={(e) => handleParamChange('showWindowDetails', e.target.checked)}
                    />
                    <StyledCheckbox checked={params.showWindowDetails} />
                    <CheckboxLabel>Детали окон</CheckboxLabel>
                  </CustomCheckbox>
                </>
              )}
            </CheckboxContainer>
          </BackgroundControls>
        </ControlSection>
      </ControlsPanel>
      
      <ModelView $isMobile={isMobile}>
        <ErrorBoundary>
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
              fov: isMobile ? 60 : 50
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
            <pointLight position={[params.width * 2, params.height * 3, params.length * 2]} intensity={1} />
            
            <Pillars params={params} />
			<LongitudinalBeams params={params} />
            <Foundations params={params} />

			{/* Рендеринг ферм */}
			{params.roofType === 'arch' && params.trussType === 'arched_narrow' ? (
			  (() => {
				const trussPositions: number[] = [];
				const step = params.length / (params.trussCount - 1);
				for (let i = 0; i < params.trussCount; i++) {
				  trussPositions.push(-params.length / 2 + (i * step));
				}
				
				return trussPositions.map((zPos, index) => (
				  <ArchedTruss
					key={`arch-truss-${index}`}
					params={params}
					positionZ={zPos}
					isLast={index === trussPositions.length - 1}
					nextPositionZ={trussPositions[index + 1]}
					allPositions={trussPositions}
					trussIndex={index}
				  />
				));
			  })()
			) : (
			  <Trusses params={params} />
			)}

            <Lathing params={params} />
            <RoofCover params={params} />
            
            <OrbitControls 
              minDistance={Math.max(params.width, params.length) * 0.8}
              maxDistance={Math.max(params.width, params.length) * 3}
              enablePan={!isMobile}
            />
          </Canvas>
        </ErrorBoundary>
      </ModelView>

      <SaveProjectModal />

      <Modal
        isOpen={isCostModalOpen}
        onRequestClose={() => setIsCostModalOpen(false)}
        contentLabel="Детали расчета стоимости"
        style={{
          overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          },
          content: {
            position: 'relative',
            inset: 'auto',
            maxHeight: '90vh',
            width: '90%',
            maxWidth: '800px',
            overflow: 'auto',
            borderRadius: '8px',
            padding: '0',
            border: 'none'
          }
        }}
      >
        <div ref={printRef}>
          <PrintComponent 
            params={params} 
            costs={costs} 
            screenshot={screenshot}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', padding: '20px' }}>
          <button 
            onClick={handlePrint}
            style={{
              padding: '10px 20px',
              backgroundColor: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Печать
          </button>
          <button 
            onClick={() => setIsCostModalOpen(false)}
            style={{
              padding: '10px 20px',
              backgroundColor: '#e74c3c',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Закрыть
		  </button>
		</div>
      </Modal>
    </Container>
	</>
  );
};

export default React.memo(FrameModel);