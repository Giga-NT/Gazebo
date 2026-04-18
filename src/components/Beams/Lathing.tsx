import React, { useMemo } from 'react';
import * as THREE from 'three';
import { CanopyParams } from '../../types/types';
import Beam from './Beam';

const Lathing: React.FC<{ params: CanopyParams }> = ({ params }) => {
  const getTubeDimensions = (size: string) => {
    const dimensions = {
      '40x20': { width: 0.04, thickness: 0.02 },
      '40x40': { width: 0.04, thickness: 0.04 },
      '50x50': { width: 0.05, thickness: 0.05 },
      '60x60': { width: 0.06, thickness: 0.06 }
    }[size];
    return dimensions || { width: 0.04, thickness: 0.02 };
  };

  const roofTubeDimensions = getTubeDimensions(params.roofTubeSize);
  const lathingDimensions = getTubeDimensions(params.lathingTubeSize);
  
  // Обрешетка лежит ПОВЕРХ верхнего пояса
  const yOffset = roofTubeDimensions.thickness / 2 + lathingDimensions.thickness / 2;

  // Позиции всех ферм
  const trussPositions = useMemo(() => {
    const positions: number[] = [];
    if (params.trussCount === 1) {
      positions.push(0);
    } else {
      const step = params.length / (params.trussCount - 1);
      for (let i = 0; i < params.trussCount; i++) {
        positions.push(-params.length / 2 + i * step);
      }
    }
    return positions;
  }, [params.length, params.trussCount]);

  // Функция для получения точек верхнего пояса арки
  const getArcPoints = (zPos: number): THREE.Vector3[] => {
    const roofWidth = params.width + (params.overhang * 2);
    const points: THREE.Vector3[] = [];
    const segments = 50;
    
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const angle = t * Math.PI;
      const x = -roofWidth / 2 + (roofWidth * t);
      const y = params.roofHeight * Math.sin(angle);
      
      // Точка на верхнем поясе со смещением
      points.push(new THREE.Vector3(x, params.height + y + yOffset, zPos));
    }
    
    return points;
  };

  // Получаем точки для всех ферм
  const allArcPoints = useMemo(() => {
    return trussPositions.map(zPos => getArcPoints(zPos));
  }, [trussPositions, params, yOffset]);

  const lathingElements = useMemo(() => {
    // Проверяем, что это арка (любого типа)
    const isArch = params.roofType === 'arch' && 
      (params.trussType === 'arched_narrow' || params.trussType === 'reinforced' || params.trussType === 'simple');
    
    if (params.lathingStep === 0 || !isArch) return null;

    const roofWidth = params.width + (params.overhang * 2);
    const lathingCount = Math.ceil(roofWidth / params.lathingStep) + 1;
    const stepX = roofWidth / (lathingCount - 1);
    
    const elements: React.ReactElement[] = [];

    // Для каждого X создаем балку обрешетки
    for (let i = 0; i < lathingCount; i++) {
      const xPos = -roofWidth / 2 + i * stepX;
      
      // Собираем точки на всех фермах для этого X
      const pointsAtX: { z: number; point: THREE.Vector3 }[] = [];
      
      for (let tIdx = 0; tIdx < trussPositions.length; tIdx++) {
        const arcPoints = allArcPoints[tIdx];
        const zPos = trussPositions[tIdx];
        
        // Находим Y для данного X на этой ферме
        let yPos = params.height + yOffset;
        for (let j = 0; j < arcPoints.length - 1; j++) {
          const p1 = arcPoints[j];
          const p2 = arcPoints[j + 1];
          if (xPos >= p1.x && xPos <= p2.x) {
            const t = (xPos - p1.x) / (p2.x - p1.x);
            yPos = p1.y + t * (p2.y - p1.y);
            break;
          }
        }
        
        pointsAtX.push({ z: zPos, point: new THREE.Vector3(xPos, yPos, zPos) });
      }
      
      // Создаем балки между соседними фермами
      for (let s = 0; s < pointsAtX.length - 1; s++) {
        const start = pointsAtX[s].point;
        const end = pointsAtX[s + 1].point;
        
        if (start.distanceTo(end) > 0.01) {
          elements.push(
            <Beam
              key={`lathing-${i}-${s}`}
              start={start}
              end={end}
              dimensions={lathingDimensions}
              rotationOffset={Math.PI / 2}
              color={params.frameColor}
            />
          );
        }
      }
    }
    
    return elements;
  }, [params, trussPositions, allArcPoints, lathingDimensions, yOffset]);

  return <>{lathingElements}</>;
};

export default Lathing;