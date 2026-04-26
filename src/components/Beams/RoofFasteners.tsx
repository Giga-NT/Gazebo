import React, { useMemo } from 'react';
import * as THREE from 'three';
import { CanopyParams } from '../../types/types';

interface RoofFastenersProps {
  params: CanopyParams;
}

const RoofFasteners: React.FC<RoofFastenersProps> = ({ params }) => {
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

  const lathingStep = params.lathingStep;
  const roofTubeDimensions = getTubeDimensions(params.roofTubeSize);
  const upperChordHeight = roofTubeDimensions.thickness;
  const lathingDimensions = getTubeDimensions(params.lathingTubeSize);
  const lathingHeight = lathingDimensions.thickness;
  
  // Подъём обрешетки
  const lathingOffset = upperChordHeight / 2 + lathingHeight / 2 + 0.003;
  
  // Параметры волны профнастила
  const profiledSheet = {
    waveWidth: 0.30,   // Шаг волны
    waveHeight: 0.035, // Высота волны
    flatTop: 0.10,     // Ширина плоской вершины
    flatBottom: 0.14,  // Ширина плоского низа
  };
  
  // Параметры черепицы
  const tileSheet = {
    width: 0.25,       // Ширина черепицы
    height: 0.30,      // Высота ряда
    overlap: 0.03,     // Нахлест
  };
  
  // Цвет самореза
  const screwColor = params.roofMaterial === 'polycarbonate' ? '#FFFFFF' : '#FFD700';
  const washerColor = params.roofMaterial === 'polycarbonate' ? '#DDDDDD' : '#FFA500';

  // Функция проверки - находится ли точка в нижней части волны профнастила
  const isInWaveBottom = (z: number): boolean => {
    const roofLength = params.length + (params.overhang * 2);
    const wavePos = ((z + roofLength / 2) % profiledSheet.waveWidth + profiledSheet.waveWidth) % profiledSheet.waveWidth;
    const t = wavePos / profiledSheet.waveWidth;
    
    const topW = profiledSheet.flatTop / profiledSheet.waveWidth;
    const botW = profiledSheet.flatBottom / profiledSheet.waveWidth;
    const wallW = (1 - topW - botW) / 2;
    
    const endBot = botW;
    const endTop = botW + wallW + topW;
    
    return t < endBot || t > endTop;
  };

  // Функция получения центра нижней части волны профнастила
  const getWaveBottomCenter = (startZ: number): number => {
    const roofLength = params.length + (params.overhang * 2);
    const waveWidth = profiledSheet.waveWidth;
    const flatBottom = profiledSheet.flatBottom;
    
    // Находим начало волны
    const waveStart = Math.floor((startZ + roofLength / 2) / waveWidth) * waveWidth - roofLength / 2;
    // Центр нижней части волны
    return waveStart + (waveWidth - flatBottom) / 2 + flatBottom / 2;
  };

  // Функция получения позиции для черепицы (по центру)
  const getTileCenter = (z: number): number => {
    const roofLength = params.length + (params.overhang * 2);
    const tileWidth = tileSheet.width;
    
    const tileNumber = Math.floor((z + roofLength / 2) / tileWidth);
    return tileNumber * tileWidth + tileWidth / 2 - roofLength / 2;
  };

  // Функция получения ВЕРХНЕЙ точки кровли
  const getRoofTopY = (x: number, z: number): number => {
    const roofWidth = params.width + (params.overhang * 2);
    const t = (x + roofWidth / 2) / roofWidth;
    
    let baseY = 0;
    switch (params.roofType) {
      case 'arch': {
        const angle = t * Math.PI;
        baseY = params.height + params.roofHeight * Math.sin(angle);
        break;
      }
      case 'gable': {
        const halfWidth = roofWidth / 2;
        const absX = Math.abs(x);
        if (absX <= halfWidth) {
          const t2 = absX / halfWidth;
          baseY = params.height + params.roofHeight * (1 - t2);
        } else {
          baseY = params.height;
        }
        break;
      }
      case 'shed': {
        baseY = params.height + t * params.roofHeight;
        break;
      }
      case 'flat':
      default:
        baseY = params.height;
    }
    
    const coverThickness = 0.008;
    return baseY + lathingOffset + lathingHeight / 2 + coverThickness + 0.002;
  };

  // Функция получения угла наклона
  const getRoofAngle = (x: number): number => {
    const roofWidth = params.width + (params.overhang * 2);
    const delta = 0.05;
    const x1 = Math.max(-roofWidth / 2, x - delta);
    const x2 = Math.min(roofWidth / 2, x + delta);
    
    const getY = (xp: number) => {
      const t = (xp + roofWidth / 2) / roofWidth;
      switch (params.roofType) {
        case 'arch': return params.height + params.roofHeight * Math.sin(t * Math.PI);
        case 'gable': {
          const halfWidth = roofWidth / 2;
          const absXp = Math.abs(xp);
          if (absXp <= halfWidth) return params.height + params.roofHeight * (1 - absXp / halfWidth);
          return params.height;
        }
        case 'shed': return params.height + t * params.roofHeight;
        default: return params.height;
      }
    };
    
    const y1 = getY(x1);
    const y2 = getY(x2);
    return Math.atan2(y2 - y1, x2 - x1);
  };

  // Генерация позиций для саморезов
// Генерация позиций для саморезов
const fastenerPositions = useMemo(() => {
  if (lathingStep === 0) return [];
  
  const positions: { x: number; z: number; angle: number }[] = [];
  const roofWidth = params.width + (params.overhang * 2);
  const roofLength = params.length + (params.overhang * 2);
  
  // СМЕЩЕНИЕ ВПРАВО НА 2 СМ (0.02 МЕТРА)
  // ✏️ МЕНЯЙТЕ ЭТО ЗНАЧЕНИЕ ЗДЕСЬ
  const zOffset = 0.06;  // 2 см вправо. Для влево поставьте отрицательное значение -0.02
  
  // Количество обрешетин = количество рядов саморезов
  const lathingCount = Math.ceil(roofWidth / lathingStep) + 1;
  const stepX = roofWidth / (lathingCount - 1);
  
  // Отступ от края
  const edgeMargin = 0.05;
  
  // ========== ПОЛИКАРБОНАТ ==========
  if (params.roofMaterial === 'polycarbonate') {
    const screwsSpacing = 0.45;
    const effectiveLength = roofLength - edgeMargin * 2;
    const screwsPerLathing = Math.max(2, Math.floor(effectiveLength / screwsSpacing) + 1);
    const stepZ = effectiveLength / (screwsPerLathing - 1);
    const startZ = -roofLength / 2 + edgeMargin + zOffset;  // ← ДОБАВЛЕН zOffset
    
    for (let i = 0; i < lathingCount; i++) {
      const xPos = -roofWidth / 2 + i * stepX;
      const angle = getRoofAngle(xPos);
      
      for (let j = 0; j < screwsPerLathing; j++) {
        const zPos = startZ + j * stepZ;
        positions.push({ x: xPos, z: zPos, angle });
      }
    }
  }
  // ========== ЧЕРЕПИЦА ==========
  else if (params.roofMaterial === 'tile') {
    const tileWidth = tileSheet.width;
    
    // Находим все центры черепиц по длине
    const tileCenters: number[] = [];
    let currentZ = -roofLength / 2 + tileWidth / 2 + zOffset;  // ← ДОБАВЛЕН zOffset
    while (currentZ <= roofLength / 2 - edgeMargin) {
      if (currentZ >= -roofLength / 2 + edgeMargin) {
        tileCenters.push(currentZ);
      }
      currentZ += tileWidth;
    }
    
    for (let i = 0; i < lathingCount; i++) {
      const xPos = -roofWidth / 2 + i * stepX;
      const angle = getRoofAngle(xPos);
      
      for (const zPos of tileCenters) {
        positions.push({ x: xPos, z: zPos, angle });
      }
    }
  }
  // ========== ПРОФНАСТИЛ ==========
  else {
    const waveWidth = profiledSheet.waveWidth;
    
    // Находим все центры нижних частей волн
    const waveCenters: number[] = [];
    let currentZ = -roofLength / 2 + waveWidth / 2 + zOffset;  // ← ДОБАВЛЕН zOffset
    while (currentZ <= roofLength / 2 - edgeMargin) {
      if (currentZ >= -roofLength / 2 + edgeMargin && isInWaveBottom(currentZ)) {
        waveCenters.push(currentZ);
      }
      currentZ += waveWidth / 2;
    }
    
    for (let i = 0; i < lathingCount; i++) {
      const xPos = -roofWidth / 2 + i * stepX;
      const angle = getRoofAngle(xPos);
      
      for (const zPos of waveCenters) {
        positions.push({ x: xPos, z: zPos, angle });
      }
    }
  }
  
  return positions;
}, [params, lathingStep]);
  // Создаем саморез с шайбой
  const createFastener = (x: number, z: number, angle: number, index: number) => {
    const y = getRoofTopY(x, z);
    const isPolycarbonate = params.roofMaterial === 'polycarbonate';
    
    const screwHeadRadius = 0.008;
    const screwHeadHeight = 0.003;
    const washerRadius = 0.012;
    const washerHeight = 0.0015;
    
    return (
      <group key={`fastener-${index}`} position={[x, y, z]} rotation={[0, 0, angle]}>
        {/* Шайба */}
        <mesh castShadow>
          <cylinderGeometry 
            args={[
              isPolycarbonate ? washerRadius + 0.003 : washerRadius, 
              isPolycarbonate ? washerRadius + 0.003 : washerRadius, 
              washerHeight, 
              24
            ]} 
          />
          <meshStandardMaterial 
            color={isPolycarbonate ? washerColor : screwColor} 
            metalness={0.7} 
            roughness={0.3}
          />
        </mesh>
        
        {/* Головка самореза */}
        <mesh position={[0, 0, washerHeight / 2 + screwHeadHeight / 2]} castShadow>
          <cylinderGeometry args={[screwHeadRadius, screwHeadRadius, screwHeadHeight, 6]} />
          <meshStandardMaterial 
            color={screwColor} 
            metalness={0.9} 
            roughness={0.2}
          />
        </mesh>
      </group>
    );
  };

  return (
    <group>
      {fastenerPositions.map((pos, idx) => createFastener(pos.x, pos.z, pos.angle, idx))}
    </group>
  );
};

export default React.memo(RoofFasteners);