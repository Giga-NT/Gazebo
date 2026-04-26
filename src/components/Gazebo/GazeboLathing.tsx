/**
 * Copyright (c) 2026 Giga-NT (Григорьев Константин Владимирович)
 * Все права защищены.
 * 
 * License: Proprietary
 * См. LICENSE файл в корне проекта.
 */

import React, { useMemo } from 'react';
import * as THREE from 'three';
import { GazeboParams } from '../../types/gazeboTypes';
import Beam from '../Beams/Beam';
import {
  getTubeDimensions,
  calculateTrussPositions,
  getArchPoints3D,
  calculateTotalDimensions,
} from '../../utils/gazeboUtils';

const GazeboLathing: React.FC<{ params: GazeboParams }> = ({ params }) => {
  const { totalWidth } = calculateTotalDimensions(params.width, params.length, params.overhang);

  const trussPositions = useMemo(
    () => calculateTrussPositions(params.length, params.trussCount),
    [params.length, params.trussCount]
  );

  // Получаем размеры фермы (толщина может быть разной в зависимости от выбранного профиля)
  const trussDimensions = useMemo(() => {
    // Используем размер трубы из параметров фермы
    const tubeSize = (params as any).mainTubeSize || (params as any).tubeSize || '60x60';
    const dimensions = getTubeDimensions(tubeSize);
    console.log('Truss tube size:', tubeSize, 'Dimensions:', dimensions);
    return dimensions;
  }, [params]);

  // Получаем толщину фермы
  const trussThickness = useMemo(() => {
    const thickness = (trussDimensions as any).height || 
                      (trussDimensions as any).size || 
                      (trussDimensions as any).width || 
                      0.06;
    return thickness;
  }, [trussDimensions]);

  // Высота подъема обрешетки = ПОЛОВИНА высоты сечения фермы
  const lathingOffsetY = useMemo(() => {
    const offset = trussThickness / 1.2;
    console.log('Truss height:', trussThickness, 'Offset Y:', offset);
    return offset;
  }, [trussThickness]);

  // Функция для получения угла наклона крыши в точке X (в радианах)
  const getSlopeAngle = (x: number): number => {
    const extraWidth = (params.roofType === 'gable' || params.roofType === 'single') ? 0.8 : 0;
    const roofWidth = params.width + (params.overhang * 2) + extraWidth;
    const halfWidth = roofWidth / 2;
    const absX = Math.abs(x);
    
    switch (params.roofType) {
      case 'arched': {
        const t = (x + roofWidth / 2) / roofWidth;
        const angle = t * Math.PI;
        const slope = (params.roofHeight * Math.cos(angle) * Math.PI) / roofWidth;
        return Math.atan(slope);
      }
      
      case 'gable': {
        if (absX < 0.05) return 0;
        if (absX >= halfWidth) return 0;
        const slopeAngle = Math.atan2(params.roofHeight, halfWidth);
        return x > 0 ? -slopeAngle : slopeAngle;
      }
      
      case 'single': {
        const slopeAngle = Math.atan2(params.roofHeight, roofWidth);
        return slopeAngle;
      }
      
      default:
        return 0;
    }
  };

  const getRoofPoints = useMemo(() => {
    return (zPos: number): THREE.Vector3[] => {
      return getArchPoints3D(params.roofType, totalWidth, params.roofHeight, zPos, params.height, 12);
    };
  }, [params.roofType, totalWidth, params.roofHeight, params.height]);

  const lathingElements = useMemo(() => {
    if (params.lathingStep === 0) return null;

    const lathingDimensions = getTubeDimensions(params.lathingTubeSize);
    const lathingWidth = params.width + params.overhang * 2;
    const lathingCount = Math.ceil(lathingWidth / params.lathingStep) + 1;
    const step = lathingWidth / (lathingCount - 1);

    // Увеличиваем длину обрешетки на толщину фермы * 2
    // Обрешетка должна выступать за пределы крайних ферм
    const trussOffset = trussThickness * 2;
    const startZ = trussPositions[0] - trussOffset;
    const endZ = trussPositions[trussPositions.length - 1] + trussOffset;

    return Array.from({ length: lathingCount }).map((_, i) => {
      const xPos = -params.width / 2 - params.overhang + i * step;
      
      // Находим точки на первой и последней ферме
      const firstTrussPoints = getRoofPoints(trussPositions[0]);
      const lastTrussPoints = getRoofPoints(trussPositions[trussPositions.length - 1]);
      
      // Находим точную Y координату на первой ферме
      let yStart = params.height;
      for (let j = 0; j < firstTrussPoints.length - 1; j++) {
        if (xPos >= firstTrussPoints[j].x && xPos <= firstTrussPoints[j + 1].x) {
          const t = (xPos - firstTrussPoints[j].x) / (firstTrussPoints[j + 1].x - firstTrussPoints[j].x);
          yStart = firstTrussPoints[j].y + t * (firstTrussPoints[j + 1].y - firstTrussPoints[j].y);
          break;
        }
      }
      
      // Находим точную Y координату на последней ферме
      let yEnd = params.height;
      for (let j = 0; j < lastTrussPoints.length - 1; j++) {
        if (xPos >= lastTrussPoints[j].x && xPos <= lastTrussPoints[j + 1].x) {
          const t = (xPos - lastTrussPoints[j].x) / (lastTrussPoints[j + 1].x - lastTrussPoints[j].x);
          yEnd = lastTrussPoints[j].y + t * (lastTrussPoints[j + 1].y - lastTrussPoints[j].y);
          break;
        }
      }
      
      // Вычисляем угол наклона на начальной и конечной точке
      const slopeAngleStart = getSlopeAngle(xPos);
      const slopeAngleEnd = getSlopeAngle(xPos);
      
      // Для удлиненной обрешетки нужно рассчитать Y координаты на расширенных позициях
      // Используем ту же логику наклона, что и на фермах
      const getYAtZ = (zPos: number, baseY: number, slopeAngle: number): number => {
        // Обрешетка идет вдоль оси Z, поэтому Y не меняется по Z
        // Но если нужен уклон вдоль Z, можно добавить
        return baseY;
      };
      
      // Точки для удлиненной обрешетки
      const startPoint = new THREE.Vector3(
        xPos, 
        yStart + lathingOffsetY, 
        startZ
      );
      const endPoint = new THREE.Vector3(
        xPos, 
        yEnd + lathingOffsetY, 
        endZ
      );
      
      // Получаем угол наклона крыши в этой точке
      const slopeAngle = getSlopeAngle(xPos);
      
      // Расчет итогового поворота
      let finalRotation = Math.PI / 2;
      
      if (params.roofType === 'gable') {
        const extraWidth = 0.8;
        const roofWidth = params.width + (params.overhang * 2) + extraWidth;
        const halfWidth = roofWidth / 2;
        const absX = Math.abs(xPos);
        
        if (absX > 0.1 && absX < halfWidth - 0.1) {
          finalRotation += slopeAngle;
        } else {
          finalRotation = Math.PI / 2;
        }
      } else if (params.roofType === 'single') {
        finalRotation += slopeAngle;
      } else if (params.roofType === 'arched') {
        finalRotation += slopeAngle;
      }
      
      return (
        <Beam
          key={`lathing-${i}`}
          start={startPoint}
          end={endPoint}
          dimensions={lathingDimensions}
          rotationOffset={finalRotation}
          color={params.color}
        />
      );
    });
  }, [params, trussPositions, lathingOffsetY, trussThickness, getRoofPoints]);

  return <>{lathingElements}</>;
};

export default React.memo(GazeboLathing);