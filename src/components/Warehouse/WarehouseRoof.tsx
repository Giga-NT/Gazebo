// src/components/Warehouse/WarehouseRoof.tsx
import React from 'react';
import * as THREE from 'three';
import { WarehouseParams } from '../../types/warehouseTypes';

const WarehouseRoof: React.FC<{ params: WarehouseParams }> = ({ params }) => {
  const {
    width,
    length,
    wallHeight,
    roofHeight,
    roofType,
    roofColor,
    roofPanelThickness = 100,
    columnSize,
    wallPanelThickness = 100,
  } = params;

  const colDim = columnSize ? parseInt(columnSize.split('x')[0]) / 1000 : 0.2;
  const wallThickness = wallPanelThickness / 1000;
  
  // Свес кровли (15 см)
  const eaves = 0.5; // 150 мм
  
  // Базовый выступ за наружную грань стены (колонна + стена)
  const baseOverhang = colDim / 2 + wallThickness;
  
  // Внутренняя ширина между стенами (для расчета угла)
  const innerWidth = width;
  const innerLength = length;

  // Наружные габариты со свесами
  const totalWidth = width + 2 * (baseOverhang + eaves);
  const totalLength = length + 2 * (baseOverhang + eaves);

  const roofThickness = roofPanelThickness / 1000;
  const purlinThickness = 0.08; // толщина прогона
  const offsetY = purlinThickness + roofThickness / 3-0.05; // кровля лежит НА прогонах

// ---- ДВУСКАТНАЯ КРЫША ----
if (roofType === 'gable') {
  // Угол ската
  const angle = Math.atan2(roofHeight, innerWidth / 2);
  
  // Длина ската от конька до свеса
  const slopeLength = Math.sqrt((innerWidth / 2 + eaves) ** 2 + roofHeight ** 2);
  
  // Центры скатов
  const leftPos = new THREE.Vector3(
    -(innerWidth / 2 + eaves) / 2, 
    wallHeight + roofHeight / 2 + offsetY, 
    0
  );
  const rightPos = new THREE.Vector3(
    (innerWidth / 2 + eaves) / 2, 
    wallHeight + roofHeight / 2 + offsetY, 
    0
  );

  // Размеры конька (Г-образный уголок)
  const ridgeSize = 0.2; // 200 мм - ширина полки
  const ridgeThickness = 0.002; // 2 мм толщина металла
  const ridgeLength = totalLength; // длина конька

  // Цвет конька
  const ridgeColor = '#4682B4'; // стальной синий

  // Точка конька (верхняя)
  const ridgeX = 0;
  const ridgeY = wallHeight + roofHeight + offsetY;
  const ridgeZ = 0;

  // АВТОМАТИЧЕСКИЙ РАСЧЕТ СМЕЩЕНИЙ В ЗАВИСИМОСТИ ОТ ТОЛЩИНЫ ПАНЕЛИ
  let leftOffsetX, rightOffsetX, ridgeYOffset;
  
  // Коэффициенты для разных толщин (подобраны экспериментально)
  if (roofPanelThickness === 50) {
    leftOffsetX = 0.08;
    rightOffsetX = 0.06;
    ridgeYOffset = 0.12;
  } 
  else if (roofPanelThickness === 100) {
    leftOffsetX = 0.1;
    rightOffsetX = 0.08;
    ridgeYOffset = 0.14;
  } 
  else if (roofPanelThickness === 150) {
    leftOffsetX = 0.12;
    rightOffsetX = 0.1;
    ridgeYOffset = 0.16;
  } 
  else if (roofPanelThickness === 200) {
    leftOffsetX = 0.08;
    rightOffsetX = 0.08;
    ridgeYOffset = 0.15;
  } 
  else {
    // По умолчанию для 100 мм
    leftOffsetX = 0.1;
    rightOffsetX = 0.08;
    ridgeYOffset = 0.14;
  }

  return (
    <>
      {/* Левый скат */}
      <mesh position={leftPos} rotation={[0, 0, angle]} castShadow receiveShadow>
        <boxGeometry args={[slopeLength, roofThickness, totalLength]} />
        <meshStandardMaterial color={roofColor} roughness={0.6} metalness={0.1} side={THREE.DoubleSide} />
      </mesh>
      
      {/* Правый скат */}
      <mesh position={rightPos} rotation={[0, 0, -angle]} castShadow receiveShadow>
        <boxGeometry args={[slopeLength, roofThickness, totalLength]} />
        <meshStandardMaterial color={roofColor} roughness={0.6} metalness={0.1} side={THREE.DoubleSide} />
      </mesh>
      
      {/* КОНЕК - левая полка (по углу левого ската) */}
      <mesh 
        position={[ridgeX - leftOffsetX, ridgeY + ridgeYOffset, ridgeZ]} 
        rotation={[0, 0, angle]} 
        castShadow 
        receiveShadow
      >
        <boxGeometry args={[ridgeSize, ridgeThickness, ridgeLength]} />
        <meshStandardMaterial color={ridgeColor} roughness={0.3} metalness={0.8} />
      </mesh>
      
      {/* КОНЕК - правая полка (по углу правого ската) */}
      <mesh 
        position={[ridgeX + rightOffsetX, ridgeY + ridgeYOffset, ridgeZ]} 
        rotation={[0, 0, -angle]} 
        castShadow 
        receiveShadow
      >
        <boxGeometry args={[ridgeSize, ridgeThickness, ridgeLength]} />
        <meshStandardMaterial color={ridgeColor} roughness={0.3} metalness={0.8} />
      </mesh>
    </>
  );
}

  // ---- ОДНОСКАТНАЯ КРЫША ----
  if (roofType === 'single') {
    // Угол рассчитывается по внутренней ширине
    const angle = Math.atan2(roofHeight, innerWidth);
    
    // Длина ската с учетом свесов с обеих сторон
    const slopeLength = Math.sqrt((innerWidth + 2 * eaves) ** 2 + roofHeight ** 2);
    
    const centerX = 0;
    const centerY = wallHeight + roofHeight / 2 + offsetY;
    const centerZ = 0;

    return (
      <mesh position={[centerX, centerY, centerZ]} rotation={[0, 0, angle]} castShadow receiveShadow>
        <boxGeometry args={[slopeLength, roofThickness, totalLength]} />
        <meshStandardMaterial color={roofColor} roughness={0.6} metalness={0.1} />
      </mesh>
    );
  }

  // ---- ПЛОСКАЯ КРЫША ----
  return (
    <mesh position={[0, wallHeight + offsetY, 0]} rotation={[0, 0, 0]} castShadow receiveShadow>
      <boxGeometry args={[totalWidth, roofThickness, totalLength]} />
      <meshStandardMaterial color={roofColor} roughness={0.6} metalness={0.1} />
    </mesh>
  );
};

export default React.memo(WarehouseRoof);