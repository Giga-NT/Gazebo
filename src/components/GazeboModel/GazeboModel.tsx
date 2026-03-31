import React, { useState, useRef, useEffect, forwardRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Sky } from '@react-three/drei';
import * as THREE from 'three';
import styled from 'styled-components';
import Modal from 'react-modal';
import ErrorBoundary from '../ErrorBoundary';
import { useAuth } from '../../hooks/useAuth';
import GazeboControls from '../Controls/GazeboControls';
import GableRoof from '../Gazebo/GableRoof';
import ArchedRoof from '../Gazebo/ArchedRoof';
import SingleSlopeRoof from '../Gazebo/SingleSlopeRoof';
import GazeboWalls from '../Gazebo/GazeboWalls';
import GazeboFoundation from '../Gazebo/GazeboFoundation';
import GazeboFurniture from '../Gazebo/GazeboFurniture';
import { GazeboParams, initialGazeboParams } from '../../types/gazeboTypes';
import GazeboPillars from '../Gazebo/GazeboPillars';
import GazeboTrusses from '../Gazebo/GazeboTrusses';
import GazeboLathing from '../Gazebo/GazeboLathing';
import GazeboRoofCover from '../Gazebo/GazeboRoofCover';
import GazeboGables from '../Gazebo/GazeboGables';
import { calculateGazeboCost, defaultPrices } from '../../utils/gazeboCostCalculation';
import { getGazeboPrices } from '../../services/priceService';

// ===== СТИЛИ ДЛЯ МОБИЛЬНОГО МЕНЮ С АККОРДЕОНОМ =====
const MobileMenuButton = styled.button<{ $isOpen: boolean }>`
  position: fixed;
  bottom: 20px;
  left: 20px;
  z-index: 1001;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: ${props => props.$isOpen ? '#fff' : 'linear-gradient(135deg, #00a896 0%, #008f7f 100%)'};
  border: none;
  box-shadow: 0 4px 20px rgba(0, 168, 150, 0.4);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 6px;
  transition: all 0.3s ease;
  
  &:active {
    transform: scale(0.95);
  }
  
  @media (min-width: 768px) {
    display: none;
  }
`;

const MenuLine = styled.div<{ $isOpen: boolean; $index: number }>`
  width: 24px;
  height: 2px;
  background: ${props => props.$isOpen ? '#333' : 'white'};
  border-radius: 2px;
  transition: all 0.3s ease;
  transform: ${props => {
    if (!props.$isOpen) return 'none';
    if (props.$index === 0) return 'rotate(45deg) translate(5px, 6px)';
    if (props.$index === 1) return 'none';
    if (props.$index === 2) return 'rotate(-45deg) translate(5px, -6px)';
    return 'none';
  }};
  opacity: ${props => props.$isOpen && props.$index === 1 ? 0 : 1};
`;

const MobileOverlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  opacity: ${props => props.$isOpen ? 1 : 0};
  visibility: ${props => props.$isOpen ? 'visible' : 'hidden'};
  transition: all 0.3s ease;
  backdrop-filter: blur(4px);
  
  @media (min-width: 768px) {
    display: none;
  }
`;

const MobileMenuPanel = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 85%;
  max-width: 380px;
  background: #f5f7fa;
  z-index: 1000;
  transform: ${props => props.$isOpen ? 'translateX(0)' : 'translateX(-100%)'};
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 4px 0 20px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  
  @media (min-width: 768px) {
    display: none;
  }
`;

const MobileMenuHeader = styled.div`
  padding: 20px 20px;
  background: linear-gradient(135deg, #00a896 0%, #008f7f 100%);
  color: white;
  position: relative;
  
  h2 {
    margin: 0;
    font-size: 1.4rem;
    font-weight: 700;
  }
  
  p {
    margin: 8px 0 0;
    font-size: 0.8rem;
    opacity: 0.9;
  }
`;

const MobileCloseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease;
  
  &:active {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const MobileMenuContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  
  &::-webkit-scrollbar {
    width: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: #e2e8f0;
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #00a896;
    border-radius: 4px;
  }
`;

// ===== СТИЛИ ДЛЯ АККОРДЕОНА =====
const AccordionSection = styled.div`
  border-bottom: 1px solid #e2e8f0;
  background: white;
  border-radius: 12px;
  margin-bottom: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
`;

const AccordionHeader = styled.div<{ $isOpen: boolean }>`
  padding: 14px 16px;
  background: ${props => props.$isOpen ? '#f8fafc' : 'white'};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.3s ease;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  
  &:active {
    background: #f1f5f9;
    transform: scale(0.99);
  }
`;

const AccordionTitle = styled.h4`
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const AccordionIcon = styled.span<{ $isOpen: boolean }>`
  font-size: 16px;
  transform: rotate(${props => props.$isOpen ? '180deg' : '0deg'});
  transition: transform 0.3s ease;
  color: #64748b;
`;

const AccordionContent = styled.div<{ $isOpen: boolean }>`
  max-height: ${props => props.$isOpen ? '2000px' : '0'};
  overflow: hidden;
  transition: max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1);
`;

const AccordionInner = styled.div`
  padding: 16px;
  background: white;
  border-top: 1px solid #eef2f6;
`;

// ===== КОМПОНЕНТ АККОРДЕОНА =====
interface AccordionItemProps {
  title: string;
  icon?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

const AccordionItem: React.FC<AccordionItemProps> = ({ 
  title, 
  icon = '📐', 
  defaultOpen = false,
  children 
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <AccordionSection>
      <AccordionHeader $isOpen={isOpen} onClick={() => setIsOpen(!isOpen)}>
        <AccordionTitle>
          <span>{icon}</span> {title}
        </AccordionTitle>
        <AccordionIcon $isOpen={isOpen}>▼</AccordionIcon>
      </AccordionHeader>
      <AccordionContent $isOpen={isOpen}>
        <AccordionInner>
          {children}
        </AccordionInner>
      </AccordionContent>
    </AccordionSection>
  );
};

// ===== ОСТАЛЬНЫЕ СТИЛИ =====
const Container = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  font-family: 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
`;

const ControlsPanel = styled.div`
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: 380px;
  padding: 20px;
  background: #ffffff;
  overflow-y: auto;
  z-index: 10;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  
  @media (max-width: 767px) {
    display: none;
  }
`;

const ModelView = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  background: #f0f2f5;
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
    window.addEventListener('orientationchange', checkMobile);
    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('orientationchange', checkMobile);
    };
  }, []);

  return isMobile;
};

// Компонент Ground
const Ground = ({ groundType }: { groundType: 'grass' | 'wood' | 'concrete' }) => {
  const { scene } = useThree();

  useEffect(() => {
    const groundGeometry = new THREE.CircleGeometry(100, 32);
    let groundTexture: THREE.Texture;

    const textureLoader = new THREE.TextureLoader();
    if (groundType === 'grass') {
      groundTexture = textureLoader.load('https://threejs.org/examples/textures/terrain/grasslight-big.jpg');
    } else if (groundType === 'wood') {
      groundTexture = textureLoader.load('https://threejs.org/examples/textures/hardwood2_diffuse.jpg');
    } else {
      groundTexture = textureLoader.load('https://threejs.org/examples/textures/brick_diffuse.jpg');
    }

    groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
    groundTexture.repeat.set(10, 10);

    const groundMaterial = new THREE.MeshStandardMaterial({
      map: groundTexture,
      roughness: 1.0,
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

Modal.setAppElement('#root');

// Оборачиваем GazeboControls в компонент с аккордеонами для мобильной версии
const MobileGazeboControls: React.FC<{
  params: GazeboParams;
  onChange: (name: keyof GazeboParams, value: any) => void;
}> = ({ params, onChange }) => {
  return (
    <>
      <AccordionItem title="Основные параметры" icon="📏" defaultOpen={true}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: 500 }}>Длина (м)</label>
            <input
              type="number"
              value={params.length}
              onChange={(e) => onChange('length', parseFloat(e.target.value))}
              min="2" max="10" step="0.1"
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: 500 }}>Ширина (м)</label>
            <input
              type="number"
              value={params.width}
              onChange={(e) => onChange('width', parseFloat(e.target.value))}
              min="2" max="10" step="0.1"
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: 500 }}>Высота (м)</label>
            <input
              type="number"
              value={params.height}
              onChange={(e) => onChange('height', parseFloat(e.target.value))}
              min="1.5" max="4" step="0.1"
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: 500 }}>Тип крыши</label>
            <select
              value={params.roofType}
              onChange={(e) => onChange('roofType', e.target.value as any)}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
            >
              <option value="gable">Двухскатная</option>
              <option value="arched">Арочная</option>
              <option value="single">Односкатная</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: 500 }}>Высота крыши (м)</label>
            <input
              type="number"
              value={params.roofHeight}
              onChange={(e) => onChange('roofHeight', parseFloat(e.target.value))}
              min="0.3" max="3" step="0.1"
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: 500 }}>Свес кровли (м)</label>
            <input
              type="number"
              value={params.overhang}
              onChange={(e) => onChange('overhang', parseFloat(e.target.value))}
              min="0" max="0.5" step="0.05"
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
            />
          </div>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={params.showRoofCover}
                onChange={(e) => onChange('showRoofCover', e.target.checked)}
              />
              <span style={{ fontSize: '0.9rem' }}>Показать поликарбонатное покрытие</span>
            </label>
          </div>
        </div>
      </AccordionItem>

      <AccordionItem title="Конструкция" icon="🔧" defaultOpen={false}>
        <GazeboControls params={params} onChange={onChange} />
      </AccordionItem>

      <AccordionItem title="Внешний вид" icon="🎨" defaultOpen={false}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: 500 }}>Основной материал</label>
            <select
              value={params.materialType}
              onChange={(e) => onChange('materialType', e.target.value as any)}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
            >
              <option value="wood">Дерево</option>
              <option value="metal">Металл</option>
              <option value="combined">Комбинированный</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: 500 }}>Цвет конструкции</label>
            <input
              type="color"
              value={params.color}
              onChange={(e) => onChange('color', e.target.value)}
              style={{ width: '100%', height: '40px', borderRadius: '6px', border: '1px solid #ccc' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: 500 }}>Цвет крыши</label>
            <input
              type="color"
              value={params.roofColor}
              onChange={(e) => onChange('roofColor', e.target.value)}
              style={{ width: '100%', height: '40px', borderRadius: '6px', border: '1px solid #ccc' }}
            />
          </div>
        </div>
      </AccordionItem>

      <AccordionItem title="Фундамент и пол" icon="🏗️" defaultOpen={false}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: 500 }}>Тип фундамента</label>
            <select
              value={params.foundationType}
              onChange={(e) => onChange('foundationType', e.target.value as any)}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
            >
              <option value="wood">Деревянный</option>
              <option value="concrete">Бетонный</option>
              <option value="piles">Свайный</option>
              <option value="none">Без фундамента</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: 500 }}>Покрытие пола</label>
            <select
              value={params.floorType}
              onChange={(e) => onChange('floorType', e.target.value as any)}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
            >
              <option value="wood">Дерево</option>
              <option value="tile">Плитка</option>
              <option value="concrete">Бетон</option>
              <option value="none">Без пола</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: 500 }}>Цвет пола</label>
            <input
              type="color"
              value={params.floorColor}
              onChange={(e) => onChange('floorColor', e.target.value)}
              style={{ width: '100%', height: '40px', borderRadius: '6px', border: '1px solid #ccc' }}
            />
          </div>
        </div>
      </AccordionItem>

      <AccordionItem title="Мебель" icon="🪑" defaultOpen={false}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={params.hasFurniture}
                onChange={(e) => onChange('hasFurniture', e.target.checked)}
              />
              <span style={{ fontSize: '0.9rem' }}>Добавить мебель</span>
            </label>
          </div>
          {params.hasFurniture && (
            <>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: 500 }}>Количество скамеек</label>
                <input
                  type="number"
                  value={params.benchCount}
                  onChange={(e) => onChange('benchCount', parseInt(e.target.value))}
                  min="1" max="8" step="1"
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: 500 }}>Размер стола</label>
                <select
                  value={params.tableSize}
                  onChange={(e) => onChange('tableSize', e.target.value as any)}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
                >
                  <option value="small">Маленький</option>
                  <option value="medium">Средний</option>
                  <option value="large">Большой</option>
                </select>
              </div>
            </>
          )}
        </div>
      </AccordionItem>
    </>
  );
};

const GazeboModel: React.FC = () => {
  const isMounted = useRef(false);
  const isMobile = useIsMobile();
  const { currentUser, saveProject, logout, getUserProjects } = useAuth();
  const navigate = useNavigate();
  const sceneRef = useRef<THREE.Scene>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const location = useLocation();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const searchParams = new URLSearchParams(location.search);
  const projectId = searchParams.get('project');

  const [params, setParams] = useState<GazeboParams>(initialGazeboParams);
  const [prices, setPrices] = useState(defaultPrices);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [isCostModalOpen, setIsCostModalOpen] = useState(false);
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [isTakingScreenshot, setIsTakingScreenshot] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  // Блокируем скролл при открытом мобильном меню
  useEffect(() => {
    if (isMobile && isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobile, isMobileMenuOpen]);

  // Загрузка цен при монтировании
  useEffect(() => {
    const loadPrices = async () => {
      const savedPrices = await getGazeboPrices();
      setPrices(savedPrices);
    };
    loadPrices();
  }, []);

  const costData = calculateGazeboCost(params, prices);

  // Загрузка проекта из БД
  useEffect(() => {
    const loadProject = async () => {
      if (projectId && currentUser) {
        try {
          const projects = await getUserProjects();
          const project = projects.find(p => p.id === projectId);
          if (project) setParams(project.params);
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

  const handleParamChange = (name: keyof GazeboParams, value: any) => {
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
      await saveProject(projectName, params, 'gazebo');
      setProjectName('');
      setSaveModalOpen(false);
      alert('Проект успешно сохранен в вашем аккаунте!');
    } catch (error) {
      console.error('Ошибка при сохранении проекта:', error);
      alert('Не удалось сохранить проект. Попробуйте снова.');
    }
  };

  const handlePrint = async () => {
    setIsTakingScreenshot(true);
    try {
      await new Promise(resolve => requestAnimationFrame(resolve));
      const canvas = canvasRef.current;
      if (!canvas) return;

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
            <title>Проект беседки</title>
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
              setTimeout(() => { window.print(); window.close(); }, 500);
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
          placeholder="Например: Деревянная беседка 3x3"
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
            fontSize: '15px'
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
            opacity: !projectName.trim() ? 0.6 : 1
          }}
        >
          Сохранить
        </button>
      </div>
    </Modal>
  );

  const PrintComponent = forwardRef<HTMLDivElement>((_, ref) => (
    <PrintContainer ref={ref}>
      <PrintHeader>Детальный расчет стоимости беседки</PrintHeader>
      {screenshot && (
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <img
            src={screenshot}
            alt="3D модель беседки"
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
        <p>Тип крыши: {
          params.roofType === 'gable' ? 'Двухскатная' :
          params.roofType === 'arched' ? 'Арочная' : 'Односкатная'
        }</p>
        <p>Материал: {
          params.materialType === 'wood' ? 'Дерево' :
          params.materialType === 'metal' ? 'Металл' : 'Комбинированный'
        }</p>
        <p>Фундамент: {
          params.foundationType === 'wood' ? 'Деревянный' :
          params.foundationType === 'concrete' ? 'Бетонный' : 'Свайный'
        }</p>
        <p>Пол: {
          params.floorType === 'wood' ? 'Деревянный' :
          params.floorType === 'tile' ? 'Плитка' : 'Бетонный'
        }</p>
        <p>Мебель: {params.benchCount} скамеек, стол {params.tableSize}</p>
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
            <PrintTableCell>{costData.frame.name}</PrintTableCell>
            <PrintTableCell>{Math.round(costData.frame.cost).toLocaleString('ru-RU')} ₽</PrintTableCell>
            <PrintTableCell>-</PrintTableCell>
            <PrintTableCell>{costData.frame.details}</PrintTableCell>
          </PrintTableRow>
          <PrintTableRow>
            <PrintTableCell>{costData.roof.name}</PrintTableCell>
            <PrintTableCell>{Math.round(costData.roof.cost).toLocaleString('ru-RU')} ₽</PrintTableCell>
            <PrintTableCell>-</PrintTableCell>
            <PrintTableCell>{costData.roof.details}</PrintTableCell>
          </PrintTableRow>
          <PrintTableRow>
            <PrintTableCell>{costData.foundation.name}</PrintTableCell>
            <PrintTableCell>{Math.round(costData.foundation.cost).toLocaleString('ru-RU')} ₽</PrintTableCell>
            <PrintTableCell>{Math.round(costData.foundation.work).toLocaleString('ru-RU')} ₽</PrintTableCell>
            <PrintTableCell>{costData.foundation.details}</PrintTableCell>
          </PrintTableRow>
          <PrintTableRow>
            <PrintTableCell>{costData.floor.name}</PrintTableCell>
            <PrintTableCell>{Math.round(costData.floor.cost).toLocaleString('ru-RU')} ₽</PrintTableCell>
            <PrintTableCell>{Math.round(costData.floor.work).toLocaleString('ru-RU')} ₽</PrintTableCell>
            <PrintTableCell>{costData.floor.details}</PrintTableCell>
          </PrintTableRow>
          {params.hasFurniture && (
            <PrintTableRow>
              <PrintTableCell>{costData.furniture.name}</PrintTableCell>
              <PrintTableCell>{Math.round(costData.furniture.cost).toLocaleString('ru-RU')} ₽</PrintTableCell>
              <PrintTableCell>{Math.round(costData.furniture.work).toLocaleString('ru-RU')} ₽</PrintTableCell>
              <PrintTableCell>
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{costData.furniture.details}</pre>
              </PrintTableCell>
            </PrintTableRow>
          )}
          <PrintTotalRow>
            <PrintTableCell colSpan={2}>
              Итого материалы: {Math.round(
                costData.frame.cost +
                costData.roof.cost +
                costData.foundation.cost +
                costData.floor.cost +
                (params.hasFurniture ? costData.furniture.cost : 0)
              ).toLocaleString('ru-RU')} ₽
            </PrintTableCell>
            <PrintTableCell colSpan={2}>
              Итого работы: {Math.round(
                costData.foundation.work +
                costData.floor.work +
                (params.hasFurniture ? costData.furniture.work : 0)
              ).toLocaleString('ru-RU')} ₽
            </PrintTableCell>
          </PrintTotalRow>
          <PrintTotalRow>
            <PrintTableCell colSpan={4}>
              Общая стоимость: {Math.round(costData.totalCost).toLocaleString('ru-RU')} ₽
            </PrintTableCell>
          </PrintTotalRow>
        </tbody>
      </PrintTable>
    </PrintContainer>
  ));

  // Расчёт позиции камеры
  const getCameraPosition = (): [number, number, number] => {
    if (!isMobile) {
      return [
        params.width * 1.5,
        params.height * 1.2,
        params.length * 1.5
      ];
    }
    const maxDim = Math.max(params.width, params.length);
    return [
      maxDim * 1.8,
      params.height * 1.5,
      maxDim * 1.8
    ];
  };

  return (
    <Container>
      {/* Десктопная панель управления */}
      <ControlsPanel>
        <GazeboControls params={params} onChange={handleParamChange} />
      </ControlsPanel>

      {/* Мобильное меню с аккордеоном */}
      {isMobile && (
        <>
          <MobileMenuButton $isOpen={isMobileMenuOpen} onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            <MenuLine $isOpen={isMobileMenuOpen} $index={0} />
            <MenuLine $isOpen={isMobileMenuOpen} $index={1} />
            <MenuLine $isOpen={isMobileMenuOpen} $index={2} />
          </MobileMenuButton>
          
          <MobileOverlay $isOpen={isMobileMenuOpen} onClick={() => setIsMobileMenuOpen(false)} />
          
          <MobileMenuPanel $isOpen={isMobileMenuOpen}>
            <MobileMenuHeader>
              <h2>🏠 Конструктор беседки</h2>
              <p>Настройте размеры, конструкцию и мебель</p>
              <MobileCloseButton onClick={() => setIsMobileMenuOpen(false)}>✕</MobileCloseButton>
            </MobileMenuHeader>
            <MobileMenuContent>
              <MobileGazeboControls params={params} onChange={handleParamChange} />
            </MobileMenuContent>
          </MobileMenuPanel>
        </>
      )}

      {/* 3D сцена */}
      <ModelView>
        <ErrorBoundary>
          <Canvas
            shadows
            ref={canvasRef}
            style={{ 
              width: '100%', 
              height: '100%',
              display: 'block',
              position: 'absolute',
              top: 0,
              left: 0
            }}
            camera={{
              position: getCameraPosition(),
              fov: isMobile ? 55 : 50,
              near: 0.1,
              far: 1000
            }}
            onCreated={({ scene, gl }) => {
              sceneRef.current = scene;
              gl.setSize(window.innerWidth, window.innerHeight);
            }}
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

            <GazeboWalls params={params} />

            {params.roofType === 'gable' && (
              <>
                <GazeboTrusses params={params} />
                <GazeboLathing params={params} />
                {params.showRoofCover && <GazeboRoofCover params={params} offsetY={0.05} />}
                {params.showGables && <GazeboGables params={params} />}
              </>
            )}

            {params.roofType === 'single' && (
              <>
                <GazeboTrusses params={params} />
                <GazeboLathing params={params} />
                {params.showRoofCover && <GazeboRoofCover params={params} />}
                {params.showGables && <GazeboGables params={params} />}
              </>
            )}

            {params.roofType === 'arched' && (
              <>
                <GazeboTrusses params={params} />
                <GazeboLathing params={params} />
                {params.showRoofCover && <GazeboRoofCover params={params} />}
                {params.showGables && <GazeboGables params={params} />}
              </>
            )}
            <GazeboFoundation params={params} />
            {params.hasFurniture && <GazeboFurniture params={params} />}

            <OrbitControls
              minDistance={Math.max(params.width, params.length) * 0.8}
              maxDistance={Math.max(params.width, params.length) * 4}
              enablePan={!isMobile}
              enableZoom={true}
              enableRotate={true}
              target={[0, params.height / 2, 0]}
            />
          </Canvas>
        </ErrorBoundary>

        {/* Кнопки действий */}
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          zIndex: 100
        }}>
          <button
            onClick={() => setIsCostModalOpen(true)}
            style={{
              padding: '12px 18px',
              backgroundColor: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: 500,
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}
          >
            Детальный расчет
          </button>
          <button
            onClick={() => setSaveModalOpen(true)}
            style={{
              padding: '12px 18px',
              backgroundColor: '#2ecc71',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: 500,
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}
          >
            Сохранить проект
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              padding: '12px 18px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: 500,
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}
          >
            В личный кабинет
          </button>
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            style={{
              padding: '12px 18px',
              backgroundColor: '#e74c3c',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: 500,
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}
          >
            Выйти
          </button>
        </div>
      </ModelView>

      <SaveProjectModal />

      <Modal
        isOpen={isCostModalOpen}
        onRequestClose={() => setIsCostModalOpen(false)}
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
            width: '90%',
            maxWidth: '800px',
            maxHeight: '90vh',
            overflow: 'auto',
            borderRadius: '8px',
            padding: '0',
            border: 'none'
          }
        }}
      >
        <div ref={printRef}>
          <PrintComponent />
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
          <button
            onClick={handlePrint}
            style={{
              padding: '10px 20px',
              backgroundColor: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginRight: '10px'
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
  );
};

export default React.memo(GazeboModel);