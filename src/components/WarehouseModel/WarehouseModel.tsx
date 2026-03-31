import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Sky } from '@react-three/drei';
import * as THREE from 'three';
import styled from 'styled-components';
import Modal from 'react-modal';
import WarehouseControls from '../Controls/WarehouseControls';
import './WarehouseModel.css';
import WarehouseColumns from '../Warehouse/WarehouseColumns';
import WarehouseTrusses from '../Warehouse/WarehouseTrusses';
import WarehousePurlins from '../Warehouse/WarehousePurlins';
import WarehouseBracing from '../Warehouse/WarehouseBracing';
import WarehouseGates from '../Warehouse/WarehouseGates';
import WarehouseWalls from '../Warehouse/WarehouseWalls';
import WarehouseRoof from '../Warehouse/WarehouseRoof';
import WarehouseFlashing from '../Warehouse/WarehouseFlashing';
import WarehouseDoorTrim from '../Warehouse/WarehouseDoorTrim';
import WarehouseCornerFlashing from '../Warehouse/WarehouseCornerFlashing';
import { WarehouseParams, initialWarehouseParams } from '../../types/warehouseTypes';
import { calculateWarehouseCost } from '../../utils/warehouseCostCalculation';
import { useAuth } from '../../hooks/useAuth';
import ErrorBoundary from '../ErrorBoundary';

// Стили для модального окна сохранения
const SaveModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
`;

const SaveModalContent = styled.div`
  background: white;
  border-radius: 20px;
  padding: 30px;
  max-width: 450px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  h2 {
    font-size: 24px;
    font-weight: 700;
    color: #1a2639;
    margin: 0 0 8px 0;
  }

  p {
    color: #4a5568;
    margin: 0 0 24px 0;
    font-size: 14px;
  }

  .form-group {
    margin-bottom: 24px;
  }

  label {
    display: block;
    margin-bottom: 8px;
    color: #2d3748;
    font-weight: 600;
    font-size: 14px;
  }

  input {
    width: 100%;
    padding: 14px 16px;
    border: 2px solid #e2e8f0;
    border-radius: 12px;
    font-size: 16px;
    transition: all 0.3s ease;
    background: #f8fafc;

    &:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
    }

    &::placeholder {
      color: #a0aec0;
    }
  }

  .modal-actions {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
  }

  .cancel-btn {
    padding: 12px 24px;
    background: #edf2f7;
    color: #4a5568;
    border: none;
    border-radius: 12px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background: #e2e8f0;
      transform: translateY(-2px);
    }
  }

  .save-btn {
    padding: 12px 24px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 12px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);

    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
`;

// Устанавливаем корневой элемент для модального окна
Modal.setAppElement('#root');

// Стилизованные компоненты
const Container = styled.div<{ $isMobile: boolean }>`
  display: flex;
  height: 100vh;
  width: 100vw;
  flex-direction: ${({ $isMobile }) => ($isMobile ? 'column' : 'row')};
  overflow: hidden;
`;

const ControlsPanel = styled.div<{ $isMobile: boolean }>`
  width: ${({ $isMobile }) => ($isMobile ? '100%' : '380px')};
  padding: 20px;
  background: #ffffff;
  overflow-y: auto;
  flex-shrink: 0;
  box-shadow: 2px 0 10px rgba(0,0,0,0.1);
  z-index: 10;
`;

const ModelView = styled.div<{ $isMobile: boolean }>`
  flex: 1;
  position: relative;
  height: 100vh;
  background: #0a1030;
`;

const PrintContainer = styled.div`
  padding: 20px;
  background: white;
  color: black;
  font-family: 'Arial', sans-serif;
`;

const PrintHeader = styled.h1`
  text-align: center;
  margin-bottom: 30px;
  color: #333;
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
  background-color: #f5f5f5;
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

// Компонент для печати расчета
const PrintComponent = React.forwardRef<HTMLDivElement, {
  params: WarehouseParams;
  costs: any;
  screenshot: string | null;
}>(({ params, costs, screenshot }, ref) => {
  return (
    <PrintContainer ref={ref}>
      <PrintHeader>ООО "Гига-НТ" - Проект склада</PrintHeader>
      
      {screenshot && (
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <img 
            src={screenshot} 
            alt="3D модель склада" 
            style={{ 
              maxWidth: '100%', 
              height: 'auto',
              border: '1px solid #ddd',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }} 
          />
        </div>
      )}

      <PrintSection>
        <h2>Основные параметры</h2>
        <p>Размеры: {params.length.toFixed(1)}м × {params.width.toFixed(1)}м × {params.wallHeight.toFixed(1)}м</p>
        <p>Высота кровли: {params.roofHeight.toFixed(1)}м</p>
        <p>Тип кровли: {
          params.roofType === 'gable' ? 'Двухскатная' : 
          params.roofType === 'single' ? 'Односкатная' : 'Плоская'
        }</p>
        <p>Материал стен: {
          params.wallMaterial === 'profile' ? 'Профнастил' :
          params.wallMaterial === 'sandwich' ? 'Сэндвич-панели' : 'Открытый каркас'
        }</p>
        <p>Материал кровли: {
          params.roofMaterial === 'profile' ? 'Профнастил' : 'Сэндвич-панели'
        }</p>
        <p>Количество колонн: {Math.ceil(params.length / params.columnSpacing) * 2}</p>
        <p>Количество ферм: {params.trussCount}</p>
        {params.gateType !== 'none' && (
          <p>Ворота: {params.gateWidth.toFixed(1)}×{params.gateHeight.toFixed(1)}м, {params.gateCount} шт</p>
        )}
      </PrintSection>

      <PrintSection>
        <h2>Расчет стоимости</h2>
        <PrintTable>
          <thead>
            <tr>
              <PrintTableHeader>Позиция</PrintTableHeader>
              <PrintTableHeader>Стоимость</PrintTableHeader>
            </tr>
          </thead>
          <tbody>
            <PrintTableRow>
              <PrintTableCell>Каркас</PrintTableCell>
              <PrintTableCell>{Math.round(costs.frameCost).toLocaleString('ru-RU')} ₽</PrintTableCell>
            </PrintTableRow>
            <PrintTableRow>
              <PrintTableCell>Кровля</PrintTableCell>
              <PrintTableCell>{Math.round(costs.roofCost).toLocaleString('ru-RU')} ₽</PrintTableCell>
            </PrintTableRow>
            <PrintTableRow>
              <PrintTableCell>Стены</PrintTableCell>
              <PrintTableCell>{Math.round(costs.wallCost).toLocaleString('ru-RU')} ₽</PrintTableCell>
            </PrintTableRow>
            <PrintTableRow>
              <PrintTableCell>Ворота</PrintTableCell>
              <PrintTableCell>{Math.round(costs.gateCost).toLocaleString('ru-RU')} ₽</PrintTableCell>
            </PrintTableRow>
            <PrintTotalRow>
              <PrintTableCell>Итого</PrintTableCell>
              <PrintTableCell>{Math.round(costs.totalCost).toLocaleString('ru-RU')} ₽</PrintTableCell>
            </PrintTotalRow>
          </tbody>
        </PrintTable>
      </PrintSection>
    </PrintContainer>
  );
});

// Компонент Ground (трава)
const Ground = () => {
  const { scene } = useThree();

  useEffect(() => {
    const groundGeometry = new THREE.CircleGeometry(200, 64);
    const groundTexture = new THREE.TextureLoader().load(
      'https://threejs.org/examples/textures/terrain/grasslight-big.jpg'
    );
    groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
    groundTexture.repeat.set(20, 20);
    
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
  }, [scene]);

  return null;
};

// Компонент асфальтовой площадки и внутреннего пола
const AsphaltArea = ({ params }: { params: WarehouseParams }) => {
  const { scene } = useThree();
  const { asphaltWidth = 10, floorType = 'concrete' } = params;

  useEffect(() => {
    // Размеры здания
    const buildingLength = params.length; // по Z
    const buildingWidth = params.width;    // по X
    
    // === ВНУТРЕННИЙ ПОЛ (под зданием) ===
    let floorMaterial;
    
    if (floorType === 'concrete') {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d')!;
      
      ctx.fillStyle = '#a0a0a0';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const gridSize = 64;
      for (let i = 0; i <= canvas.width; i += gridSize) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.strokeStyle = '#808080';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      
      for (let i = 0; i <= canvas.height; i += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.strokeStyle = '#808080';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      
      ctx.fillStyle = '#808080';
      for (let k = 0; k < 200; k++) {
        ctx.fillRect(
          Math.random() * canvas.width, 
          Math.random() * canvas.height, 
          2, 2
        );
      }
      
      const concreteTexture = new THREE.CanvasTexture(canvas);
      concreteTexture.wrapS = concreteTexture.wrapT = THREE.RepeatWrapping;
      concreteTexture.repeat.set(2, 2);
      
      floorMaterial = new THREE.MeshStandardMaterial({ 
        map: concreteTexture,
        roughness: 0.8,
        metalness: 0.1
      });
      
    } else if (floorType === 'paving') {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d')!;
      
      ctx.fillStyle = '#d2b48c';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const cellSize = 64;
      ctx.strokeStyle = '#9c6b3d';
      ctx.lineWidth = 2;
      
      for (let i = 0; i < canvas.width + cellSize; i += cellSize) {
        for (let j = 0; j < canvas.height + cellSize; j += cellSize) {
          const centerX = i;
          const centerY = j;
          
          ctx.beginPath();
          ctx.moveTo(centerX, centerY - cellSize/2);
          ctx.lineTo(centerX + cellSize/2, centerY);
          ctx.lineTo(centerX, centerY + cellSize/2);
          ctx.lineTo(centerX - cellSize/2, centerY);
          ctx.closePath();
          
          if ((i + j) % (cellSize * 2) === 0) {
            ctx.fillStyle = '#c19a6b';
          } else {
            ctx.fillStyle = '#b88a5e';
          }
          
          ctx.fill();
          ctx.stroke();
        }
      }
      
      const pavingTexture = new THREE.CanvasTexture(canvas);
      pavingTexture.wrapS = pavingTexture.wrapT = THREE.RepeatWrapping;
      pavingTexture.repeat.set(2, 2);
      
      floorMaterial = new THREE.MeshStandardMaterial({ 
        map: pavingTexture,
        roughness: 0.7,
        metalness: 0.1
      });
      
    } else {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d')!;
      
      ctx.fillStyle = '#404040';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = '#505050';
      for (let k = 0; k < 500; k++) {
        ctx.fillRect(
          Math.random() * canvas.width, 
          Math.random() * canvas.height, 
          2, 2
        );
      }
      
      ctx.fillStyle = '#606060';
      for (let k = 0; k < 200; k++) {
        ctx.fillRect(
          Math.random() * canvas.width, 
          Math.random() * canvas.height, 
          1, 1
        );
      }
      
      const polishedTexture = new THREE.CanvasTexture(canvas);
      polishedTexture.wrapS = polishedTexture.wrapT = THREE.RepeatWrapping;
      polishedTexture.repeat.set(1, 1);
      
      floorMaterial = new THREE.MeshStandardMaterial({ 
        map: polishedTexture,
        roughness: 0.3,
        metalness: 0.2,
        emissive: '#202020',
        emissiveIntensity: 0.2
      });
    }
    
    const floorGeometry = new THREE.PlaneGeometry(buildingWidth, buildingLength);
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0.02;
    floor.receiveShadow = true;
    floor.position.x = 0;
    floor.position.z = 0;
    scene.add(floor);

    // Внешний асфальт
    const asphaltCanvas = document.createElement('canvas');
    asphaltCanvas.width = 512;
    asphaltCanvas.height = 512;
    const asphaltCtx = asphaltCanvas.getContext('2d')!;
    
    asphaltCtx.fillStyle = '#2a2a2a';
    asphaltCtx.fillRect(0, 0, asphaltCanvas.width, asphaltCanvas.height);
    
    asphaltCtx.fillStyle = '#3a3a3a';
    for (let k = 0; k < 1000; k++) {
      asphaltCtx.fillRect(
        Math.random() * asphaltCanvas.width, 
        Math.random() * asphaltCanvas.height, 
        1, 1
      );
    }
    
    asphaltCtx.fillStyle = '#5a5a5a';
    for (let k = 0; k < 200; k++) {
      asphaltCtx.fillRect(
        Math.random() * asphaltCanvas.width, 
        Math.random() * asphaltCanvas.height, 
        2, 2
      );
    }
    
    const asphaltTexture = new THREE.CanvasTexture(asphaltCanvas);
    asphaltTexture.wrapS = asphaltTexture.wrapT = THREE.RepeatWrapping;
    asphaltTexture.repeat.set(10, 10);
    
    const asphaltMaterial = new THREE.MeshStandardMaterial({ 
      map: asphaltTexture,
      roughness: 0.9,
      metalness: 0.1
    });
    
    // Левая часть
    const leftAsphaltGeometry = new THREE.PlaneGeometry(asphaltWidth, buildingLength);
    const leftAsphalt = new THREE.Mesh(leftAsphaltGeometry, asphaltMaterial);
    leftAsphalt.rotation.x = -Math.PI / 2;
    leftAsphalt.position.set(-buildingWidth/2 - asphaltWidth/2, 0.01, 0);
    leftAsphalt.receiveShadow = true;
    scene.add(leftAsphalt);
    
    // Правая часть
    const rightAsphaltGeometry = new THREE.PlaneGeometry(asphaltWidth, buildingLength);
    const rightAsphalt = new THREE.Mesh(rightAsphaltGeometry, asphaltMaterial);
    rightAsphalt.rotation.x = -Math.PI / 2;
    rightAsphalt.position.set(buildingWidth/2 + asphaltWidth/2, 0.01, 0);
    rightAsphalt.receiveShadow = true;
    scene.add(rightAsphalt);
    
    // Передняя часть
    const frontAsphaltGeometry = new THREE.PlaneGeometry(buildingWidth, asphaltWidth);
    const frontAsphalt = new THREE.Mesh(frontAsphaltGeometry, asphaltMaterial);
    frontAsphalt.rotation.x = -Math.PI / 2;
    frontAsphalt.position.set(0, 0.01, -buildingLength/2 - asphaltWidth/2);
    frontAsphalt.receiveShadow = true;
    scene.add(frontAsphalt);
    
    // Задняя часть
    const backAsphaltGeometry = new THREE.PlaneGeometry(buildingWidth, asphaltWidth);
    const backAsphalt = new THREE.Mesh(backAsphaltGeometry, asphaltMaterial);
    backAsphalt.rotation.x = -Math.PI / 2;
    backAsphalt.position.set(0, 0.01, buildingLength/2 + asphaltWidth/2);
    backAsphalt.receiveShadow = true;
    scene.add(backAsphalt);
    
    // Угловые части
    const cornerGeometry = new THREE.PlaneGeometry(asphaltWidth, asphaltWidth);
    
    const cornerLeftFront = new THREE.Mesh(cornerGeometry, asphaltMaterial);
    cornerLeftFront.rotation.x = -Math.PI / 2;
    cornerLeftFront.position.set(-buildingWidth/2 - asphaltWidth/2, 0.01, -buildingLength/2 - asphaltWidth/2);
    cornerLeftFront.receiveShadow = true;
    scene.add(cornerLeftFront);
    
    const cornerRightFront = new THREE.Mesh(cornerGeometry, asphaltMaterial);
    cornerRightFront.rotation.x = -Math.PI / 2;
    cornerRightFront.position.set(buildingWidth/2 + asphaltWidth/2, 0.01, -buildingLength/2 - asphaltWidth/2);
    cornerRightFront.receiveShadow = true;
    scene.add(cornerRightFront);
    
    const cornerLeftBack = new THREE.Mesh(cornerGeometry, asphaltMaterial);
    cornerLeftBack.rotation.x = -Math.PI / 2;
    cornerLeftBack.position.set(-buildingWidth/2 - asphaltWidth/2, 0.01, buildingLength/2 + asphaltWidth/2);
    cornerLeftBack.receiveShadow = true;
    scene.add(cornerLeftBack);
    
    const cornerRightBack = new THREE.Mesh(cornerGeometry, asphaltMaterial);
    cornerRightBack.rotation.x = -Math.PI / 2;
    cornerRightBack.position.set(buildingWidth/2 + asphaltWidth/2, 0.01, buildingLength/2 + asphaltWidth/2);
    cornerRightBack.receiveShadow = true;
    scene.add(cornerRightBack);

    // Разметка
    const lineMaterial = new THREE.MeshStandardMaterial({ color: '#f0f0f0' });
    
    const leftLineGeometry = new THREE.PlaneGeometry(0.2, buildingLength - 2);
    const leftLine = new THREE.Mesh(leftLineGeometry, lineMaterial);
    leftLine.rotation.x = -Math.PI / 2;
    leftLine.position.set(-buildingWidth/2 - asphaltWidth/2 + 0.3, 0.02, 0);
    scene.add(leftLine);
    
    const rightLineGeometry = new THREE.PlaneGeometry(0.2, buildingLength - 2);
    const rightLine = new THREE.Mesh(rightLineGeometry, lineMaterial);
    rightLine.rotation.x = -Math.PI / 2;
    rightLine.position.set(buildingWidth/2 + asphaltWidth/2 - 0.3, 0.02, 0);
    scene.add(rightLine);
    
    const frontLineGeometry = new THREE.PlaneGeometry(buildingWidth - 2, 0.2);
    const frontLine = new THREE.Mesh(frontLineGeometry, lineMaterial);
    frontLine.rotation.x = -Math.PI / 2;
    frontLine.position.set(0, 0.02, -buildingLength/2 - asphaltWidth/2 + 0.3);
    scene.add(frontLine);
    
    const backLineGeometry = new THREE.PlaneGeometry(buildingWidth - 2, 0.2);
    const backLine = new THREE.Mesh(backLineGeometry, lineMaterial);
    backLine.rotation.x = -Math.PI / 2;
    backLine.position.set(0, 0.02, buildingLength/2 + asphaltWidth/2 - 0.3);
    scene.add(backLine);

    return () => {
      scene.remove(floor);
      scene.remove(leftAsphalt);
      scene.remove(rightAsphalt);
      scene.remove(frontAsphalt);
      scene.remove(backAsphalt);
      scene.remove(cornerLeftFront);
      scene.remove(cornerRightFront);
      scene.remove(cornerLeftBack);
      scene.remove(cornerRightBack);
      scene.remove(leftLine);
      scene.remove(rightLine);
      scene.remove(frontLine);
      scene.remove(backLine);
    };
  }, [scene, params.length, params.width, asphaltWidth, floorType]);

  return null;
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

// Компонент модального окна сохранения
const SaveProjectModal = ({ isOpen, onClose, onSave, projectName, setProjectName }: any) => {
  if (!isOpen) return null;
  
  return (
    <SaveModalOverlay onClick={onClose}>
      <SaveModalContent onClick={(e) => e.stopPropagation()}>
        <h2>💾 Сохранить проект</h2>
        <p>Введите название, чтобы сохранить текущую конфигурацию склада</p>
        
        <div className="form-group">
          <label>Название проекта</label>
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="Например: Склад 12x6 с воротами"
            autoFocus
          />
        </div>

        <div className="modal-actions">
          <button className="cancel-btn" onClick={onClose}>
            Отмена
          </button>
          <button 
            className="save-btn" 
            onClick={onSave}
            disabled={!projectName.trim()}
          >
            Сохранить проект
          </button>
        </div>
      </SaveModalContent>
    </SaveModalOverlay>
  );
};

const WarehouseModel: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  const [params, setParams] = useState<WarehouseParams>({
    ...initialWarehouseParams,
    asphaltWidth: 10
  });
  const [gatesOpen, setGatesOpen] = useState(false);
  const [doorsOpen, setDoorsOpen] = useState(false);
  const [isCostModalOpen, setIsCostModalOpen] = useState(false);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [isTakingScreenshot, setIsTakingScreenshot] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isActionsOpen, setIsActionsOpen] = useState(false);

  const isMobile = useIsMobile();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const handleParamChange = (name: keyof WarehouseParams, value: any) => {
    setParams(prev => ({ ...prev, [name]: value }));
  };

  const costData = calculateWarehouseCost(params);

  const handleSaveProject = () => {
    if (!projectName.trim()) {
      alert('Введите название проекта');
      return;
    }
    alert(`Проект "${projectName}" успешно сохранен!`);
    setSaveModalOpen(false);
    setProjectName('');
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

      const screenshotData = tempCanvas.toDataURL('image/jpeg', 0.9);
      setScreenshot(screenshotData);

      await new Promise(resolve => setTimeout(resolve, 500));

      const printWindow = window.open('', '_blank');
      if (!printWindow) return;

      const printContent = printRef.current?.innerHTML;
      if (!printContent) return;

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Проект склада</title>
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
            </script>
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

  // Расчет позиции камеры на основе размеров здания
  const cameraPosition = [
    params.width * 1.5 + 5,
    params.wallHeight * 1.2,
    params.length * 1.5 + 5
  ];

  return (
    <Container $isMobile={isMobile}>
      {/* Burger Button - слева */}
      <button
        className="warehouse-burger-btn"
        onClick={() => setIsMenuOpen(true)}
        aria-label="Открыть меню"
      >
        ☰
      </button>
      
      {/* Actions Button - справа */}
      <button
        className="warehouse-actions-btn"
        onClick={() => setIsActionsOpen(true)}
        aria-label="Действия"
      >
        ⋮
      </button>

      {/* Overlay */}
      <div
        className={`warehouse-overlay ${isMenuOpen || isActionsOpen ? 'active' : ''}`}
        onClick={() => {
          setIsMenuOpen(false);
          setIsActionsOpen(false);
        }}
      />

      {/* Side Panel - слева */}
      <div className={`warehouse-side-panel ${isMenuOpen ? 'active' : ''}`}>
        <div className="warehouse-panel-header">
          <h3 className="warehouse-panel-title">Настройки склада</h3>
          <button
            className="warehouse-panel-close"
            onClick={() => setIsMenuOpen(false)}
            aria-label="Закрыть меню"
          >
            ✕
          </button>
        </div>
        <div className="warehouse-panel-content">
          <WarehouseControls
            params={params}
            onChange={handleParamChange}
            costData={costData}
            gatesOpen={gatesOpen}
            doorsOpen={doorsOpen}
            onToggleGates={() => setGatesOpen(!gatesOpen)}
            onToggleDoors={() => setDoorsOpen(!doorsOpen)}
          />
        </div>
      </div>
      
      {/* Actions Panel - справа */}
      <div className={`warehouse-actions-panel ${isActionsOpen ? 'active' : ''}`}>
        <div className="warehouse-panel-header">
          <h3 className="warehouse-panel-title">Действия</h3>
          <button
            className="warehouse-panel-close"
            onClick={() => setIsActionsOpen(false)}
            aria-label="Закрыть"
          >
            ✕
          </button>
        </div>
        <div className="warehouse-panel-content">
          {/* Кнопки действий */}
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
              💰 Расчёт стоимости
            </button>
            
            <button
              onClick={handleSaveProject}
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

      {/* Default Controls Panel - для десктопа */}
      <ControlsPanel $isMobile={isMobile} className="warehouse-controls-desktop">
        <WarehouseControls
          params={params}
          onChange={handleParamChange}
          costData={costData}
          gatesOpen={gatesOpen}
          doorsOpen={doorsOpen}
          onToggleGates={() => setGatesOpen(!gatesOpen)}
          onToggleDoors={() => setDoorsOpen(!doorsOpen)}
        />
      </ControlsPanel>

      <ModelView $isMobile={isMobile}>
        <ErrorBoundary>
          <Canvas
            shadows
            ref={canvasRef}
            style={{ width: '100%', height: '100%' }}
            camera={{ 
              position: cameraPosition as [number, number, number], 
              fov: isMobile ? 60 : 50, 
              near: 0.1, 
              far: 1000 
            }}
            onCreated={({ scene }) => { sceneRef.current = scene }}
          >
            <Sky distance={10000} sunPosition={[10, 20, 10]} />
            <Ground />
            <AsphaltArea params={params} />
            
            <ambientLight intensity={1.2} />
            <directionalLight
              position={[10, 20, 10]}
              intensity={1.2}
              castShadow
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
              shadow-camera-left={-30}
              shadow-camera-right={30}
              shadow-camera-top={30}
              shadow-camera-bottom={-30}
            />
            <directionalLight position={[-10, 10, -10]} intensity={0.6} />
            <pointLight 
              position={[params.width * 2, params.wallHeight * 3, params.length * 2]} 
              intensity={1} 
            />
            
            <WarehouseColumns params={params} />
            <WarehouseTrusses params={params} />
            <WarehousePurlins params={params} />
            <WarehouseBracing params={params} />
            <WarehouseGates params={params} gatesOpen={gatesOpen} doorsOpen={doorsOpen} />
            <WarehouseWalls params={params} /> 
            <WarehouseRoof params={params} />
            <WarehouseFlashing params={params} />
            <WarehouseDoorTrim params={params} />
            <WarehouseCornerFlashing params={params} />
            
            <OrbitControls 
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              maxPolarAngle={Math.PI / 2.2}
              minDistance={5}
              maxDistance={100}
              target={[0, params.wallHeight / 2, 0]}
            />
          </Canvas>
        </ErrorBoundary>

        {/* Панель с кнопками действий - скрыта, теперь только в 3 точках */}

        {/* Модальное окно сохранения проекта */}
        <SaveProjectModal 
          isOpen={saveModalOpen}
          onClose={() => setSaveModalOpen(false)}
          onSave={handleSaveProject}
          projectName={projectName}
          setProjectName={setProjectName}
        />
      </ModelView>

      {/* Модальное окно детального расчета */}
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
            costs={costData} 
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
  );
};

export default WarehouseModel;