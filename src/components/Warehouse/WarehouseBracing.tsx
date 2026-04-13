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
import Beam from '../Beams/Beam';

const WarehouseBracing: React.FC<{ params: WarehouseParams }> = ({ params }) => {
  const {
    length,
    width,
    wallHeight,
    columnSpacing,
    bracingType,
    frameColor,
    gateType,
    gatePosition,
    gateSide = 'left',
    gateWidth = 3,
    gateHeight = 3,
    doorCount = 0,
  } = params;

  const colPositions = useMemo(() => {
    if (bracingType === 'none') return [];
    const positions: number[] = [];
    const colCount = Math.max(2, Math.ceil(length / columnSpacing) + 1);
    const step = length / (colCount - 1);
    for (let i = 0; i < colCount; i++) {
      positions.push(-length / 2 + i * step);
    }
    return positions;
  }, [length, columnSpacing, bracingType]);

  // Функция проверки, находится ли точка в зоне ворот
  const isInGateArea = (x: number, z: number, side: string): boolean => {
    if (gateType === 'none') return false;
    
    const gateHalfWidth = gateWidth / 2;
    const gateBottom = 0;
    const gateTop = gateHeight;
    
    // Проверяем по сторонам
    if (side === 'front' && (gatePosition === 'front' || gatePosition === 'both')) {
      return Math.abs(z + length/2) < 0.5 && Math.abs(x) < gateHalfWidth;
    }
    if (side === 'back' && (gatePosition === 'back' || gatePosition === 'both')) {
      return Math.abs(z - length/2) < 0.5 && Math.abs(x) < gateHalfWidth;
    }
    if (side === 'left' && gatePosition === 'side' && (gateSide === 'left' || gateSide === 'both_sides')) {
      return Math.abs(x + width/2) < 0.5 && Math.abs(z) < gateHalfWidth;
    }
    if (side === 'right' && gatePosition === 'side' && (gateSide === 'right' || gateSide === 'both_sides')) {
      return Math.abs(x - width/2) < 0.5 && Math.abs(z) < gateHalfWidth;
    }
    
    return false;
  };

  // Функция проверки, находится ли точка в зоне двери
  const isInDoorArea = (x: number, z: number, y: number, side: string): boolean => {
    if (doorCount === 0) return false;
    
    // Здесь можно добавить более сложную логику для дверей
    // Пока просто проверяем нижнюю часть стен
    return y < 2.3; // Высота двери
  };

  if (bracingType === 'none') return null;

  const elements: React.ReactElement[] = [];

  // ВЕРТИКАЛЬНЫЕ СВЯЗИ (крестовые)
  if (bracingType === 'cross' || bracingType === 'vertical' || bracingType === 'combined') {
    colPositions.forEach((z, idx) => {
      if (idx === colPositions.length - 1) return;
      const z1 = z;
      const z2 = colPositions[idx + 1];
      const midZ = (z1 + z2) / 2;
      const midY = wallHeight / 2;

      // Левая стена
      const leftX = -width / 2;
      if (!isInGateArea(leftX, z1, 'left') && !isInGateArea(leftX, z2, 'left')) {
        elements.push(
          <Beam
            key={`cross-left-${idx}-a`}
            start={new THREE.Vector3(leftX, 0, z1)}
            end={new THREE.Vector3(leftX, wallHeight, z2)}
            dimensions={{ width: 0.06, thickness: 0.06 }}
            color={frameColor}
          />,
          <Beam
            key={`cross-left-${idx}-b`}
            start={new THREE.Vector3(leftX, wallHeight, z1)}
            end={new THREE.Vector3(leftX, 0, z2)}
            dimensions={{ width: 0.06, thickness: 0.06 }}
            color={frameColor}
          />
        );
      }

      // Правая стена
      const rightX = width / 2;
      if (!isInGateArea(rightX, z1, 'right') && !isInGateArea(rightX, z2, 'right')) {
        elements.push(
          <Beam
            key={`cross-right-${idx}-a`}
            start={new THREE.Vector3(rightX, 0, z1)}
            end={new THREE.Vector3(rightX, wallHeight, z2)}
            dimensions={{ width: 0.06, thickness: 0.06 }}
            color={frameColor}
          />,
          <Beam
            key={`cross-right-${idx}-b`}
            start={new THREE.Vector3(rightX, wallHeight, z1)}
            end={new THREE.Vector3(rightX, 0, z2)}
            dimensions={{ width: 0.06, thickness: 0.06 }}
            color={frameColor}
          />
        );
      }

      // Торцевые стены
      if (idx === 0) {
        const frontZ = -length / 2;
        if (!isInGateArea(0, frontZ, 'front')) {
          elements.push(
            <Beam
              key={`cross-front-${idx}-a`}
              start={new THREE.Vector3(-width/2, 0, frontZ)}
              end={new THREE.Vector3(width/2, wallHeight, frontZ)}
              dimensions={{ width: 0.06, thickness: 0.06 }}
              color={frameColor}
            />,
            <Beam
              key={`cross-front-${idx}-b`}
              start={new THREE.Vector3(-width/2, wallHeight, frontZ)}
              end={new THREE.Vector3(width/2, 0, frontZ)}
              dimensions={{ width: 0.06, thickness: 0.06 }}
              color={frameColor}
            />
          );
        }
      }
      
      if (idx === colPositions.length - 2) {
        const backZ = length / 2;
        if (!isInGateArea(0, backZ, 'back')) {
          elements.push(
            <Beam
              key={`cross-back-${idx}-a`}
              start={new THREE.Vector3(-width/2, 0, backZ)}
              end={new THREE.Vector3(width/2, wallHeight, backZ)}
              dimensions={{ width: 0.06, thickness: 0.06 }}
              color={frameColor}
            />,
            <Beam
              key={`cross-back-${idx}-b`}
              start={new THREE.Vector3(-width/2, wallHeight, backZ)}
              end={new THREE.Vector3(width/2, 0, backZ)}
              dimensions={{ width: 0.06, thickness: 0.06 }}
              color={frameColor}
            />
          );
        }
      }
    });
  }

  // ГОРИЗОНТАЛЬНЫЕ СВЯЗИ
  if (bracingType === 'horizontal' || bracingType === 'combined') {
    const horizY = wallHeight * 0.8; // уровень горизонтальных связей
    
    colPositions.forEach((z, idx) => {
      if (idx === colPositions.length - 1) return;
      const z1 = z;
      const z2 = colPositions[idx + 1];
      
      // Левая стена
      const leftX = -width / 2;
      if (!isInGateArea(leftX, z1, 'left') && !isInGateArea(leftX, z2, 'left')) {
        elements.push(
          <Beam
            key={`horiz-left-${idx}`}
            start={new THREE.Vector3(leftX, horizY, z1)}
            end={new THREE.Vector3(leftX, horizY, z2)}
            dimensions={{ width: 0.05, thickness: 0.05 }}
            color={frameColor}
          />
        );
      }

      // Правая стена
      const rightX = width / 2;
      if (!isInGateArea(rightX, z1, 'right') && !isInGateArea(rightX, z2, 'right')) {
        elements.push(
          <Beam
            key={`horiz-right-${idx}`}
            start={new THREE.Vector3(rightX, horizY, z1)}
            end={new THREE.Vector3(rightX, horizY, z2)}
            dimensions={{ width: 0.05, thickness: 0.05 }}
            color={frameColor}
          />
        );
      }
    });
  }

  // ПОРТАЛЬНЫЕ СВЯЗИ
  if (bracingType === 'portal' || bracingType === 'combined') {
    colPositions.forEach((z, idx) => {
      if (idx === colPositions.length - 1 || idx % 3 !== 0) return; // Каждый третий пролет
      
      const z1 = z;
      const z2 = colPositions[idx + 1];
      
      const portalHeight = wallHeight * 0.3;

      // Левая стена
      const leftX = -width / 2;
      if (!isInGateArea(leftX, z1, 'left') && !isInGateArea(leftX, z2, 'left')) {
        elements.push(
          <Beam
            key={`portal-left-${idx}-horiz`}
            start={new THREE.Vector3(leftX, portalHeight, z1)}
            end={new THREE.Vector3(leftX, portalHeight, z2)}
            dimensions={{ width: 0.08, thickness: 0.08 }}
            color={frameColor}
          />,
          <Beam
            key={`portal-left-${idx}-vert1`}
            start={new THREE.Vector3(leftX, 0, z1)}
            end={new THREE.Vector3(leftX, portalHeight, z1)}
            dimensions={{ width: 0.08, thickness: 0.08 }}
            color={frameColor}
          />,
          <Beam
            key={`portal-left-${idx}-vert2`}
            start={new THREE.Vector3(leftX, 0, z2)}
            end={new THREE.Vector3(leftX, portalHeight, z2)}
            dimensions={{ width: 0.08, thickness: 0.08 }}
            color={frameColor}
          />
        );
      }

      // Правая стена
      const rightX = width / 2;
      if (!isInGateArea(rightX, z1, 'right') && !isInGateArea(rightX, z2, 'right')) {
        elements.push(
          <Beam
            key={`portal-right-${idx}-horiz`}
            start={new THREE.Vector3(rightX, portalHeight, z1)}
            end={new THREE.Vector3(rightX, portalHeight, z2)}
            dimensions={{ width: 0.08, thickness: 0.08 }}
            color={frameColor}
          />,
          <Beam
            key={`portal-right-${idx}-vert1`}
            start={new THREE.Vector3(rightX, 0, z1)}
            end={new THREE.Vector3(rightX, portalHeight, z1)}
            dimensions={{ width: 0.08, thickness: 0.08 }}
            color={frameColor}
          />,
          <Beam
            key={`portal-right-${idx}-vert2`}
            start={new THREE.Vector3(rightX, 0, z2)}
            end={new THREE.Vector3(rightX, portalHeight, z2)}
            dimensions={{ width: 0.08, thickness: 0.08 }}
            color={frameColor}
          />
        );
      }
    });
  }

  // СТОЙКИ ФАХВЕРКА (только на торцевых стенах, с проверкой проемов)
  if (bracingType === 'fachwerk' || bracingType === 'combined') {
    const fachwerkSpacing = 2.0;
    
    // Передняя стена
    const frontZ = -length / 2;
    if (!isInGateArea(0, frontZ, 'front')) {
      const fachwerkCount = Math.floor(width / fachwerkSpacing) + 1;
      
      for (let i = 0; i < fachwerkCount; i++) {
        const x = -width/2 + i * fachwerkSpacing;
        if (x > width/2) break;
        
        // Пропускаем зону ворот
        if (Math.abs(x) < gateWidth/2) continue;
        
        // Вертикальная стойка фахверка
        elements.push(
          <Beam
            key={`fachwerk-front-${i}`}
            start={new THREE.Vector3(x, 0, frontZ)}
            end={new THREE.Vector3(x, wallHeight, frontZ)}
            dimensions={{ width: 0.08, thickness: 0.08 }}
            color={frameColor}
          />
        );
        
        // Горизонтальные ригели
        if (i > 0) {
          const prevX = -width/2 + (i-1) * fachwerkSpacing;
          if (Math.abs(prevX) < gateWidth/2 || Math.abs(x) < gateWidth/2) continue;
          
          elements.push(
            <Beam
              key={`fachwerk-front-horiz-${i}`}
              start={new THREE.Vector3(prevX, wallHeight * 0.5, frontZ)}
              end={new THREE.Vector3(x, wallHeight * 0.5, frontZ)}
              dimensions={{ width: 0.06, thickness: 0.06 }}
              color={frameColor}
            />,
            <Beam
              key={`fachwerk-front-horiz2-${i}`}
              start={new THREE.Vector3(prevX, wallHeight * 0.8, frontZ)}
              end={new THREE.Vector3(x, wallHeight * 0.8, frontZ)}
              dimensions={{ width: 0.06, thickness: 0.06 }}
              color={frameColor}
            />
          );
        }
      }
    }

    // Задняя стена
    const backZ = length / 2;
    if (!isInGateArea(0, backZ, 'back')) {
      const fachwerkCount = Math.floor(width / fachwerkSpacing) + 1;
      
      for (let i = 0; i < fachwerkCount; i++) {
        const x = -width/2 + i * fachwerkSpacing;
        if (x > width/2) break;
        
        if (Math.abs(x) < gateWidth/2) continue;
        
        elements.push(
          <Beam
            key={`fachwerk-back-${i}`}
            start={new THREE.Vector3(x, 0, backZ)}
            end={new THREE.Vector3(x, wallHeight, backZ)}
            dimensions={{ width: 0.08, thickness: 0.08 }}
            color={frameColor}
          />
        );
        
        if (i > 0) {
          const prevX = -width/2 + (i-1) * fachwerkSpacing;
          if (Math.abs(prevX) < gateWidth/2 || Math.abs(x) < gateWidth/2) continue;
          
          elements.push(
            <Beam
              key={`fachwerk-back-horiz-${i}`}
              start={new THREE.Vector3(prevX, wallHeight * 0.5, backZ)}
              end={new THREE.Vector3(x, wallHeight * 0.5, backZ)}
              dimensions={{ width: 0.06, thickness: 0.06 }}
              color={frameColor}
            />,
            <Beam
              key={`fachwerk-back-horiz2-${i}`}
              start={new THREE.Vector3(prevX, wallHeight * 0.8, backZ)}
              end={new THREE.Vector3(x, wallHeight * 0.8, backZ)}
              dimensions={{ width: 0.06, thickness: 0.06 }}
              color={frameColor}
            />
          );
        }
      }
    }
  }

  // РАСПОРКИ
  if (bracingType === 'spacer' || bracingType === 'combined') {
    const spacerCount = 2;
    const spacerPositions = [];
    for (let i = 0; i < spacerCount; i++) {
      spacerPositions.push(-length/2 + (length / (spacerCount + 1)) * (i + 1));
    }
    
    spacerPositions.forEach((z, idx) => {
      elements.push(
        <Beam
          key={`spacer-${idx}`}
          start={new THREE.Vector3(-width/2, wallHeight, z)}
          end={new THREE.Vector3(width/2, wallHeight, z)}
          dimensions={{ width: 0.07, thickness: 0.07 }}
          color={frameColor}
        />
      );
    });
  }

  return <>{elements}</>;
};

export default React.memo(WarehouseBracing);