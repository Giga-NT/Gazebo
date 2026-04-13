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

const WarehouseDoorTrim: React.FC<{ params: WarehouseParams }> = ({ params }) => {
  const {
    gateType,
    gateWidth,
    gateHeight,
    gatePosition,
    length,
    columnSize,
    wallPanelThickness = 100,
    frameColor,
  } = params;

  if (gateType === 'none') return null;

  const colDim = columnSize ? parseInt(columnSize.split('x')[0]) / 1000 : 0.2;
  const wallThickness = wallPanelThickness / 1000;
  const overhang = colDim / 2 + wallThickness;
  const totalLength = length + 2 * overhang;

  const trimWidth = 0.12;      // ширина наличника 12 см
  const trimDepth = 0.02;      // толщина наличника 2 см
  const endCoverage = wallThickness; // закрывает торец стены

  const material = new THREE.MeshStandardMaterial({ color: frameColor, roughness: 0.4, metalness: 0.6 });

  const getWallZ = (): number[] => {
    if (gatePosition === 'front') return [-totalLength / 2];
    if (gatePosition === 'back') return [totalLength / 2];
    if (gatePosition === 'both') return [-totalLength / 2, totalLength / 2];
    return [];
  };

  const wallZPositions = getWallZ();
  const elements: React.ReactNode[] = [];

  // УБРАНО СМЕЩЕНИЕ doorOffsetZ - теперь рамка точно по центру ворот
  // Ворота находятся на zWall + gateThickness/2, поэтому рамка должна быть там же

  wallZPositions.forEach((zWall, idx) => {
    const rotY = zWall < 0 ? 0 : Math.PI;

    // Точное положение ворот: zWall + толщина ворот/2 (gateThickness = 0.02 из WarehouseGates)
    const gatePositionZ = zWall + 0.01; // 0.01 = gateThickness/2 (так как ворота толщиной 0.02)

    const createCornerPiece = (
      posX: number,
      posY: number,
      lengthX: number,
      lengthY: number,
      isVertical: boolean
    ) => {
      const group = new THREE.Group();

      // Лицевая планка (на стене)
      const facePlate = new THREE.Mesh(
        new THREE.BoxGeometry(isVertical ? trimWidth : lengthX, isVertical ? lengthY : trimWidth, trimDepth),
        material
      );
      facePlate.position.set(0, 0, trimDepth / 2);
      group.add(facePlate);

      // Торцевая планка (закрывает торец стены)
      const endPlate = new THREE.Mesh(
        new THREE.BoxGeometry(isVertical ? trimWidth : lengthX, isVertical ? lengthY : trimWidth, endCoverage),
        material
      );
      endPlate.position.set(0, 0, wallThickness / 2);
      group.add(endPlate);

      // ИСПРАВЛЕНО: позиция по Z теперь совпадает с центром ворот
      group.position.set(posX, posY, gatePositionZ);
      group.rotation.set(0, rotY, 0);
      return <primitive object={group} key={`${idx}-${posX}-${posY}`} />;
    };

    const leftX = -gateWidth / 2 - trimWidth / 2;
    const rightX = gateWidth / 2 + trimWidth / 2;
    const verticalHeight = gateHeight + trimWidth;
    const verticalCenterY = verticalHeight / 2;

    elements.push(createCornerPiece(leftX, verticalCenterY, 0, verticalHeight, true));
    elements.push(createCornerPiece(rightX, verticalCenterY, 0, verticalHeight, true));

    const topY = gateHeight + trimWidth / 2;
    elements.push(createCornerPiece(0, topY, gateWidth + trimWidth, 0, false));
  });

  return <>{elements}</>;
};

export default React.memo(WarehouseDoorTrim);