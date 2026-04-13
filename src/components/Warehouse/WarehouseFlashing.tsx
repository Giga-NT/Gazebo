/**
 * Copyright (c) 2026 Giga-NT (Григорьев Константин Владимирович)
 * Все права защищены.
 * 
 * License: Proprietary
 * См. LICENSE файл в корне проекта.
 */

import React from 'react';
import * as THREE from 'three';
import { WarehouseParams } from '../../types/warehouseTypes';

const WarehouseFlashing: React.FC<{ params: WarehouseParams }> = ({ params }) => {
  const {
    width,
    length,
    wallHeight,
    roofHeight,
    roofType,
    columnSize,
    wallPanelThickness = 100,
    frameColor,
  } = params;

  const colDim = columnSize ? parseInt(columnSize.split('x')[0]) / 1000 : 0.2;
  const wallThickness = wallPanelThickness / 1000;
  const overhang = colDim / 2 + wallThickness;
  const totalWidth = width + 2 * overhang;
  const totalLength = length + 2 * overhang + 2 * wallThickness;

  const material = new THREE.MeshStandardMaterial({ color: frameColor, roughness: 0.5, metalness: 0.3 });
  const flashingThickness = 0.22;
  const flashingWidth = 0.15;

  // ИСПРАВЛЕНО: Динамическое смещение в зависимости от толщины стены
  // Половина толщины стены + 2 см для точного прилегания к торцу
  const offsetToPanel = wallThickness / 2 + 0.1;

  const createFlashing = (
    x: number,
    y: number,
    z: number,
    width: number,
    height: number,
    rotY: number,
    rotX?: number
  ) => {
    return (
      <mesh position={[x, y, z]} rotation={[rotX || 0, rotY, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, height, flashingThickness]} />
        <primitive object={material} attach="material" />
      </mesh>
    );
  };

  const elements: React.ReactNode[] = [];

  if (roofType === 'gable') {
    const angle = Math.atan2(roofHeight, totalWidth / 2);
    const slopeLength = Math.sqrt((totalWidth / 2) ** 2 + roofHeight ** 2);

    // --- Ветровые планки на фронтонах (по скатам) ---
    for (let i = 0; i < 2; i++) {
      const side = i === 0 ? 'left' : 'right';
      const signX = i === 0 ? -1 : 1;
      const startX = signX * totalWidth / 2;
      const endX = 0;
      const startY = wallHeight;
      const endY = wallHeight + roofHeight;

      const dx = endX - startX;
      const dy = endY - startY;
      const lengthSlope = Math.sqrt(dx ** 2 + dy ** 2);
      const angleSlope = Math.atan2(dy, dx);

      // Передний торец
      elements.push(
        <mesh
          key={`flashing-${side}-slope`}
          position={[(startX + endX) / 2, (startY + endY) / 2, totalLength / 2 - offsetToPanel]}
          rotation={[0, 0, angleSlope]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[lengthSlope, flashingWidth, flashingThickness]} />
          <primitive object={material} attach="material" />
        </mesh>
      );

      // Задний торец
      elements.push(
        <mesh
          key={`flashing-${side}-slope-back`}
          position={[(startX + endX) / 2, (startY + endY) / 2, -totalLength / 2 + offsetToPanel]}
          rotation={[0, 0, angleSlope]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[lengthSlope, flashingWidth, flashingThickness]} />
          <primitive object={material} attach="material" />
        </mesh>
      );
    }

    // --- Горизонтальные карнизные планки (вдоль длинных сторон) ---
    for (let i = 0; i < 2; i++) {
      const side = i === 0 ? 'front' : 'back';
      const z = i === 0 ? totalLength / 2 - offsetToPanel : -totalLength / 2 + offsetToPanel;

      elements.push(
        <mesh
          key={`flashing-${side}-eaves`}
          position={[0, wallHeight, z]}
          rotation={[0, 0, 0]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[totalWidth - 2 * offsetToPanel, flashingWidth, flashingThickness]} />
          <primitive object={material} attach="material" />
        </mesh>
      );
    }
  } else {
    // Для других типов кровли
  }

  return <>{elements}</>;
};

export default WarehouseFlashing;