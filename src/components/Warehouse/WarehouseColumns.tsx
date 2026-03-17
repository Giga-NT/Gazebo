import React, { useMemo } from 'react';
import * as THREE from 'three';
import Beam from '../Beams/Beam';
import { WarehouseParams } from '../../types/warehouseTypes';

const WarehouseColumns: React.FC<{ params: WarehouseParams }> = ({ params }) => {
  const { 
    length, 
    width, 
    wallHeight, 
    roofHeight,
    roofType,
    columnSpacing, 
    columnSize, 
    frameColor 
  } = params;

  // Перевод размера колонны в метры
  const getColumnDim = (size: string) => {
    const mm = parseInt(size.split('x')[0]) / 1000;
    return { w: mm, d: mm };
  };
  const colDim = getColumnDim(columnSize);

  // Количество колонн по длине (включая углы)
  const colCountLength = Math.max(2, Math.ceil(length / columnSpacing) + 1);
  const stepLength = length / (colCountLength - 1);

  // По ширине – только две стороны
  const positions = useMemo(() => {
    const pos: { x: number; z: number; side: 'left' | 'right' }[] = [];
    for (let i = 0; i < colCountLength; i++) {
      const zPos = -length / 2 + i * stepLength;
      // Левая стена
      pos.push({ x: -width / 2, z: zPos, side: 'left' });
      // Правая стена
      pos.push({ x: width / 2, z: zPos, side: 'right' });
    }
    return pos;
  }, [colCountLength, length, width, stepLength]);

  // Определяем высокую сторону для односкатной крыши
  const isHighSide = (side: 'left' | 'right'): boolean => {
    if (roofType !== 'single') return false;
    // Высокая сторона - правая стена (положительная X)
    return side === 'right';
  };

  return (
    <>
      {positions.map((pos, idx) => {
        // Для высокой стороны увеличиваем высоту колонны
        const columnHeight = isHighSide(pos.side) ? wallHeight + roofHeight : wallHeight;
        
        return (
          <Beam
            key={`col-${idx}`}
            start={new THREE.Vector3(pos.x, 0, pos.z)}
            end={new THREE.Vector3(pos.x, columnHeight, pos.z)}
            dimensions={{ width: colDim.w, thickness: colDim.d }}
            color={frameColor}
          />
        );
      })}
    </>
  );
};

export default React.memo(WarehouseColumns)