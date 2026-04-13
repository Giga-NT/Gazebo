/**
 * Copyright (c) 2026 Giga-NT (Григорьев Константин Владимирович)
 * Все права защищены.
 * 
 * License: Proprietary
 * См. LICENSE файл в корне проекта.
 */

// src/components/Warehouse/WarehouseTrusses.tsx
import React, { useMemo } from 'react';
import * as THREE from 'three';
import { WarehouseParams } from '../../types/warehouseTypes';
import Beam from '../Beams/Beam';

const WarehouseTrusses: React.FC<{ params: WarehouseParams }> = ({ params }) => {
  const {
    width,
    length,
    wallHeight,
    roofHeight,
    roofType,
    trussCount,
    trussType = 'simple',
    frameColor,
    columnSize,
    wallPanelThickness = 100,
    trussSection = '80x80',
  } = params;

  const colDim = columnSize ? parseInt(columnSize.split('x')[0]) / 1000 : 0.2;
  const wallThickness = wallPanelThickness / 1000;
  const overhang = colDim / 2 + wallThickness;
  const columnToColumnWidth = width; // расстояние между левой и правой колонной
  const totalLength = length + 2 * overhang;

  // Высота опорной балки (из WarehousePurlins)
  const supportBeamHeight = 0.1; // 100 мм
  const beamOffset = supportBeamHeight / 2;

  const getBeamDim = (section: string) => {
    const size = parseInt(section.split('x')[0]) / 1000;
    return { width: size, thickness: size };
  };
  const beamDim = getBeamDim(trussSection);


	// Позиции ферм по длине
	const trussPositions = useMemo(() => {
	  const positions: number[] = [];
	  const step = totalLength / (trussCount - 1);
	  
	  // Толщина стеновой панели для смещения крайних ферм
	  const wallOffset = wallThickness;
	  
	  for (let i = 0; i < trussCount; i++) {
		let pos = -totalLength / 2 + i * step;
		
		// Смещаем первую и последнюю фермы внутрь на толщину стены
		if (i === 0) {
		  pos = -totalLength / 2 + wallOffset; // Первая ферма
		} else if (i === trussCount - 1) {
		  pos = totalLength / 2 - wallOffset; // Последняя ферма
		}
		
		positions.push(pos);
	  }
	  return positions;
	}, [totalLength, trussCount, wallThickness]);

  // Функция для получения точек верхнего пояса
  const getRoofPoints = (z: number): THREE.Vector3[] => {
    const points: THREE.Vector3[] = [];
    
    if (roofType === 'gable') {
      points.push(
        new THREE.Vector3(-columnToColumnWidth / 2, wallHeight + beamOffset, z),
        new THREE.Vector3(0, wallHeight + roofHeight + beamOffset, z),
        new THREE.Vector3(columnToColumnWidth / 2, wallHeight + beamOffset, z)
      );
    } 
    else if (roofType === 'single') {
      points.push(
        new THREE.Vector3(-columnToColumnWidth / 2, wallHeight + beamOffset, z),
        new THREE.Vector3(columnToColumnWidth / 2, wallHeight + roofHeight + beamOffset, z)
      );
    } 
    else { // flat
      points.push(
        new THREE.Vector3(-columnToColumnWidth / 2, wallHeight + beamOffset, z),
        new THREE.Vector3(columnToColumnWidth / 2, wallHeight + beamOffset, z)
      );
    }
    return points;
  };

  // Функция для получения высоты кровли в точке x
  const getRoofY = (x: number): number => {
    const t = (x + columnToColumnWidth / 2) / columnToColumnWidth;
    
    if (roofType === 'gable') {
      return wallHeight + beamOffset + (t <= 0.5 ? 2 * roofHeight * t : 2 * roofHeight * (1 - t));
    } 
    else if (roofType === 'single') {
      return wallHeight + beamOffset + roofHeight * t;
    } 
    else {
      return wallHeight + beamOffset;
    }
  };

  // Базовая ферма (для первой и последней)
  const createBaseTruss = (z: number, idx: number) => {
    const elements: React.ReactElement[] = [];
    const roofPoints = getRoofPoints(z);
    
    // Верхний пояс
    for (let i = 0; i < roofPoints.length - 1; i++) {
      elements.push(
        <Beam
          key={`top-${idx}-${i}`}
          start={roofPoints[i]}
          end={roofPoints[i + 1]}
          dimensions={beamDim}
          color={frameColor}
        />
      );
    }

    // Нижний пояс (поднят на высоту опорной балки)
    elements.push(
      <Beam
        key={`bottom-${idx}`}
        start={new THREE.Vector3(-columnToColumnWidth / 2, wallHeight + beamOffset, z)}
        end={new THREE.Vector3(columnToColumnWidth / 2, wallHeight + beamOffset, z)}
        dimensions={beamDim}
        color={frameColor}
      />
    );

    // Вертикальные стойки
    const verticalCount = 3;
    for (let i = 0; i <= verticalCount; i++) {
      const t = i / verticalCount;
      const x = -columnToColumnWidth / 2 + t * columnToColumnWidth;
      const roofY = getRoofY(x);
      
      if (i > 0 && i < verticalCount) {
        elements.push(
          <Beam
            key={`vert-${idx}-${i}`}
            start={new THREE.Vector3(x, wallHeight + beamOffset, z)}
            end={new THREE.Vector3(x, roofY, z)}
            dimensions={beamDim}
            color={frameColor}
          />
        );
      }
    }
    
    return elements;
  };

  // Простая ферма
  const createSimpleTruss = (z: number, idx: number) => {
    const elements: React.ReactElement[] = [];
    const roofPoints = getRoofPoints(z);
    
    // Верхний пояс
    for (let i = 0; i < roofPoints.length - 1; i++) {
      elements.push(
        <Beam
          key={`top-${idx}-${i}`}
          start={roofPoints[i]}
          end={roofPoints[i + 1]}
          dimensions={beamDim}
          color={frameColor}
        />
      );
    }

    // Нижний пояс
    elements.push(
      <Beam
        key={`bottom-${idx}`}
        start={new THREE.Vector3(-columnToColumnWidth / 2, wallHeight + beamOffset, z)}
        end={new THREE.Vector3(columnToColumnWidth / 2, wallHeight + beamOffset, z)}
        dimensions={beamDim}
        color={frameColor}
      />
    );

    // Вертикальные стойки
    const verticalCount = 5;
    for (let i = 0; i <= verticalCount; i++) {
      const t = i / verticalCount;
      const x = -columnToColumnWidth / 2 + t * columnToColumnWidth;
      const roofY = getRoofY(x);
      
      elements.push(
        <Beam
          key={`vert-${idx}-${i}`}
          start={new THREE.Vector3(x, wallHeight + beamOffset, z)}
          end={new THREE.Vector3(x, roofY, z)}
          dimensions={beamDim}
          color={frameColor}
        />
      );
    }
    
    return elements;
  };

  // Усиленная ферма
  const createReinforcedTruss = (z: number, idx: number) => {
    const elements: React.ReactElement[] = [];
    const roofPoints = getRoofPoints(z);
    
    // Верхний пояс
    for (let i = 0; i < roofPoints.length - 1; i++) {
      elements.push(
        <Beam
          key={`top-${idx}-${i}`}
          start={roofPoints[i]}
          end={roofPoints[i + 1]}
          dimensions={beamDim}
          color={frameColor}
        />
      );
    }

    // Нижний пояс
    elements.push(
      <Beam
        key={`bottom-${idx}`}
        start={new THREE.Vector3(-columnToColumnWidth / 2, wallHeight + beamOffset, z)}
        end={new THREE.Vector3(columnToColumnWidth / 2, wallHeight + beamOffset, z)}
        dimensions={beamDim}
        color={frameColor}
      />
    );

    // Вертикальные стойки
    const verticalCount = 7;
    const verticalPositions: number[] = [];
    
    for (let i = 0; i <= verticalCount; i++) {
      const t = i / verticalCount;
      const x = -columnToColumnWidth / 2 + t * columnToColumnWidth;
      verticalPositions.push(x);
      const roofY = getRoofY(x);
      
      elements.push(
        <Beam
          key={`vert-${idx}-${i}`}
          start={new THREE.Vector3(x, wallHeight + beamOffset, z)}
          end={new THREE.Vector3(x, roofY, z)}
          dimensions={beamDim}
          color={frameColor}
        />
      );
    }
    
    // Диагональные раскосы
    for (let i = 0; i < verticalPositions.length - 1; i++) {
      const x1 = verticalPositions[i];
      const x2 = verticalPositions[i + 1];
      const roofY1 = getRoofY(x1);
      const roofY2 = getRoofY(x2);
      
      elements.push(
        <Beam
          key={`diag-up-${idx}-${i}`}
          start={new THREE.Vector3(x1, wallHeight + beamOffset, z)}
          end={new THREE.Vector3(x2, roofY2, z)}
          dimensions={{ width: beamDim.width * 0.8, thickness: beamDim.thickness * 0.8 }}
          color={frameColor}
        />,
        <Beam
          key={`diag-down-${idx}-${i}`}
          start={new THREE.Vector3(x1, roofY1, z)}
          end={new THREE.Vector3(x2, wallHeight + beamOffset, z)}
          dimensions={{ width: beamDim.width * 0.8, thickness: beamDim.thickness * 0.8 }}
          color={frameColor}
        />
      );
    }
    
    return elements;
  };

  // Решетчатая ферма
  const createLatticeTruss = (z: number, idx: number) => {
    const elements: React.ReactElement[] = [];
    const roofPoints = getRoofPoints(z);
    
    // Верхний пояс
    if (roofPoints.length === 3) {
      elements.push(
        <Beam
          key={`top-${idx}-full`}
          start={roofPoints[0]}
          end={roofPoints[2]}
          dimensions={beamDim}
          color={frameColor}
        />
      );
    } else {
      for (let i = 0; i < roofPoints.length - 1; i++) {
        elements.push(
          <Beam
            key={`top-${idx}-${i}`}
            start={roofPoints[i]}
            end={roofPoints[i + 1]}
            dimensions={beamDim}
            color={frameColor}
          />
        );
      }
    }

    // Нижний пояс
    elements.push(
      <Beam
        key={`bottom-${idx}`}
        start={new THREE.Vector3(-columnToColumnWidth / 2, wallHeight + beamOffset, z)}
        end={new THREE.Vector3(columnToColumnWidth / 2, wallHeight + beamOffset, z)}
        dimensions={beamDim}
        color={frameColor}
      />
    );

    // Создаем решетку
    const latticeCount = 10;
    for (let i = 0; i < latticeCount; i++) {
      const t1 = i / latticeCount;
      const t2 = (i + 1) / latticeCount;
      
      const xBottom1 = -columnToColumnWidth / 2 + t1 * columnToColumnWidth;
      const xBottom2 = -columnToColumnWidth / 2 + t2 * columnToColumnWidth;
      
      const roofY1 = getRoofY(xBottom1);
      const roofY2 = getRoofY(xBottom2);
      
      elements.push(
        <Beam
          key={`lattice-diag1-${idx}-${i}`}
          start={new THREE.Vector3(xBottom1, wallHeight + beamOffset, z)}
          end={new THREE.Vector3(xBottom2, roofY2, z)}
          dimensions={{ width: beamDim.width * 0.5, thickness: beamDim.thickness * 0.5 }}
          color={frameColor}
        />,
        <Beam
          key={`lattice-diag2-${idx}-${i}`}
          start={new THREE.Vector3(xBottom2, wallHeight + beamOffset, z)}
          end={new THREE.Vector3(xBottom1, roofY1, z)}
          dimensions={{ width: beamDim.width * 0.5, thickness: beamDim.thickness * 0.5 }}
          color={frameColor}
        />
      );
    }
    
    return elements;
  };

  // Ферма Pratt
  const createPrattTruss = (z: number, idx: number) => {
    const elements: React.ReactElement[] = [];
    const roofPoints = getRoofPoints(z);
    
    // Верхний пояс
    for (let i = 0; i < roofPoints.length - 1; i++) {
      elements.push(
        <Beam
          key={`top-${idx}-${i}`}
          start={roofPoints[i]}
          end={roofPoints[i + 1]}
          dimensions={beamDim}
          color={frameColor}
        />
      );
    }

    // Нижний пояс
    elements.push(
      <Beam
        key={`bottom-${idx}`}
        start={new THREE.Vector3(-columnToColumnWidth / 2, wallHeight + beamOffset, z)}
        end={new THREE.Vector3(columnToColumnWidth / 2, wallHeight + beamOffset, z)}
        dimensions={beamDim}
        color={frameColor}
      />
    );

    const panelCount = 8;
    const panelWidth = columnToColumnWidth / panelCount;
    
    for (let i = 0; i <= panelCount; i++) {
      const x = -columnToColumnWidth / 2 + i * panelWidth;
      const roofY = getRoofY(x);
      
      // Вертикальные стойки
      if (i > 0 && i < panelCount) {
        elements.push(
          <Beam
            key={`pratt-vert-${idx}-${i}`}
            start={new THREE.Vector3(x, wallHeight + beamOffset, z)}
            end={new THREE.Vector3(x, roofY, z)}
            dimensions={{ width: beamDim.width * 0.7, thickness: beamDim.thickness * 0.7 }}
            color={frameColor}
          />
        );
      }
      
      // Диагонали
      if (i < panelCount) {
        const xNext = -columnToColumnWidth / 2 + (i + 1) * panelWidth;
        const roofYNext = getRoofY(xNext);
        
        if (i < panelCount / 2) {
          elements.push(
            <Beam
              key={`pratt-diag-${idx}-${i}`}
              start={new THREE.Vector3(x, wallHeight + beamOffset, z)}
              end={new THREE.Vector3(xNext, roofYNext, z)}
              dimensions={{ width: beamDim.width * 0.6, thickness: beamDim.thickness * 0.6 }}
              color={frameColor}
            />
          );
        } else {
          elements.push(
            <Beam
              key={`pratt-diag-${idx}-${i}`}
              start={new THREE.Vector3(x, roofY, z)}
              end={new THREE.Vector3(xNext, wallHeight + beamOffset, z)}
              dimensions={{ width: beamDim.width * 0.6, thickness: beamDim.thickness * 0.6 }}
              color={frameColor}
            />
          );
        }
      }
    }
    
    return elements;
  };

  // Ферма Howe
  const createHoweTruss = (z: number, idx: number) => {
    const elements: React.ReactElement[] = [];
    const roofPoints = getRoofPoints(z);
    
    // Верхний пояс
    for (let i = 0; i < roofPoints.length - 1; i++) {
      elements.push(
        <Beam
          key={`top-${idx}-${i}`}
          start={roofPoints[i]}
          end={roofPoints[i + 1]}
          dimensions={beamDim}
          color={frameColor}
        />
      );
    }

    // Нижний пояс
    elements.push(
      <Beam
        key={`bottom-${idx}`}
        start={new THREE.Vector3(-columnToColumnWidth / 2, wallHeight + beamOffset, z)}
        end={new THREE.Vector3(columnToColumnWidth / 2, wallHeight + beamOffset, z)}
        dimensions={beamDim}
        color={frameColor}
      />
    );

    const panelCount = 8;
    const panelWidth = columnToColumnWidth / panelCount;
    
    for (let i = 0; i <= panelCount; i++) {
      const x = -columnToColumnWidth / 2 + i * panelWidth;
      const roofY = getRoofY(x);
      
      // Вертикальные стойки
      if (i > 0 && i < panelCount) {
        elements.push(
          <Beam
            key={`howe-vert-${idx}-${i}`}
            start={new THREE.Vector3(x, wallHeight + beamOffset, z)}
            end={new THREE.Vector3(x, roofY, z)}
            dimensions={{ width: beamDim.width * 0.7, thickness: beamDim.thickness * 0.7 }}
            color={frameColor}
          />
        );
      }
      
      // Диагонали
      if (i < panelCount) {
        const xNext = -columnToColumnWidth / 2 + (i + 1) * panelWidth;
        const roofYNext = getRoofY(xNext);
        
        if (i < panelCount / 2) {
          elements.push(
            <Beam
              key={`howe-diag-${idx}-${i}`}
              start={new THREE.Vector3(x, roofY, z)}
              end={new THREE.Vector3(xNext, wallHeight + beamOffset, z)}
              dimensions={{ width: beamDim.width * 0.6, thickness: beamDim.thickness * 0.6 }}
              color={frameColor}
            />
          );
        } else {
          elements.push(
            <Beam
              key={`howe-diag-${idx}-${i}`}
              start={new THREE.Vector3(x, wallHeight + beamOffset, z)}
              end={new THREE.Vector3(xNext, roofYNext, z)}
              dimensions={{ width: beamDim.width * 0.6, thickness: beamDim.thickness * 0.6 }}
              color={frameColor}
            />
          );
        }
      }
    }
    
    return elements;
  };

  // Ферма Warren
  const createWarrenTruss = (z: number, idx: number) => {
    const elements: React.ReactElement[] = [];
    const roofPoints = getRoofPoints(z);
    
    // Верхний пояс
    for (let i = 0; i < roofPoints.length - 1; i++) {
      elements.push(
        <Beam
          key={`top-${idx}-${i}`}
          start={roofPoints[i]}
          end={roofPoints[i + 1]}
          dimensions={beamDim}
          color={frameColor}
        />
      );
    }

    // Нижний пояс
    elements.push(
      <Beam
        key={`bottom-${idx}`}
        start={new THREE.Vector3(-columnToColumnWidth / 2, wallHeight + beamOffset, z)}
        end={new THREE.Vector3(columnToColumnWidth / 2, wallHeight + beamOffset, z)}
        dimensions={beamDim}
        color={frameColor}
      />
    );

    const panelCount = 10;
    const panelWidth = columnToColumnWidth / panelCount;
    
    for (let i = 0; i < panelCount; i++) {
      const x1 = -columnToColumnWidth / 2 + i * panelWidth;
      const x2 = -columnToColumnWidth / 2 + (i + 1) * panelWidth;
      const roofY1 = getRoofY(x1);
      const roofY2 = getRoofY(x2);
      
      if (i % 2 === 0) {
        elements.push(
          <Beam
            key={`warren-up-${idx}-${i}`}
            start={new THREE.Vector3(x1, wallHeight + beamOffset, z)}
            end={new THREE.Vector3(x2, roofY2, z)}
            dimensions={{ width: beamDim.width * 0.6, thickness: beamDim.thickness * 0.6 }}
            color={frameColor}
          />
        );
      } else {
        elements.push(
          <Beam
            key={`warren-down-${idx}-${i}`}
            start={new THREE.Vector3(x1, roofY1, z)}
            end={new THREE.Vector3(x2, wallHeight + beamOffset, z)}
            dimensions={{ width: beamDim.width * 0.6, thickness: beamDim.thickness * 0.6 }}
            color={frameColor}
          />
        );
      }
    }
    
    return elements;
  };

  // Ферма Fink
  const createFinkTruss = (z: number, idx: number) => {
    const elements: React.ReactElement[] = [];
    const roofPoints = getRoofPoints(z);
    
    // Верхний пояс
    for (let i = 0; i < roofPoints.length - 1; i++) {
      elements.push(
        <Beam
          key={`top-${idx}-${i}`}
          start={roofPoints[i]}
          end={roofPoints[i + 1]}
          dimensions={beamDim}
          color={frameColor}
        />
      );
    }

    // Нижний пояс
    elements.push(
      <Beam
        key={`bottom-${idx}`}
        start={new THREE.Vector3(-columnToColumnWidth / 2, wallHeight + beamOffset, z)}
        end={new THREE.Vector3(columnToColumnWidth / 2, wallHeight + beamOffset, z)}
        dimensions={beamDim}
        color={frameColor}
      />
    );

    const centerX = 0;
    const centerY = getRoofY(centerX);
    
    elements.push(
      <Beam
        key={`fink-center-left-${idx}`}
        start={new THREE.Vector3(-columnToColumnWidth / 4, wallHeight + beamOffset, z)}
        end={new THREE.Vector3(centerX, centerY, z)}
        dimensions={{ width: beamDim.width * 0.7, thickness: beamDim.thickness * 0.7 }}
        color={frameColor}
      />,
      <Beam
        key={`fink-center-right-${idx}`}
        start={new THREE.Vector3(columnToColumnWidth / 4, wallHeight + beamOffset, z)}
        end={new THREE.Vector3(centerX, centerY, z)}
        dimensions={{ width: beamDim.width * 0.7, thickness: beamDim.thickness * 0.7 }}
        color={frameColor}
      />,
      <Beam
        key={`fink-left-${idx}`}
        start={new THREE.Vector3(-columnToColumnWidth / 2, wallHeight + beamOffset, z)}
        end={new THREE.Vector3(-columnToColumnWidth / 4, getRoofY(-columnToColumnWidth / 4), z)}
        dimensions={{ width: beamDim.width * 0.6, thickness: beamDim.thickness * 0.6 }}
        color={frameColor}
      />,
      <Beam
        key={`fink-right-${idx}`}
        start={new THREE.Vector3(columnToColumnWidth / 2, wallHeight + beamOffset, z)}
        end={new THREE.Vector3(columnToColumnWidth / 4, getRoofY(columnToColumnWidth / 4), z)}
        dimensions={{ width: beamDim.width * 0.6, thickness: beamDim.thickness * 0.6 }}
        color={frameColor}
      />
    );
    
    return elements;
  };

  // Ножницеобразная ферма
  const createScissorTruss = (z: number, idx: number) => {
    const elements: React.ReactElement[] = [];
    
    // Верхний пояс
    const leftTop = new THREE.Vector3(-columnToColumnWidth / 2, wallHeight + beamOffset, z);
    const centerTop = new THREE.Vector3(0, wallHeight + roofHeight + beamOffset, z);
    const rightTop = new THREE.Vector3(columnToColumnWidth / 2, wallHeight + beamOffset, z);
    
    elements.push(
      <Beam
        key={`scissor-top-left-${idx}`}
        start={leftTop}
        end={centerTop}
        dimensions={beamDim}
        color={frameColor}
      />,
      <Beam
        key={`scissor-top-right-${idx}`}
        start={centerTop}
        end={rightTop}
        dimensions={beamDim}
        color={frameColor}
      />
    );

    // Нижний пояс (ножницы)
    const leftBottom = new THREE.Vector3(-columnToColumnWidth / 2, wallHeight + roofHeight * 0.3 + beamOffset, z);
    const centerBottom = new THREE.Vector3(0, wallHeight + beamOffset, z);
    const rightBottom = new THREE.Vector3(columnToColumnWidth / 2, wallHeight + roofHeight * 0.3 + beamOffset, z);
    
    elements.push(
      <Beam
        key={`scissor-bottom-left-${idx}`}
        start={leftBottom}
        end={centerBottom}
        dimensions={beamDim}
        color={frameColor}
      />,
      <Beam
        key={`scissor-bottom-right-${idx}`}
        start={centerBottom}
        end={rightBottom}
        dimensions={beamDim}
        color={frameColor}
      />
    );

    // Вертикальные стойки
    const verticalCount = 5;
    for (let i = 0; i <= verticalCount; i++) {
      const t = i / verticalCount;
      const x = -columnToColumnWidth / 2 + t * columnToColumnWidth;
      const roofY = getRoofY(x);
      const bottomY = wallHeight + beamOffset + roofHeight * 0.3 * (1 - Math.abs(x) / (columnToColumnWidth / 2) * 0.7);
      
      elements.push(
        <Beam
          key={`scissor-vert-${idx}-${i}`}
          start={new THREE.Vector3(x, bottomY, z)}
          end={new THREE.Vector3(x, roofY, z)}
          dimensions={{ width: beamDim.width * 0.5, thickness: beamDim.thickness * 0.5 }}
          color={frameColor}
        />
      );
    }

    // Диагональные раскосы
    for (let i = 0; i < verticalCount; i++) {
      const t1 = i / verticalCount;
      const t2 = (i + 1) / verticalCount;
      
      const x1 = -columnToColumnWidth / 2 + t1 * columnToColumnWidth;
      const x2 = -columnToColumnWidth / 2 + t2 * columnToColumnWidth;
      
      const roofY1 = getRoofY(x1);
      const roofY2 = getRoofY(x2);
      const bottomY1 = wallHeight + beamOffset + roofHeight * 0.3 * (1 - Math.abs(x1) / (columnToColumnWidth / 2) * 0.7);
      const bottomY2 = wallHeight + beamOffset + roofHeight * 0.3 * (1 - Math.abs(x2) / (columnToColumnWidth / 2) * 0.7);
      
      elements.push(
        <Beam
          key={`scissor-diag1-${idx}-${i}`}
          start={new THREE.Vector3(x1, bottomY1, z)}
          end={new THREE.Vector3(x2, roofY2, z)}
          dimensions={{ width: beamDim.width * 0.4, thickness: beamDim.thickness * 0.4 }}
          color={frameColor}
        />,
        <Beam
          key={`scissor-diag2-${idx}-${i}`}
          start={new THREE.Vector3(x1, roofY1, z)}
          end={new THREE.Vector3(x2, bottomY2, z)}
          dimensions={{ width: beamDim.width * 0.4, thickness: beamDim.thickness * 0.4 }}
          color={frameColor}
        />
      );
    }
    
    return elements;
  };

  const generateTrusses = useMemo(() => {
    const elements: React.ReactElement[] = [];

    trussPositions.forEach((z, idx) => {
      // Первая и последняя фермы - всегда базовые
      if (idx === 0 || idx === trussPositions.length - 1) {
        elements.push(...createBaseTruss(z, idx));
      } else {
        // Промежуточные фермы - выбранного типа
        switch (trussType) {
          case 'reinforced':
            elements.push(...createReinforcedTruss(z, idx));
            break;
          case 'lattice':
            elements.push(...createLatticeTruss(z, idx));
            break;
          case 'pratt':
            elements.push(...createPrattTruss(z, idx));
            break;
          case 'howe':
            elements.push(...createHoweTruss(z, idx));
            break;
          case 'warren':
            elements.push(...createWarrenTruss(z, idx));
            break;
          case 'fink':
            elements.push(...createFinkTruss(z, idx));
            break;

          case 'simple':
          default:
            elements.push(...createSimpleTruss(z, idx));
            break;
        }
      }
    });
    
    return elements;
  }, [trussPositions, columnToColumnWidth, wallHeight, roofHeight, roofType, frameColor, beamDim, trussType, beamOffset]);

  return <>{generateTrusses}</>;
};

export default React.memo(WarehouseTrusses);