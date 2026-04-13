/**
 * Copyright (c) 2026 Giga-NT (Григорьев Константин Владимирович)
 * Все права защищены.
 * 
 * License: Proprietary
 * См. LICENSE файл в корне проекта.
 */

// src/components/Warehouse/WarehousePurlins.tsx
import React, { useMemo } from 'react';
import * as THREE from 'three';
import { WarehouseParams } from '../../types/warehouseTypes';
import Beam from '../Beams/Beam';

const WarehousePurlins: React.FC<{ params: WarehouseParams }> = ({ params }) => {
  const {
    width,
    length,
    wallHeight,
    roofHeight,
    roofType,
    purlinSpacing,
    trussCount,
    frameColor,
    columnSize,
    wallPanelThickness = 100,
  } = params;

  // Размеры для опорных балок
  const colDim = columnSize ? parseInt(columnSize.split('x')[0]) / 1000 : 0.2;
  const wallThickness = wallPanelThickness / 1000;
  const overhang = colDim / 2 + wallThickness;
  const totalLength = length + 2 * overhang;

  // Размер прогона для обрешетки
  const purlinDim = {
    width: 0.08, // 80 мм
    thickness: 0.06 // 60 мм
  };

  // Размер опорной балки
  const supportBeamDim = {
    width: 0.1, // 100 мм
    thickness: 0.1 // 100 мм
  };

  const elements: React.ReactElement[] = [];

  // === ОПОРНЫЕ БАЛКИ ПО ВЕРХУ СТЕН (на них опираются фермы) ===
  
  // Левая стена - опорная балка
  elements.push(
    <Beam
      key="left-wall-beam"
      start={new THREE.Vector3(-width/2, wallHeight, -length/2)}
      end={new THREE.Vector3(-width/2, wallHeight, length/2)}
      dimensions={supportBeamDim}
      color={frameColor}
    />
  );

  // Правая стена - опорная балка
  elements.push(
    <Beam
      key="right-wall-beam"
      start={new THREE.Vector3(width/2, wallHeight, -length/2)}
      end={new THREE.Vector3(width/2, wallHeight, length/2)}
      dimensions={supportBeamDim}
      color={frameColor}
    />
  );

  // Передняя стена - опорная балка
  elements.push(
    <Beam
      key="front-wall-beam"
      start={new THREE.Vector3(-width/2, wallHeight, -length/2)}
      end={new THREE.Vector3(width/2, wallHeight, -length/2)}
      dimensions={supportBeamDim}
      color={frameColor}
    />
  );

  // Задняя стена - опорная балка
  elements.push(
    <Beam
      key="back-wall-beam"
      start={new THREE.Vector3(-width/2, wallHeight, length/2)}
      end={new THREE.Vector3(width/2, wallHeight, length/2)}
      dimensions={supportBeamDim}
      color={frameColor}
    />
  );

  // === ОБРЕШЕТКА КРОВЛИ (ваш оригинальный код) ===

  // Позиции ферм
  const trussPositions = useMemo(() => {
    const positions: number[] = [];
    const step = length / (trussCount - 1);
    for (let i = 0; i < trussCount; i++) {
      positions.push(-length / 2 + i * step);
    }
    return positions;
  }, [length, trussCount]);

  // Количество прогонов обрешетки
  const purlinCount = Math.floor(width / purlinSpacing) + 1;

  // Функция для получения высоты кровли в точке X
  const getRoofHeightAtX = (x: number): number => {
    const t = (x + width / 2) / width;
    if (roofType === 'gable') {
      if (t <= 0.5) return wallHeight + 2 * roofHeight * t;
      else return wallHeight + 2 * roofHeight * (1 - t);
    } else if (roofType === 'single') {
      return wallHeight + roofHeight * t;
    } else { // flat
      return wallHeight;
    }
  };

  // Создаем прогоны обрешетки вдоль длины здания
  for (let i = 0; i < purlinCount; i++) {
    const t = i / (purlinCount - 1);
    const x = -width / 2 + t * width;
    const y = getRoofHeightAtX(x);

    const start = new THREE.Vector3(x, y, trussPositions[0]);
    const end = new THREE.Vector3(x, y, trussPositions[trussPositions.length - 1]);
    
    elements.push(
      <Beam
        key={`purlin-${i}`}
        start={start}
        end={end}
        dimensions={purlinDim}
        color={frameColor}
      />
    );
  }

  return <>{elements}</>;
};

export default React.memo(WarehousePurlins);