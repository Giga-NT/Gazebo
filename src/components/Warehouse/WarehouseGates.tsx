import React from 'react';
import * as THREE from 'three';
import { WarehouseParams } from '../../types/warehouseTypes';

interface WarehouseGatesProps {
  params: WarehouseParams;
  gatesOpen: boolean;
  doorsOpen: boolean;
}

const WarehouseGates: React.FC<WarehouseGatesProps> = ({ params, gatesOpen, doorsOpen }) => {
  const {
    gateType,
    gateWidth,
    gateHeight,
    gatePosition,
    gateSide,
    length,
    width,
    columnSize,
    wallPanelThickness = 100,
    frameColor,
  } = params;

  if (gateType === 'none') return null;

  const colDim = columnSize ? parseInt(columnSize.split('x')[0]) / 1000 : 0.2;
  const wallThickness = wallPanelThickness / 1000;
  const overhang = colDim / 2 + wallThickness;
  const totalLength = length + 2 * overhang;
  const totalWidth = width + 2 * overhang;

  const frameWidth = 0.12;
  const doorWidth = 0.9;
  const doorHeight = 2.3;
  const doorThickness = 0.05;
  const doorFrameWidth = 0.08;

  const SECTION_COUNT = 4;
  const sectionHeight = gateHeight / SECTION_COUNT;

  const frameMaterial = new THREE.MeshStandardMaterial({ color: frameColor, roughness: 0.4, metalness: 0.6 });
  const gateMaterial = new THREE.MeshStandardMaterial({ color: '#C0C0C0', roughness: 0.6, metalness: 0.2 });
  const doorMaterial = new THREE.MeshStandardMaterial({ color: '#E8F4F8', roughness: 0.5, metalness: 0.3 });
  const doorFrameMat = new THREE.MeshStandardMaterial({ color: '#333333', roughness: 0.4, metalness: 0.5 });
  const hardwareMaterial = new THREE.MeshStandardMaterial({ color: '#FFD700', roughness: 0.3, metalness: 0.9 });

  // 🔹 Компонент одних ворот (исходная геометрия без изменений)
  const GateSet = ({ wallZ, rotY, keyPrefix }: { wallZ: number; rotY: number; keyPrefix: string }) => {
    const isFront = wallZ < 0;
    const elements: React.ReactNode[] = [];

    // ---- 1. Рама ворот ----
    elements.push(
      <mesh key={`frame-left-${keyPrefix}`} position={[-gateWidth / 2 - frameWidth / 2, gateHeight / 2, 0]} rotation={[0, rotY, 0]}>
        <boxGeometry args={[frameWidth, gateHeight + frameWidth, wallThickness + 0.04]} />
        <primitive object={frameMaterial} attach="material" />
      </mesh>
    );
    elements.push(
      <mesh key={`frame-right-${keyPrefix}`} position={[gateWidth / 2 + frameWidth / 2, gateHeight / 2, 0]} rotation={[0, rotY, 0]}>
        <boxGeometry args={[frameWidth, gateHeight + frameWidth, wallThickness + 0.04]} />
        <primitive object={frameMaterial} attach="material" />
      </mesh>
    );
    elements.push(
      <mesh key={`frame-top-${keyPrefix}`} position={[0, gateHeight + frameWidth / 2, 0]} rotation={[0, rotY, 0]}>
        <boxGeometry args={[gateWidth + frameWidth * 2, frameWidth, wallThickness + 0.04]} />
        <primitive object={frameMaterial} attach="material" />
      </mesh>
    );

// ---- 2. СЕКЦИОННЫЕ ВОРОТА ----
for (let i = 0; i < SECTION_COUNT; i++) {
  const isOpen = gatesOpen;
  const secBottom = i * sectionHeight;
  const secTop = (i + 1) * sectionHeight;
  
  // 🔹 Вырез под калитку делаем ТОЛЬКО когда ворота ЗАКРЫТЫ
  const intersectsDoor = !isOpen && secBottom < doorHeight && secTop <= doorHeight + 0.01;

  const closedY = (i * sectionHeight) + (sectionHeight / 2);
  const openY = gateHeight;
  const openRot = -Math.PI / 2;
  const zOffset = isOpen ? (SECTION_COUNT - 1 - i) * sectionHeight : 0;
  const directionMultiplier = isFront ? 1 : -1;
  const finalZPos = 0.02 + (isOpen ? (zOffset * directionMultiplier) : 0);
  
  const finalY = isOpen ? openY : closedY;
  const finalRot = isOpen ? openRot : 0;

  if (!isOpen && intersectsDoor) {
    // 🔹 Рисуем ТОЛЬКО когда ворота закрыты - боковые части секции
    const sideSegmentWidth = (gateWidth - doorWidth) / 2;
    
    if (sideSegmentWidth > 0.05) {
      elements.push(
        <mesh key={`sec-${keyPrefix}-${i}-left`} position={[-gateWidth / 2 + sideSegmentWidth / 2, closedY, 0.02]} rotation={[0, rotY, 0]}>
          <boxGeometry args={[sideSegmentWidth - 0.01, sectionHeight - 0.02, 0.05]} />
          <primitive object={gateMaterial} attach="material" />
        </mesh>
      );
      elements.push(
        <mesh key={`sec-${keyPrefix}-${i}-right`} position={[gateWidth / 2 - sideSegmentWidth / 2, closedY, 0.02]} rotation={[0, rotY, 0]}>
          <boxGeometry args={[sideSegmentWidth - 0.01, sectionHeight - 0.02, 0.05]} />
          <primitive object={gateMaterial} attach="material" />
        </mesh>
      );
    }
  } else {
    // 🔹 Целая секция (когда ворота открыты ИЛИ секция выше калитки)
    elements.push(
      <mesh key={`sec-${keyPrefix}-${i}`} position={[0, finalY, finalZPos]} rotation={[finalRot, rotY, 0]} castShadow receiveShadow>
        <boxGeometry args={[gateWidth - 0.04, sectionHeight - 0.005, 0.05]} />
        <primitive object={gateMaterial} attach="material" />
      </mesh>
    );
  }
}

// ---- 3. КАЛИТКА ----
// 🔹 Показываем калитку ТОЛЬКО когда ворота ЗАКРЫТЫ и калитка ЗАКРЫТА
if (!gatesOpen && !doorsOpen) {
  const hingeY = doorHeight / 2;
  const openAngle = Math.PI / 2;
  const currentRotation = doorsOpen ? -openAngle : 0;

  elements.push(
    <group key={`wicket-full-${keyPrefix}`} position={[0, hingeY, 0.03]} rotation={[0, rotY, 0]}>
      <group position={[doorWidth / 2, 0, 0]} rotation={[0, currentRotation, 0]}>
        <group position={[-doorWidth, 0, 0]}>
           <mesh position={[doorWidth/2, doorHeight / 2 - doorFrameWidth / 2, 0]}>
              <boxGeometry args={[doorWidth, doorFrameWidth, doorThickness + 0.02]} />
              <primitive object={doorFrameMat} attach="material" />
           </mesh>
           <mesh position={[doorWidth/2, -doorHeight / 2 + doorFrameWidth / 2, 0]}>
              <boxGeometry args={[doorWidth, doorFrameWidth, doorThickness + 0.02]} />
              <primitive object={doorFrameMat} attach="material" />
           </mesh>
           <mesh position={[0, 0, 0]}>
              <boxGeometry args={[doorFrameWidth, doorHeight, doorThickness + 0.02]} />
              <primitive object={doorFrameMat} attach="material" />
           </mesh>
           <mesh position={[doorWidth, 0, 0]}>
              <boxGeometry args={[0.04, doorHeight, doorThickness + 0.02]} />
              <primitive object={doorFrameMat} attach="material" />
           </mesh>

           <mesh position={[doorWidth/2, 0, 0]} castShadow receiveShadow>
             <boxGeometry args={[doorWidth - 0.02, doorHeight - 0.02, doorThickness]} />
             <primitive object={doorMaterial} attach="material" />
           </mesh>

           <mesh position={[isFront ? 0.1 : 0.15, 0, isFront ? -(doorThickness / 2) - 0.01 : (doorThickness / 2) - 0.05]} rotation={[0, 0, Math.PI / 2]}>
             <cylinderGeometry args={[0.02, 0.02, 0.15, 16]} />
             <primitive object={hardwareMaterial} attach="material" />
           </mesh>

           {[-0.8, 0.8].map((yOffset, idx) => (
             <mesh key={`hinge-${keyPrefix}-${idx}`} position={[0, yOffset, 0]} rotation={[0, 0, Math.PI / 2]}>
               <cylinderGeometry args={[0.03, 0.03, 0.1, 16]} />
               <primitive object={hardwareMaterial} attach="material" />
             </mesh>
           ))}
        </group>
      </group>
    </group>
  );
}

    // ---- 3. КАЛИТКА ----
    if (!gatesOpen) {
      const hingeY = doorHeight / 2;
      const openAngle = Math.PI / 2;
      const currentRotation = doorsOpen ? -openAngle : 0;

      elements.push(
        <group key={`wicket-full-${keyPrefix}`} position={[0, hingeY, 0.03]} rotation={[0, rotY, 0]}>
          <group position={[doorWidth / 2, 0, 0]} rotation={[0, currentRotation, 0]}>
            <group position={[-doorWidth, 0, 0]}>
               <mesh position={[doorWidth/2, doorHeight / 2 - doorFrameWidth / 2, 0]}>
                  <boxGeometry args={[doorWidth, doorFrameWidth, doorThickness + 0.02]} />
                  <primitive object={doorFrameMat} attach="material" />
               </mesh>
               <mesh position={[doorWidth/2, -doorHeight / 2 + doorFrameWidth / 2, 0]}>
                  <boxGeometry args={[doorWidth, doorFrameWidth, doorThickness + 0.02]} />
                  <primitive object={doorFrameMat} attach="material" />
               </mesh>
               <mesh position={[0, 0, 0]}>
                  <boxGeometry args={[doorFrameWidth, doorHeight, doorThickness + 0.02]} />
                  <primitive object={doorFrameMat} attach="material" />
               </mesh>
               <mesh position={[doorWidth, 0, 0]}>
                  <boxGeometry args={[0.04, doorHeight, doorThickness + 0.02]} />
                  <primitive object={doorFrameMat} attach="material" />
               </mesh>

               <mesh position={[doorWidth/2, 0, 0]} castShadow receiveShadow>
                 <boxGeometry args={[doorWidth - 0.02, doorHeight - 0.02, doorThickness]} />
                 <primitive object={doorMaterial} attach="material" />
               </mesh>

               <mesh position={[isFront ? 0.1 : 0.15, 0, isFront ? -(doorThickness / 2) - 0.01 : (doorThickness / 2) - 0.05]} rotation={[0, 0, Math.PI / 2]}>
                 <cylinderGeometry args={[0.02, 0.02, 0.15, 16]} />
                 <primitive object={hardwareMaterial} attach="material" />
               </mesh>

               {[-0.8, 0.8].map((yOffset, idx) => (
                 <mesh key={`hinge-${keyPrefix}-${idx}`} position={[0, yOffset, 0]} rotation={[0, 0, Math.PI / 2]}>
                   <cylinderGeometry args={[0.03, 0.03, 0.1, 16]} />
                   <primitive object={hardwareMaterial} attach="material" />
                 </mesh>
               ))}
            </group>
          </group>
        </group>
      );
    }

    return <>{elements}</>;
  };

  const elements: React.ReactNode[] = [];

  // 🔹 ФРОНТАЛЬНЫЕ ВОРОТА (перед/зад)
  if (gatePosition === 'front' || gatePosition === 'back' || gatePosition === 'both') {
    const walls = gatePosition === 'both' 
      ? [{ z: -totalLength / 2, rotY: 0, key: 'front' }, { z: totalLength / 2, rotY: Math.PI, key: 'back' }]
      : [{ z: gatePosition === 'front' ? -totalLength / 2 : totalLength / 2, rotY: gatePosition === 'front' ? 0 : Math.PI, key: gatePosition }];

    walls.forEach(({ z, rotY, key }) => {
      // Просто размещаем ворота на позиции Z
      elements.push(
        <group key={`gate-group-${key}`} position={[0, 0, z]}>
          <GateSet wallZ={z} rotY={rotY} keyPrefix={key} />
        </group>
      );
    });
  }

  // 🔹 БОКОВЫЕ ВОРОТА (слева/справа) - просто поворачиваем группу
  if (gatePosition === 'side') {
    const side = gateSide || 'left';
    const walls = side === 'both_sides'
      ? [{ x: -totalWidth / 2, rotY: Math.PI / 2, key: 'side-left' }, { x: totalWidth / 2, rotY: -Math.PI / 2, key: 'side-right' }]
      : [{ x: side === 'left' ? -totalWidth / 2 : totalWidth / 2, rotY: side === 'left' ? Math.PI / 2 : -Math.PI / 2, key: side === 'left' ? 'side-left' : 'side-right' }];

    walls.forEach(({ x, rotY, key }) => {
      // 🔹 Просто размещаем ту же самую геометрию, но на боковой стене!
      elements.push(
        <group key={`gate-group-${key}`} position={[x+0.05, 0, 0]} rotation={[0, rotY, 0]}>
          {/* Вся геометрия остаётся точно такой же, просто в повёрнутой группе */}
          <GateSet wallZ={0} rotY={0} keyPrefix={key} />
        </group>
      );
    });
  }

  return <>{elements}</>;
};

export default React.memo(WarehouseGates);