import React from 'react';
import * as THREE from 'three';
import { WarehouseParams } from '../../types/warehouseTypes';

interface WarehouseCornerFlashingProps {
  params: WarehouseParams;
}

const WarehouseCornerFlashing: React.FC<WarehouseCornerFlashingProps> = ({ params }) => {
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

  // РАЗМЕРЫ ПЛАНОК (можно менять)
  const flashingThickness = 0.002; // 2 мм
  let flashingWidth = 0.3;       // 30 см по умолчанию

  // Для односкатной крыши увеличиваем уголки
  if (roofType === 'single') {
    flashingWidth = 0.5; // 50 см для односкатной крыши
  }

  const material = new THREE.MeshStandardMaterial({ color: frameColor, roughness: 0.5, metalness: 0.3 });

  const elements: React.ReactNode[] = [];

  // === ВЫБОР СЦЕНАРИЯ В ЗАВИСИМОСТИ ОТ ТОЛЩИНЫ ПАНЕЛИ ===
  let plateXOffset, plateZOffset;

  if (wallPanelThickness === 50) {
    plateXOffset = {
      leftFront: { x: -0.03, z: 0.03 },
      rightFront: { x: 0.03, z: 0.02 },
      leftBack: { x: -0.03, z: -0.02 },
      rightBack: { x: 0.03, z: -0.02 },
    };
    plateZOffset = {
      leftFront: { x: -0.03, z: 0.03 },
      leftBack: { x: -0.03, z: -0.02 },
      rightFront: { x: 0.03, z: 0.02 },
      rightBack: { x: 0.03, z: -0.02 },
    };
  } 
  else if (wallPanelThickness === 100) {
    plateXOffset = {
      leftFront: { x: -0.05, z: 0.04 },
      rightFront: { x: 0.05, z: 0.04 },
      leftBack: { x: -0.05, z: -0.04 },
      rightBack: { x: 0.05, z: -0.04 },
    };
    plateZOffset = {
      leftFront: { x: -0.05, z: 0.04 },
      leftBack: { x: -0.05, z: -0.04 },
      rightFront: { x: 0.05, z: 0.04 },
      rightBack: { x: 0.05, z: -0.04 },
    };
  } 
  else if (wallPanelThickness === 150) {
    plateXOffset = {
      leftFront: { x: -0.07, z: 0.07 },
      rightFront: { x: 0.07, z: 0.04 },
      leftBack: { x: -0.07, z: -0.04 },
      rightBack: { x: 0.07, z: -0.04 },
    };
    plateZOffset = {
      leftFront: { x: -0.07, z: 0.07 },
      leftBack: { x: -0.07, z: -0.04 },
      rightFront: { x: 0.07, z: 0.04 },
      rightBack: { x: 0.07, z: -0.04 },
    };
  } 
  else if (wallPanelThickness === 200) {
    plateXOffset = {
      leftFront: { x: -0.1, z: 0.09 },
      rightFront: { x: 0.1, z: 0.09 },
      leftBack: { x: -0.1, z: -0.09 },
      rightBack: { x: 0.1, z: -0.09 },
    };
    plateZOffset = {
      leftFront: { x: -0.1, z: 0.09 },
      leftBack: { x: -0.1, z: -0.09 },
      rightFront: { x: 0.1, z: 0.09 },
      rightBack: { x: 0.1, z: -0.09 },
    };
  }
  else {
    // По умолчанию используем сценарий для 100 мм
    plateXOffset = {
      leftFront: { x: -0.05, z: 0.05 },
      rightFront: { x: 0.05, z: 0.03 },
      leftBack: { x: -0.05, z: -0.03 },
      rightBack: { x: 0.05, z: -0.03 },
    };
    plateZOffset = {
      leftFront: { x: -0.05, z: 0.05 },
      leftBack: { x: -0.05, z: -0.03 },
      rightFront: { x: 0.05, z: 0.03 },
      rightBack: { x: 0.05, z: -0.03 },
    };
  }

  // ========== ЛЕВЫЙ ПЕРЕДНИЙ УГОЛ ==========
  elements.push(
    <mesh
      key="left-front-x"
      position={[
        -totalWidth / 2 + flashingWidth / 2 + plateXOffset.leftFront.x,
        wallHeight / 2,
        -totalLength / 2 + plateXOffset.leftFront.z
      ]}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[flashingWidth, wallHeight, flashingThickness]} />
      <primitive object={material} attach="material" />
    </mesh>
  );

  elements.push(
    <mesh
      key="left-front-z"
      position={[
        -totalWidth / 2 + plateZOffset.leftFront.x,
        wallHeight / 2,
        -totalLength / 2 + flashingWidth / 2 + plateZOffset.leftFront.z
      ]}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[flashingThickness, wallHeight, flashingWidth]} />
      <primitive object={material} attach="material" />
    </mesh>
  );

  // ========== ПРАВЫЙ ПЕРЕДНИЙ УГОЛ ==========
  elements.push(
    <mesh
      key="right-front-x"
      position={[
        totalWidth / 2 - flashingWidth / 2 + plateXOffset.rightFront.x,
        wallHeight / 2,
        -totalLength / 2 + plateXOffset.rightFront.z
      ]}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[flashingWidth, wallHeight, flashingThickness]} />
      <primitive object={material} attach="material" />
    </mesh>
  );

  elements.push(
    <mesh
      key="right-front-z"
      position={[
        totalWidth / 2 + plateZOffset.rightFront.x,
        wallHeight / 2,
        -totalLength / 2 + flashingWidth / 2 + plateZOffset.rightFront.z
      ]}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[flashingThickness, wallHeight, flashingWidth]} />
      <primitive object={material} attach="material" />
    </mesh>
  );

  // ========== ЛЕВЫЙ ЗАДНИЙ УГОЛ ==========
  elements.push(
    <mesh
      key="left-back-x"
      position={[
        -totalWidth / 2 + flashingWidth / 2 + plateXOffset.leftBack.x,
        wallHeight / 2,
        totalLength / 2 + plateXOffset.leftBack.z
      ]}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[flashingWidth, wallHeight, flashingThickness]} />
      <primitive object={material} attach="material" />
    </mesh>
  );

  elements.push(
    <mesh
      key="left-back-z"
      position={[
        -totalWidth / 2 + plateZOffset.leftBack.x,
        wallHeight / 2,
        totalLength / 2 - flashingWidth / 2 + plateZOffset.leftBack.z
      ]}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[flashingThickness, wallHeight, flashingWidth]} />
      <primitive object={material} attach="material" />
    </mesh>
  );

  // ========== ПРАВЫЙ ЗАДНИЙ УГОЛ ==========
  elements.push(
    <mesh
      key="right-back-x"
      position={[
        totalWidth / 2 - flashingWidth / 2 + plateXOffset.rightBack.x,
        wallHeight / 2,
        totalLength / 2 + plateXOffset.rightBack.z
      ]}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[flashingWidth, wallHeight, flashingThickness]} />
      <primitive object={material} attach="material" />
    </mesh>
  );

  elements.push(
    <mesh
      key="right-back-z"
      position={[
        totalWidth / 2 + plateZOffset.rightBack.x,
        wallHeight / 2,
        totalLength / 2 - flashingWidth / 2 + plateZOffset.rightBack.z
      ]}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[flashingThickness, wallHeight, flashingWidth]} />
      <primitive object={material} attach="material" />
    </mesh>
  );

// Для односкатной крыши добавляем уголки на высокой стороне (правая стена)
if (roofType === 'single') {
  // Высокая сторона - правая стена (положительная X)
  const highSideX = totalWidth / 2;
  const lowSideX = -totalWidth / 2;
  
  // Уголки на правой стене (высокая сторона) - вертикальные (вдоль Z)
  elements.push(
    <mesh
      key="high-side-front-vert"
      position={[
        highSideX + plateXOffset.rightFront.x,
        wallHeight + roofHeight / 2,
        -totalLength / 2 + flashingWidth / 2 + plateXOffset.rightFront.z
      ]}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[flashingThickness, roofHeight, flashingWidth]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
  
  elements.push(
    <mesh
      key="high-side-back-vert"
      position={[
        highSideX + plateXOffset.rightBack.x,
        wallHeight + roofHeight / 2,
        totalLength / 2 - flashingWidth / 2 + plateXOffset.rightBack.z
      ]}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[flashingThickness, roofHeight, flashingWidth]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
  
  // Горизонтальные уголки на правой стене (вдоль X)
  elements.push(
    <mesh
      key="high-side-front-horiz"
      position={[
        highSideX - flashingWidth / 2 + plateZOffset.rightFront.x,
        wallHeight + roofHeight / 2,
        -totalLength / 2 + plateZOffset.rightFront.z
      ]}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[flashingWidth, roofHeight, flashingThickness]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
  
  elements.push(
    <mesh
      key="high-side-back-horiz"
      position={[
        highSideX - flashingWidth / 2 + plateZOffset.rightBack.x,
        wallHeight + roofHeight / 2,
        totalLength / 2 + plateZOffset.rightBack.z
      ]}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[flashingWidth, roofHeight, flashingThickness]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
  
  // Небольшие уголки на левой стене (низкая сторона)
  elements.push(
    <mesh
      key="low-side-front-vert"
      position={[
        lowSideX + plateXOffset.leftFront.x,
        wallHeight,
        -totalLength / 2 + flashingWidth / 2 + plateXOffset.leftFront.z
      ]}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[flashingThickness, wallHeight * 0.01, flashingWidth]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
  
  elements.push(
    <mesh
      key="low-side-back-vert"
      position={[
        lowSideX + plateXOffset.leftBack.x,
        wallHeight,
        totalLength / 2 - flashingWidth / 2 + plateXOffset.leftBack.z
      ]}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[flashingThickness, wallHeight * 0.01, flashingWidth]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}

  return <>{elements}</>;
};

export default React.memo(WarehouseCornerFlashing);