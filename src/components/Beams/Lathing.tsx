import React, { useMemo } from 'react';
import * as THREE from 'three';
import { CanopyParams } from '../../types/types';

const Lathing: React.FC<{ params: CanopyParams }> = ({ params }) => {
  const getTubeDimensions = (size: string) => {
    const dimensions: Record<string, { width: number; thickness: number }> = {
      '40x20': { width: 0.04, thickness: 0.02 },
      '40x40': { width: 0.04, thickness: 0.04 },
      '50x50': { width: 0.05, thickness: 0.05 },
      '60x60': { width: 0.06, thickness: 0.06 },
      '80x80': { width: 0.08, thickness: 0.08 },
      '100x100': { width: 0.1, thickness: 0.1 },
    };
    return dimensions[size] || { width: 0.04, thickness: 0.02 };
  };

  const lathingDimensions = getTubeDimensions(params.lathingTubeSize);
  
  // Размер трубы верхнего пояса (на который опирается обрешетка)
  const roofTubeDimensions = getTubeDimensions(params.roofTubeSize);
  const upperChordHeight = roofTubeDimensions.thickness;
  
  // Труба обрешетки: ширина (по X), высота (по Y), длина (по Z)
  const tubeWidth = lathingDimensions.width;
  const tubeHeight = lathingDimensions.thickness;
  
  // Длина обрешетки = полная длина навеса + выступ за фермы
  const trussThickness = upperChordHeight;
  const trussOffset = trussThickness * 6; // Выступ на толщину фермы с каждой стороны
  const tubeDepth = params.length + trussOffset;

  // Подъём обрешетки: половина толщины верхнего пояса + половина толщины обрешетки
  const yOffset = upperChordHeight / 2 + tubeHeight / 2 + 0.003;

  // Функция получения высоты верхнего пояса в точке X
  // Функция получения высоты ОСНОВНОГО ската
  const getRoofY = (x: number): number => {
    const roofWidth = params.width + (params.overhang * 2);
    const t = (x + roofWidth / 2) / roofWidth;
    
    switch (params.roofType) {
      case 'arch':
        const angle = t * Math.PI;
        return params.height + params.roofHeight * Math.sin(angle);
      
      case 'gable': {
        const halfWidth = roofWidth / 2;
        const absX = Math.abs(x);
        if (absX <= halfWidth) {
          const t2 = absX / halfWidth;
          return params.height + params.roofHeight * (1 - t2);
        }
        return params.height;
      }
      
      case 'shed':
        return params.height + t * params.roofHeight;
      
      case 'flat':
        return params.height; // Плоская крыша - постоянная высота
      
      default:
        return params.height + params.roofHeight;
    }
  };

  // Функция получения угла наклона в точке X
  const getRoofAngleAt = (x: number): number => {
    const roofWidth = params.width + (params.overhang * 2);
    const delta = 0.05;
    const x1 = Math.max(-roofWidth / 2, x - delta);
    const x2 = Math.min(roofWidth / 2, x + delta);
    const y1 = getRoofY(x1);
    const y2 = getRoofY(x2);
    return Math.atan2(y2 - y1, x2 - x1);
  };

  // Создаём обрешетку
  const lathingElements = useMemo(() => {
    if (params.lathingStep === 0) return [];
    
    const elements: React.ReactElement[] = [];
    const roofWidth = params.width + (params.overhang * 2);
    const lathingCount = Math.ceil(roofWidth / params.lathingStep) + 1;
    const stepX = roofWidth / (lathingCount - 1);
    
    for (let i = 0; i < lathingCount; i++) {
      const xPos = -roofWidth / 2 + i * stepX;
      const yPos = getRoofY(xPos) + yOffset;
      const angle = getRoofAngleAt(xPos);
      
      // Для разных типов крыш корректируем угол поворота
      let finalAngle = angle;
      
      if (params.roofType === 'gable') {
        const halfWidth = roofWidth / 2;
        const absX = Math.abs(xPos);
        // На коньке (центр) угол = 0
        if (absX < 0.1) {
          finalAngle = 0;
        }
      } else if (params.roofType === 'shed') {
        // Односкатная - постоянный угол, но делаем его чуть меньше для лучшего вида
        finalAngle = angle * 0.8;
      }
      
      const geometry = new THREE.BoxGeometry(tubeWidth, tubeHeight, tubeDepth);
      const material = new THREE.MeshStandardMaterial({ 
        color: new THREE.Color(params.frameColor),
        metalness: 0.5,
        roughness: 0.7
      });
      
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(xPos, yPos, 0);
      mesh.castShadow = true;
      mesh.rotation.z = finalAngle;
      
      elements.push(<primitive key={`lathing-${i}`} object={mesh} />);
    }
    
    return elements;
  }, [params, tubeWidth, tubeHeight, tubeDepth, yOffset]);

  return <>{lathingElements}</>;
};

export default React.memo(Lathing);