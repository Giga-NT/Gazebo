/**
 * Copyright (c) 2026 Giga-NT (Григорьев Константин Владимирович)
 * Все права защищены.
 * 
 * License: Proprietary
 * См. LICENSE файл в корне проекта.
 */

import React, { useMemo } from 'react';
import * as THREE from 'three';
import { WarehouseParams } from '../../types/warehouseTypes';

// Дефолтные размеры окон и дверей (так как их нет в WarehouseParams)
const DEFAULT_WINDOW_WIDTH = 1.2;
const DEFAULT_WINDOW_HEIGHT = 1.2;
const DEFAULT_DOOR_WIDTH = 0.9;
const DEFAULT_DOOR_HEIGHT = 2.3;
const WINDOW_Y_OFFSET = 1.5; // высота центра окна от пола

interface WarehouseWallsProps {
  params: WarehouseParams;
  doorsOpen?: boolean; // Добавляем пропс для управления дверями
  gatesOpen?: boolean; // 🔹 Добавляем
}

const WarehouseWalls: React.FC<WarehouseWallsProps> = ({ 
  params, 
  doorsOpen = false, 
  gatesOpen = false // 🔹 Добавляем со значением по умолчанию
}) => {
  const {
    length,
    width,
    wallHeight,
    roofHeight,
    roofType,
    columnSpacing,
    wallMaterial,
    wallColor,
    gateType,
    gatePosition,
    gateSide,  
    gateWidth,
    gateHeight,
    columnSize,
    wallPanelThickness = 100,
    windowCount = 0,
    doorCount = 0,
  } = params;

  const colDim = columnSize ? parseInt(columnSize.split('x')[0]) / 1000 : 0.2;
  const colHalf = colDim / 2;
  const wallThickness = wallPanelThickness / 1000;
  const outset = colHalf + wallThickness;

  const totalLength = length + 2 * outset;
  const totalFrontWidth = width + 2 * outset;

  const colPositions = useMemo(() => {
    const positions: number[] = [];
    const colCount = Math.max(2, Math.ceil(totalLength / columnSpacing) + 1);
    const step = totalLength / (colCount - 1);
    for (let i = 0; i < colCount; i++) {
      positions.push(-totalLength / 2 + i * step);
    }
    return positions;
  }, [totalLength, columnSpacing]);

  if (wallMaterial === 'none') return null;

  const frontZ = -totalLength / 2;
  const backZ = totalLength / 2;

  // Вспомогательная функция для создания сегментированной панели с вырезами
  const createSegmentedPanel = (
    x1: number,
    x2: number,
    z: number,
    side: 'left' | 'right' | 'front' | 'back',
    cutouts: Array<{ x: number; y: number; w: number; h: number }> = []
  ) => {
    const panelWidth = Math.abs(x2 - x1);
    const centerX = (x1 + x2) / 2;
    
    let rotationY = 0;
    let posX = centerX;
    let posZ = z;

    if (side === 'left' || side === 'right') {
      posX = side === 'left' ? -width / 2 - outset : width / 2 + outset;
      posZ = centerX;
      rotationY = side === 'left' ? Math.PI / 2 : -Math.PI / 2;
    } else {
      rotationY = side === 'front' ? 0 : Math.PI;
    }

    // Если нет вырезов — создаём простую панель
    if (cutouts.length === 0) {
      return (
        <mesh
          key={`wall-${side}-${x1}-${z}`}
          position={[posX, wallHeight / 2, posZ]}
          rotation={[0, rotationY, 0]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[panelWidth, wallHeight, wallThickness]} />
          <meshStandardMaterial color={wallColor} roughness={0.5} metalness={0.1} />
        </mesh>
      );
    }

    // С вырезами — разбиваем на сегменты
    const segments: React.ReactNode[] = [];
    let currentX = x1;

    // Сортируем вырезы по X
    const sortedCutouts = [...cutouts].sort((a, b) => a.x - b.x);

    sortedCutouts.forEach((cut, idx) => {
      const cutLeft = cut.x - cut.w / 2;
      const cutRight = cut.x + cut.w / 2;
      const cutBottom = cut.y;
      const cutTop = cut.y + cut.h;

      // Сегмент слева от выреза (полная высота)
      if (currentX < cutLeft) {
        const segW = cutLeft - currentX;
        const segCX = (currentX + cutLeft) / 2;
        segments.push(
          <mesh
            key={`seg-${side}-${idx}-left`}
            position={[
              side === 'front' || side === 'back' ? segCX : posX,
              wallHeight / 2,
              side === 'front' || side === 'back' ? posZ : segCX
            ]}
            rotation={[0, rotationY, 0]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[segW, wallHeight, wallThickness]} />
            <meshStandardMaterial color={wallColor} roughness={0.5} metalness={0.1} />
          </mesh>
        );
      }

      // Нижняя часть под вырезом
      if (cutBottom > 0) {
        segments.push(
          <mesh
            key={`seg-${side}-${idx}-bottom`}
            position={[
              side === 'front' || side === 'back' ? cut.x : posX,
              cutBottom / 2,
              side === 'front' || side === 'back' ? posZ : cut.x
            ]}
            rotation={[0, rotationY, 0]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[cut.w, cutBottom, wallThickness]} />
            <meshStandardMaterial color={wallColor} roughness={0.5} metalness={0.1} />
          </mesh>
        );
      }

      // Верхняя часть над вырезом
      if (cutTop < wallHeight) {
        const topH = wallHeight - cutTop;
        segments.push(
          <mesh
            key={`seg-${side}-${idx}-top`}
            position={[
              side === 'front' || side === 'back' ? cut.x : posX,
              cutTop + topH / 2,
              side === 'front' || side === 'back' ? posZ : cut.x
            ]}
            rotation={[0, rotationY, 0]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[cut.w, topH, wallThickness]} />
            <meshStandardMaterial color={wallColor} roughness={0.5} metalness={0.1} />
          </mesh>
        );
      }

      // Последний сегмент справа от последнего выреза
      if (idx === sortedCutouts.length - 1 && cutRight < x2) {
        const segW = x2 - cutRight;
        const segCX = (cutRight + x2) / 2;
        segments.push(
          <mesh
            key={`seg-${side}-${idx}-right`}
            position={[
              side === 'front' || side === 'back' ? segCX : posX,
              wallHeight / 2,
              side === 'front' || side === 'back' ? posZ : segCX
            ]}
            rotation={[0, rotationY, 0]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[segW, wallHeight, wallThickness]} />
            <meshStandardMaterial color={wallColor} roughness={0.5} metalness={0.1} />
          </mesh>
        );
      }

      currentX = cutRight;
    });

    return <>{segments}</>;
  };

  // Создание окна (стекло)
  const createWindow = (x: number, z: number, side: 'front' | 'back' | 'left' | 'right') => {
    const rotationY = side === 'front' ? 0 : side === 'back' ? Math.PI : side === 'left' ? Math.PI / 2 : -Math.PI / 2;
    const winY = WINDOW_Y_OFFSET;
    
    return (
      <mesh
        key={`window-${side}-${x}`}
        position={[
          side === 'front' || side === 'back' ? x : (side === 'left' ? -width/2 - outset : width/2 + outset),
          winY,
          side === 'front' || side === 'back' ? z : x
        ]}
        rotation={[0, rotationY, 0]}
      >
        <boxGeometry args={[DEFAULT_WINDOW_WIDTH, DEFAULT_WINDOW_HEIGHT, wallThickness + 0.02]} />
        <meshStandardMaterial color="#87CEEB" roughness={0.1} metalness={0.1} transparent opacity={0.5} />
      </mesh>
    );
  };

  // Создание одностворчатой двери с анимацией открывания
  const createDoor = (x: number, z: number, side: 'front' | 'back' | 'left' | 'right') => {
    const rotationY = side === 'front' ? 0 : side === 'back' ? Math.PI : side === 'left' ? Math.PI / 2 : -Math.PI / 2;
    const doorY = DEFAULT_DOOR_HEIGHT / 2;
    const frameW = 0.1;
    
    // Смещение двери
    const offset = 0.02;

    let baseX = x;
    let baseZ = z;

    if (side === 'front' || side === 'back') {
      baseZ = z + offset;
    } else {
      baseX = x + offset;
    }

    // Угол открытия (90 градусов = Math.PI/2)
    // Дверь открывается наружу
    let doorRotation = 0;
    
    if (doorsOpen) {
      if (side === 'front') {
        doorRotation = Math.PI / 2; // открывается вправо
      } else if (side === 'back') {
        doorRotation = -Math.PI / 2; // открывается влево
      } else if (side === 'left') {
        doorRotation = Math.PI / 2; // открывается наружу
      } else if (side === 'right') {
        doorRotation = -Math.PI / 2; // открывается наружу
      }
    }

    return (
      <group key={`door-${side}-${x}`}>
        {/* Рама: левая вертикальная стойка */}
        <mesh
          position={[
            side === 'front' || side === 'back' ? baseX - DEFAULT_DOOR_WIDTH/2 - frameW/2 : (side === 'left' ? -width/2 - outset : width/2 + outset),
            doorY,
            side === 'front' || side === 'back' ? baseZ : baseX
          ]}
          rotation={[0, rotationY, 0]}
        >
          <boxGeometry args={[frameW, DEFAULT_DOOR_HEIGHT, 0.05]} />
          <meshStandardMaterial color={wallColor} roughness={0.5} metalness={0.3} />
        </mesh>
        
        {/* Рама: правая вертикальная стойка */}
        <mesh
          position={[
            side === 'front' || side === 'back' ? baseX + DEFAULT_DOOR_WIDTH/2 + frameW/2 : (side === 'left' ? -width/2 - outset : width/2 + outset),
            doorY,
            side === 'front' || side === 'back' ? baseZ : baseX
          ]}
          rotation={[0, rotationY, 0]}
        >
          <boxGeometry args={[frameW, DEFAULT_DOOR_HEIGHT, 0.05]} />
          <meshStandardMaterial color={wallColor} roughness={0.5} metalness={0.3} />
        </mesh>
        
        {/* Рама: верхняя перекладина */}
        <mesh
          position={[
            side === 'front' || side === 'back' ? baseX : (side === 'left' ? -width/2 - outset : width/2 + outset),
            DEFAULT_DOOR_HEIGHT + frameW/2,
            side === 'front' || side === 'back' ? baseZ : baseX
          ]}
          rotation={[0, rotationY, 0]}
        >
          <boxGeometry args={[DEFAULT_DOOR_WIDTH + frameW * 2, frameW, 0.05]} />
          <meshStandardMaterial color={wallColor} roughness={0.5} metalness={0.3} />
        </mesh>
        
        {/* Полотно двери (одна створка) - анимированное */}
        <group
          position={[
            side === 'front' || side === 'back' ? baseX : (side === 'left' ? -width/2 - outset : width/2 + outset),
            doorY,
            side === 'front' || side === 'back' ? baseZ : baseX
          ]}
          rotation={[0, rotationY + doorRotation, 0]}
        >
          <mesh
            position={[0, 0, 0]}
          >
            <boxGeometry args={[DEFAULT_DOOR_WIDTH - 0.03, DEFAULT_DOOR_HEIGHT - 0.03, 0.04]} />
            <meshStandardMaterial color={wallColor} roughness={0.6} metalness={0.4} />
          </mesh>
          
          {/* Ручка двери */}
          <mesh
            position={[DEFAULT_DOOR_WIDTH/2 - 0.15, 0, 0.03]}
          >
            <sphereGeometry args={[0.03, 8, 8]} />
            <meshStandardMaterial color="#FFD700" roughness={0.3} metalness={0.7} />
          </mesh>
        </group>
      </group>
    );
  };

  // Фронтоны
  const createGablePanel = (z: number, side: 'front' | 'back', points: [number, number][], rotationY: number) => {
    const shape = new THREE.Shape();
    shape.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) shape.lineTo(points[i][0], points[i][1]);
    shape.closePath();

    const geometry = new THREE.ExtrudeGeometry(shape, { steps: 1, depth: wallThickness, bevelEnabled: false });
    geometry.translate(0, 0, -wallThickness / 2);

    return (
      <mesh key={`gable-${side}-${rotationY}`} position={[0, wallHeight, z]} rotation={[0, rotationY, 0]} castShadow receiveShadow>
        <primitive object={geometry} attach="geometry" />
        <meshStandardMaterial color={wallColor} roughness={0.5} metalness={0.1} />
      </mesh>
    );
  };

  const createGableTriangle = (z: number, side: 'front' | 'back') => {
    const rotY = side === 'front' ? 0 : Math.PI;
    const points: [number, number][] = [[-totalFrontWidth/2, 0], [totalFrontWidth/2, 0], [0, roofHeight]];
    return createGablePanel(z, side, points, rotY);
  };

  const createSingleSlopeFrontPanel = (z: number) => {
    const points: [number, number][] = [[-totalFrontWidth/2, 0], [totalFrontWidth/2, 0], [totalFrontWidth/2, roofHeight]];
    return createGablePanel(z, 'front', points, 0);
  };

  const createSingleSlopeBackPanel = (z: number) => {
    const points: [number, number][] = [[-totalFrontWidth/2, 0], [totalFrontWidth/2, 0], [-totalFrontWidth/2, roofHeight]];
    return createGablePanel(z, 'back', points, Math.PI);
  };

  const createOverGatePanel = (z: number, side: 'front' | 'back') => {
    const rotY = side === 'front' ? 0 : Math.PI;
    const panelH = wallHeight - gateHeight;
    if (panelH <= 0) return null;
    return (
      <mesh key={`overgate-${side}`} position={[0, gateHeight + panelH/2, z]} rotation={[0, rotY, 0]} castShadow receiveShadow>
        <boxGeometry args={[gateWidth, panelH, wallThickness]} />
        <meshStandardMaterial color={wallColor} roughness={0.5} metalness={0.1} />
      </mesh>
    );
  };

  const elements: React.ReactNode[] = [];

  // Сбор вырезов по стенам
  type Cutout = { x: number; y: number; w: number; h: number; type: 'window' | 'door' };
  const frontCuts: Cutout[] = [];
  const backCuts: Cutout[] = [];
  const leftCuts: Cutout[] = [];
  const rightCuts: Cutout[] = [];

  // Ворота как вырезы
  const isGateFront = (gatePosition === 'front' || gatePosition === 'both') && gateType !== 'none';
  const isGateBack = (gatePosition === 'back' || gatePosition === 'both') && gateType !== 'none';
  if (isGateFront) frontCuts.push({ x: 0, y: 0, w: gateWidth, h: gateHeight, type: 'door' });
  if (isGateBack) backCuts.push({ x: 0, y: 0, w: gateWidth, h: gateHeight, type: 'door' });

  // Распределение дверей
  if (doorCount > 0) {
    let added = 0;
    const perSide = Math.ceil(doorCount / 4);
    for (let i = 0; i < perSide && added < doorCount; i++) {
      const pos = -length/2 + (length / (perSide + 1)) * (i + 1);
      if (added < doorCount) { leftCuts.push({ x: pos, y: 0, w: DEFAULT_DOOR_WIDTH, h: DEFAULT_DOOR_HEIGHT, type: 'door' }); added++; }
      if (added < doorCount) { rightCuts.push({ x: pos, y: 0, w: DEFAULT_DOOR_WIDTH, h: DEFAULT_DOOR_HEIGHT, type: 'door' }); added++; }
    }
  }

  // Распределение окон
  if (windowCount > 0) {
    const perWall = Math.floor(windowCount / 4);
    const winY = WINDOW_Y_OFFSET - DEFAULT_WINDOW_HEIGHT / 2;
    
    if (!isGateFront && perWall > 0) {
      for (let i = 0; i < perWall; i++) {
        const xPos = -width/2 + (width / (perWall + 1)) * (i + 1);
        frontCuts.push({ x: xPos, y: winY, w: DEFAULT_WINDOW_WIDTH, h: DEFAULT_WINDOW_HEIGHT, type: 'window' });
      }
    }
    if (!isGateBack && perWall > 0) {
      for (let i = 0; i < perWall; i++) {
        const xPos = -width/2 + (width / (perWall + 1)) * (i + 1);
        backCuts.push({ x: xPos, y: winY, w: DEFAULT_WINDOW_WIDTH, h: DEFAULT_WINDOW_HEIGHT, type: 'window' });
      }
    }
    if (perWall > 0) {
      for (let i = 0; i < perWall; i++) {
        const zPos = -length/2 + (length / (perWall + 1)) * (i + 1);
        leftCuts.push({ x: zPos, y: winY, w: DEFAULT_WINDOW_WIDTH, h: DEFAULT_WINDOW_HEIGHT, type: 'window' });
        rightCuts.push({ x: zPos, y: winY, w: DEFAULT_WINDOW_WIDTH, h: DEFAULT_WINDOW_HEIGHT, type: 'window' });
      }
    }
  }

  // Передняя стена
  const x1 = -totalFrontWidth / 2, x2 = totalFrontWidth / 2;
  if (isGateFront) {
    const gh = gateWidth / 2;
    if (x1 < -gh) elements.push(createSegmentedPanel(x1, -gh, frontZ, 'front', frontCuts.filter(c => c.x < -gh)));
    if (gh < x2) elements.push(createSegmentedPanel(gh, x2, frontZ, 'front', frontCuts.filter(c => c.x > gh)));
    elements.push(createOverGatePanel(frontZ, 'front'));
  } else {
    elements.push(createSegmentedPanel(x1, x2, frontZ, 'front', frontCuts));
  }

  // Задняя стена
  if (isGateBack) {
    const gh = gateWidth / 2;
    if (x1 < -gh) elements.push(createSegmentedPanel(x1, -gh, backZ, 'back', backCuts.filter(c => c.x < -gh)));
    if (gh < x2) elements.push(createSegmentedPanel(gh, x2, backZ, 'back', backCuts.filter(c => c.x > gh)));
    elements.push(createOverGatePanel(backZ, 'back'));
  } else {
    elements.push(createSegmentedPanel(x1, x2, backZ, 'back', backCuts));
  }

  // 🔹 Боковые стены — КОПИРУЕМ логику передней/задней стены
  const isGateLeft = gatePosition === 'side' && (gateSide === 'left' || gateSide === 'both_sides') && gateType !== 'none';
  const isGateRight = gatePosition === 'side' && (gateSide === 'right' || gateSide === 'both_sides') && gateType !== 'none';
  
  // Боковые стены (по сегментам между колоннами)
  for (let i = 0; i < colPositions.length - 1; i++) {
    const z1 = colPositions[i], z2 = colPositions[i + 1];
    
    // 🔹 ЛЕВАЯ стена
    if (isGateLeft) {
      if (gatesOpen) {
        // Ворота открыты: рендерим сегмент БЕЗ выреза под ворота
        elements.push(createSegmentedPanel(z1, z2, -width/2, 'left', leftCuts.filter(c => c.type === 'window')));
      } else {
        // Ворота закрыты: рендерим сегменты с вырезом под ворота
        const gateZ = 0; // ворота по центру боковой стены
        const gh = gateWidth / 2;
        
        // Сегмент слева от ворот (по оси Z)
        if (z1 < gateZ - gh) {
          elements.push(createSegmentedPanel(z1, gateZ - gh, -width/2, 'left', leftCuts.filter(c => c.x < gateZ - gh)));
        }
        // Сегмент справа от ворот (по оси Z)
        if (gateZ + gh < z2) {
          elements.push(createSegmentedPanel(gateZ + gh, z2, -width/2, 'left', leftCuts.filter(c => c.x > gateZ + gh)));
        }
        // Панель над воротами - ИСПРАВЛЕНО!
        if (!gatesOpen) {
          const panelH = wallHeight - gateHeight;
          if (panelH > 0) {
            elements.push(
              <mesh 
                key={`overgate-left-seg-${i}`} 
                // X = gateZ (центр по Z), Y = высота, Z = позиция левой стены с учетом толщины
                position={[gateZ-3.2, gateHeight + panelH/2, -width/2 - outset+3.2]} 
                rotation={[0, Math.PI/2, 0]} 
                castShadow 
                receiveShadow
              >
                <boxGeometry args={[gateWidth, panelH, wallThickness]} />
                <meshStandardMaterial color={wallColor} roughness={0.5} metalness={0.1} />
              </mesh>
            );
          }
        }
      }
    } else {
      // Нет ворот слева
      const leftSeg = leftCuts.filter(c => c.x > z1 && c.x < z2);
      elements.push(createSegmentedPanel(z1, z2, -width/2, 'left', leftSeg));
    }
    
    // 🔹 ПРАВАЯ стена
    if (isGateRight) {
      if (gatesOpen) {
        // Ворота открыты: рендерим сегмент БЕЗ выреза под ворота
        elements.push(createSegmentedPanel(z1, z2, width/2, 'right', rightCuts.filter(c => c.type === 'window')));
      } else {
        // Ворота закрыты: рендерим сегменты с вырезом под ворота
        const gateZ = 0; // ворота по центру боковой стены
        const gh = gateWidth / 2;
        
        // Сегмент слева от ворот (по оси Z)
        if (z1 < gateZ - gh) {
          elements.push(createSegmentedPanel(z1, gateZ - gh, width/2, 'right', rightCuts.filter(c => c.x < gateZ - gh)));
        }
        // Сегмент справа от ворот (по оси Z)
        if (gateZ + gh < z2) {
          elements.push(createSegmentedPanel(gateZ + gh, z2, width/2, 'right', rightCuts.filter(c => c.x > gateZ + gh)));
        }
        // Панель над воротами - ИСПРАВЛЕНО!
        if (!gatesOpen) {
          const panelH = wallHeight - gateHeight;
          if (panelH > 0) {
            elements.push(
              <mesh 
                key={`overgate-right-seg-${i}`} 
                // X = gateZ (центр по Z), Y = высота, Z = позиция правой стены с учетом толщины
                position={[gateZ, gateHeight + panelH/2, width/2 + outset]} 
                rotation={[0, -Math.PI/2, 0]} 
                castShadow 
                receiveShadow
              >
                <boxGeometry args={[gateWidth, panelH, wallThickness]} />
                <meshStandardMaterial color={wallColor} roughness={0.5} metalness={0.1} />
              </mesh>
            );
          }
        }
      }
    } else {
      // Нет ворот справа
      const rightSeg = rightCuts.filter(c => c.x > z1 && c.x < z2);
      elements.push(createSegmentedPanel(z1, z2, width/2, 'right', rightSeg));
    }
  }

  // Добавляем окна и двери как отдельные объекты
  [...frontCuts, ...backCuts, ...leftCuts, ...rightCuts].forEach((cut, idx) => {
    // Определяем сторону выреза
    let side: 'front' | 'back' | 'left' | 'right' = 'front';
    if (backCuts.includes(cut)) side = 'back';
    else if (leftCuts.includes(cut)) side = 'left';
    else if (rightCuts.includes(cut)) side = 'right';
    
    const z = side === 'front' ? frontZ : side === 'back' ? backZ : (side === 'left' ? -width/2 - outset : width/2 + outset);
    const x = cut.x;
    
    if (cut.type === 'window') {
      elements.push(createWindow(x, z, side));
    } else if (cut.type === 'door') {
      // ВАЖНОЕ ИСПРАВЛЕНИЕ:
      // Не создаем отдельную дверь, если этот вырез соответствует ВОРОТАМ.
      // Калитка уже создана внутри WarehouseGates.
      // Создаем дверь только если это НЕ ворота (т.е. обычная дверь в стене).
      
      const isGateCutout = 
        (side === 'front' && isGateFront && Math.abs(cut.x) < 0.1 && cut.w === gateWidth && cut.h === gateHeight) ||
        (side === 'back' && isGateBack && Math.abs(cut.x) < 0.1 && cut.w === gateWidth && cut.h === gateHeight);

      if (!isGateCutout) {
        elements.push(createDoor(x, z, side));
      }
    }
  });

  // Фронтоны
  if (roofType === 'gable') {
    elements.push(createGableTriangle(frontZ, 'front'));
    elements.push(createGableTriangle(backZ, 'back'));
  } else if (roofType === 'single') {
    elements.push(createSingleSlopeFrontPanel(frontZ));
    elements.push(createSingleSlopeBackPanel(backZ));
  }
// После всех существующих элементов, добавим недостающие части стен для односкатной крыши
if (roofType === 'single') {
  // Для односкатной крыши нужна прямоугольная панель только на высокой стороне
  // Размер: длина = totalLength, высота = roofHeight
  
  // Высокая сторона (правая стена, если скат поднимается справа налево)
  elements.push(
    <mesh
      key="high-side-panel"
      position={[width/2 + outset, wallHeight + roofHeight/2, 0]}
      rotation={[0, -Math.PI/2, 0]}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[totalLength, roofHeight, wallThickness]} />
      <meshStandardMaterial color={wallColor} roughness={0.5} metalness={0.1} />
    </mesh>
  );
  
  // Если нужно определить какая сторона высокая в зависимости от ориентации
  // Можно добавить логику определения высокой стороны
}

  return <>{elements}</>;
};

export default React.memo(WarehouseWalls);