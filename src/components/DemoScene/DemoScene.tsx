import React, { useState, Suspense, useMemo, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Sky, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { GazeboParams } from '../../types/gazeboTypes';
import { GreenhouseParams } from '../../types/GreenhouseTypes';
import GazeboWalls from '../Gazebo/GazeboWalls';
import GazeboTrusses from '../Gazebo/GazeboTrusses';
import GazeboLathing from '../Gazebo/GazeboLathing';
import GazeboRoofCover from '../Gazebo/GazeboRoofCover';
import GazeboFoundation from '../Gazebo/GazeboFoundation';
import GreenhouseWalls from '../Greenhouse/GreenhouseWalls';
import GreenhouseFoundation from '../Greenhouse/GreenhouseFoundation';
import ArchedRoof from '../Greenhouse/ArchedRoof';
import GableRoof from '../Greenhouse/GableRoof';
import Beam from '../Beams/Beam';
import './DemoScene.css';

type ModelType = 'canopy' | 'gazebo' | 'greenhouse';

// ============================================================================
// CONTEXT FOR MOBILE DETECTION
// ============================================================================
const MobileContext = React.createContext<boolean>(false);

// ============================================================================
// GROUND COMPONENT
// ============================================================================
const Ground = ({ groundType }: { groundType: 'grass' | 'wood' | 'concrete' }) => {
  const { scene } = useThree();

  useEffect(() => {
    const groundGeometry = new THREE.CircleGeometry(100, 32);
    let groundTexture: THREE.Texture;

    const textureLoader = new THREE.TextureLoader();
    if (groundType === 'grass') {
      groundTexture = textureLoader.load('https://threejs.org/examples/textures/terrain/grasslight-big.jpg');
    } else if (groundType === 'wood') {
      groundTexture = textureLoader.load('https://threejs.org/examples/textures/hardwood2_diffuse.jpg');
    } else {
      groundTexture = textureLoader.load('https://threejs.org/examples/textures/brick_diffuse.jpg');
    }

    groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
    groundTexture.repeat.set(10, 10);

    const groundMaterial = new THREE.MeshStandardMaterial({
      map: groundTexture,
      roughness: 1.0,
      metalness: 0.0
    });

    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.1;
    ground.receiveShadow = true;
    scene.add(ground);

    return () => {
      scene.remove(ground);
    };
  }, [groundType, scene]);

  return null;
};

// ============================================================================
// CANOPY FOUNDATION (тротуарная плитка с текстурой)
// ============================================================================
const CanopyFoundation: React.FC<{ width: number; length: number }> = ({ width, length }) => {
  // Создаём текстуру плитки программно (без roundRect)
  const pavementTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    
    // Базовый цвет
    ctx.fillStyle = '#A0896E';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const tileSize = 128;
    const rows = canvas.height / tileSize;
    const cols = canvas.width / tileSize;
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = col * tileSize;
        const y = row * tileSize;
        
        // Случайный оттенок
        const variation = 25;
        const r = 160 + Math.random() * variation;
        const g = 137 + Math.random() * variation;
        const b = 110 + Math.random() * variation;
        
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fillRect(x + 4, y + 4, tileSize - 8, tileSize - 8);
        
        // Тёмная кромка (шов)
        ctx.strokeStyle = 'rgba(0,0,0,0.2)';
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 4, y + 4, tileSize - 8, tileSize - 8);
        
        // Светлая кромка (объём)
        ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 5, y + 5, tileSize - 10, tileSize - 10);
      }
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(width / 2.5, length / 2.5);
    return texture;
  }, [width, length]);

  const foundation = (
    <mesh position={[0, -0.15, 0]} receiveShadow castShadow>
      <boxGeometry args={[width + 0.8, 0.15, length + 0.8]} />
      <meshStandardMaterial color="#888888" roughness={0.9} metalness={0.05} />
    </mesh>
  );

  const floor = (
    <mesh position={[0, 0, 0]} receiveShadow castShadow>
      <boxGeometry args={[width, 0.05, length]} />
      <meshStandardMaterial 
        map={pavementTexture}
        roughness={0.4} 
        metalness={0.05}
      />
    </mesh>
  );

  return (
    <group>
      {foundation}
      {floor}
    </group>
  );
};
// ============================================================================
// CANOPY LATHING COMPONENT (обрешётка с шагом 0.5м)
// ============================================================================
const CanopyLathing: React.FC<{
  width: number;
  length: number;
  height: number;
  roofHeight: number;
  overhang: number;
  trussPositions: number[];
  lathingStep: number;
  color: string;
}> = ({ width, length, height, roofHeight, overhang, trussPositions, lathingStep, color }) => {
  const lathingDimensions = { width: 0.04, thickness: 0.02 };
  const totalWidth = width + overhang * 2;
  
  const getArchPointsAtZ = (zPos: number): THREE.Vector3[] => {
    const points: THREE.Vector3[] = [];
    const segments = 20;
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const x = -totalWidth / 2 + t * totalWidth;
      const y = roofHeight * (1 - Math.pow(2 * t - 1, 2));
      points.push(new THREE.Vector3(x, height + y, zPos));
    }
    return points;
  };

  const findYOnArch = (x: number, points: THREE.Vector3[]): number => {
    for (let i = 0; i < points.length - 1; i++) {
      if (x >= points[i].x && x <= points[i + 1].x) {
        const t = (x - points[i].x) / (points[i + 1].x - points[i].x);
        return points[i].y + t * (points[i + 1].y - points[i].y);
      }
    }
    return height;
  };

  const frontArchPoints = getArchPointsAtZ(trussPositions[0]);
  const backArchPoints = getArchPointsAtZ(trussPositions[trussPositions.length - 1]);
  const lathingCount = Math.ceil(totalWidth / lathingStep) + 1;
  const stepX = totalWidth / (lathingCount - 1);
  const elements: React.ReactElement[] = [];

  for (let i = 0; i < lathingCount; i++) {
    const xPos = -totalWidth / 2 + i * stepX;
    const yStart = findYOnArch(xPos, frontArchPoints);
    const yEnd = findYOnArch(xPos, backArchPoints);
    elements.push(
      <Beam
        key={`lathing-${i}`}
        start={new THREE.Vector3(xPos, yStart, trussPositions[0])}
        end={new THREE.Vector3(xPos, yEnd, trussPositions[trussPositions.length - 1])}
        dimensions={lathingDimensions}
        rotationOffset={Math.PI / 2}
        color={color}
      />
    );
  }
  return <>{elements}</>;
};

// ============================================================================
// CANOPY DEMO COMPONENT (арочный, 8 стоек по 4 с каждой стороны, 4 усиленные фермы, с обрешёткой)
// ============================================================================
const CanopyDemoContent: React.FC = () => {
  const isMobile = React.useContext(MobileContext);
  const width = 6;
  const length = 6;
  const height = 3;
  const roofHeight = 0.8;
  const overhang = 0.4;
  const trussCount = 4;
  const lathingStep = 0.5;

  const frameColor = '#1e3a5f';
  const roofColor = '#00a896';
  const pillarDimensions = { width: 0.1, thickness: 0.1 };
  const trussDimensions = { width: 0.08, thickness: 0.08 };
  const roofDimensions = { width: 0.06, thickness: 0.06 };

  const trussPositions = useMemo(() => {
    const positions: number[] = [];
    const step = length / (trussCount - 1);
    for (let i = 0; i < trussCount; i++) {
      positions.push(-length / 2 + (i * step));
    }
    return positions;
  }, [length, trussCount]);

  const getArchPoints = (zPos: number): THREE.Vector3[] => {
    const points: THREE.Vector3[] = [];
    const segments = 16;
    const totalWidth = width + overhang * 2;

    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const x = -totalWidth / 2 + t * totalWidth;
      const y = roofHeight * (1 - Math.pow(2 * t - 1, 2));
      points.push(new THREE.Vector3(x, height + y, zPos));
    }
    return points;
  };

  const getRoofY = (x: number): number => {
    const totalWidth = width + overhang * 2;
    const t = (x + totalWidth / 2) / totalWidth;
    if (t < 0 || t > 1) return height;
    return height + roofHeight * (1 - Math.pow(2 * t - 1, 2)) + 0.05;
  };

  const pillars = useMemo(() => {
    const elements: React.ReactElement[] = [];
    const pillarSpacing = length / 3;
    for (let i = 0; i < 4; i++) {
      const zPos = -length / 2 + (i * pillarSpacing);
      elements.push(
        <Beam key={`pillar-left-${i}`} start={new THREE.Vector3(-width / 2, 0, zPos)} end={new THREE.Vector3(-width / 2, height, zPos)} dimensions={pillarDimensions} color={frameColor} />,
        <Beam key={`pillar-right-${i}`} start={new THREE.Vector3(width / 2, 0, zPos)} end={new THREE.Vector3(width / 2, height, zPos)} dimensions={pillarDimensions} color={frameColor} />
      );
    }
    return elements;
  }, [width, length, height, frameColor]);

  const trusses = useMemo(() => {
    const elements: React.ReactElement[] = [];
    trussPositions.forEach((zPos, trussIdx) => {
      const points = getArchPoints(zPos);
      const totalWidth = width + overhang * 2;
      
      // Верхний пояс арки
      for (let i = 0; i < points.length - 1; i++) {
        elements.push(<Beam key={`truss-arch-${trussIdx}-${i}`} start={points[i]} end={points[i + 1]} dimensions={trussDimensions} color={frameColor} />);
      }
      
      // Нижний пояс (затяжка)
      const lowerStart = new THREE.Vector3(-totalWidth / 2, height, zPos);
      const lowerEnd = new THREE.Vector3(totalWidth / 2, height, zPos);
      elements.push(<Beam key={`truss-lower-${trussIdx}`} start={lowerStart} end={lowerEnd} dimensions={trussDimensions} color={frameColor} />);
      
      // Ферма с симметричными раскосами (ёлочка)
      const verticalCount = 6; // 6 вертикальных стоек
      const panelWidth = totalWidth / verticalCount;
      
      // Вертикальные стойки (строго вертикально)
      for (let i = 1; i < verticalCount; i++) {
        const x = -totalWidth / 2 + i * panelWidth;
        const t = i / verticalCount;
        const archIndex = Math.floor(t * (points.length - 1));
        const archPoint = points[archIndex];
        
        elements.push(
          <Beam
            key={`truss-vertical-${trussIdx}-${i}`}
            start={new THREE.Vector3(x, height, zPos)}
            end={archPoint}
            dimensions={trussDimensions}
            color={frameColor}
          />
        );
      }
      
      // Диагональные раскосы (симметрично от центра - ёлочка)
      const halfCount = verticalCount / 2; // 3
      for (let i = 0; i < verticalCount; i++) {
        const x1 = -totalWidth / 2 + i * panelWidth;
        const x2 = -totalWidth / 2 + (i + 1) * panelWidth;
        
        const t1 = i / verticalCount;
        const t2 = (i + 1) / verticalCount;
        const archIndex1 = Math.floor(t1 * (points.length - 1));
        const archIndex2 = Math.floor(t2 * (points.length - 1));
        const archPoint1 = points[archIndex1];
        const archPoint2 = points[archIndex2];
        
        const lowerLeft = new THREE.Vector3(x1, height, zPos);
        const lowerRight = new THREE.Vector3(x2, height, zPos);
        
        // Левая половина: ↗ (от низа левой к верху правой)
        // Правая половина: ↖ (от низа правой к верху левой)
        if (i < halfCount) {
          elements.push(
            <Beam
              key={`truss-diagonal-${trussIdx}-${i}`}
              start={lowerLeft}
              end={archPoint2}
              dimensions={trussDimensions}
              color={frameColor}
            />
          );
        } else {
          elements.push(
            <Beam
              key={`truss-diagonal-${trussIdx}-${i}`}
              start={lowerRight}
              end={archPoint1}
              dimensions={trussDimensions}
              color={frameColor}
            />
          );
        }
      }
    });
    return elements;
  }, [trussPositions, width, height, roofHeight, overhang, frameColor]);

  const longitudinalBeams = useMemo(() => {
    const elements: React.ReactElement[] = [];
    const firstPoints = getArchPoints(trussPositions[0]);
    const lastPoints = getArchPoints(trussPositions[trussPositions.length - 1]);
    const frontRidge = firstPoints[Math.floor(firstPoints.length / 2)];
    const backRidge = lastPoints[Math.floor(lastPoints.length / 2)];
    elements.push(<Beam key="long-ridge" start={frontRidge} end={backRidge} dimensions={roofDimensions} color={frameColor} />);
    elements.push(<Beam key="long-left" start={firstPoints[0]} end={lastPoints[0]} dimensions={roofDimensions} color={frameColor} />);
    elements.push(<Beam key="long-right" start={firstPoints[firstPoints.length - 1]} end={lastPoints[lastPoints.length - 1]} dimensions={roofDimensions} color={frameColor} />);
    for (let side = 0; side < 2; side++) {
      const xPos = side === 0 ? -width / 2 : width / 2;
      for (let i = 0; i < trussPositions.length - 1; i++) {
        const z1 = trussPositions[i];
        const z2 = trussPositions[i + 1];
        elements.push(<Beam key={`long-bottom-${side}-${i}`} start={new THREE.Vector3(xPos, height, z1)} end={new THREE.Vector3(xPos, height, z2)} dimensions={roofDimensions} color={frameColor} />);
      }
    }
    return elements;
  }, [trussPositions, width, height, frameColor]);

  const lathing = useMemo(() => {
    return (
      <CanopyLathing
        width={width}
        length={length}
        height={height}
        roofHeight={roofHeight}
        overhang={overhang}
        trussPositions={trussPositions}
        lathingStep={lathingStep}
        color={frameColor}
      />
    );
  }, [width, length, height, roofHeight, overhang, trussPositions, lathingStep, frameColor]);

  const roofCover = useMemo(() => {
    const segments = 16;
    const sheets: React.ReactElement[] = [];
    const totalWidth = width + overhang * 2 + 0.4;
    const totalLength = length + overhang * 2 + 0.4;

    for (let i = 0; i < segments; i++) {
      const t1 = i / segments;
      const t2 = (i + 1) / segments;
      const x1 = -totalWidth / 2 + t1 * totalWidth;
      const x2 = -totalWidth / 2 + t2 * totalWidth;
      const y1 = getRoofY(x1);
      const y2 = getRoofY(x2);

      const shape = new THREE.Shape();
      shape.moveTo(x1, y1);
      shape.lineTo(x2, y2);
      shape.lineTo(x2, y2 - 0.015);
      shape.lineTo(x1, y1 - 0.015);
      shape.closePath();

      const geometry = new THREE.ExtrudeGeometry(shape, {
        steps: 1,
        depth: totalLength,
        bevelEnabled: false,
      });
      geometry.translate(0, 0, -totalLength / 2);

      sheets.push(
        <mesh key={`roof-sheet-${i}`} geometry={geometry} castShadow receiveShadow>
          <meshStandardMaterial
            color={roofColor}
            transparent
            opacity={0.75}
            side={THREE.DoubleSide}
            roughness={0.3}
            metalness={0.1}
          />
        </mesh>
      );
    }
    return sheets;
  }, [width, length, roofHeight, roofColor, height, overhang]);

  return (
    <>
      <Sky distance={10000} sunPosition={[10, 20, 10]} />
      <Ground groundType="grass" />
      <ambientLight intensity={1.2} />
      <directionalLight
        position={[10, 20, 10]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <directionalLight position={[-10, 10, -10]} intensity={0.6} />

      <group position={[0, 0, 0]}>
        {pillars}
        {trusses}
        {longitudinalBeams}
        {lathing}
        {roofCover}
        
        {/* Основание как у беседки, но с брусчаткой */}
        <CanopyFoundation width={width} length={length} />
      </group>

      <OrbitControls
        minDistance={isMobile ? 15 : 10}
        maxDistance={isMobile ? 30 : 25}
        enablePan={false}
        target={[0, height / 2, 0]}
        autoRotate={!isMobile}
        autoRotateSpeed={0.5}
        touches={isMobile ? { ONE: 'rotate', TWO: 'dolly' } : undefined}
        rotateSpeed={0.8}
        zoomSpeed={1.2}
      />
    </>
  );
};


// ============================================================================
// GAZEBO FOUNDATION (тротуарная плитка, как у навеса)
// ============================================================================
const GazeboPavementFoundation: React.FC<{ width: number; length: number }> = ({ width, length }) => {
  // Текстура плитки (та же, что у навеса)
  const pavementTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    
    ctx.fillStyle = '#A0896E';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const tileSize = 128;
    const rows = canvas.height / tileSize;
    const cols = canvas.width / tileSize;
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = col * tileSize;
        const y = row * tileSize;
        
        const variation = 25;
        const r = 160 + Math.random() * variation;
        const g = 137 + Math.random() * variation;
        const b = 110 + Math.random() * variation;
        
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fillRect(x + 4, y + 4, tileSize - 8, tileSize - 8);
        
        ctx.strokeStyle = 'rgba(0,0,0,0.2)';
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 4, y + 4, tileSize - 8, tileSize - 8);
        
        ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 5, y + 5, tileSize - 10, tileSize - 10);
      }
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(width / 2.5, length / 2.5);
    return texture;
  }, [width, length]);

  // Фундамент (бетонная подушка)
  const foundation = (
    <mesh position={[0, -0.15, 0]} receiveShadow castShadow>
      <boxGeometry args={[width + 0.8, 0.15, length + 0.8]} />
      <meshStandardMaterial color="#888888" roughness={0.9} metalness={0.05} />
    </mesh>
  );

  // Пол (тротуарная плитка)
  const floor = (
    <mesh position={[0, 0, 0]} receiveShadow castShadow>
      <boxGeometry args={[width, 0.05, length]} />
      <meshStandardMaterial 
        map={pavementTexture}
        roughness={0.4} 
        metalness={0.05}
      />
    </mesh>
  );

  return (
    <group>
      {foundation}
      {floor}
    </group>
  );
};

// ============================================================================
// GAZEBO DEMO COMPONENT
// ============================================================================
const GazeboDemoContent: React.FC = () => {
  const isMobile = React.useContext(MobileContext);
  const demoParams: GazeboParams = useMemo<GazeboParams>(() => ({
    width: 5,
    length: 5,
    height: 2.2,
    roofHeight: 0.8,
    roofType: 'arched',
    overhang: 0.4,
    trussCount: 4,
    trussType: 'simple',
    constructionType: 'truss',
    pillarType: 'curved',
    pillarSize: '100x100',
    pillarSpacing: 1.5,
    pillarBendDirection: 'inward',
    beamSize: '100x100',
    trussTubeSize: '60x60',
    roofTubeSize: '40x20',
    pillarTubeSize: '100x100',
    lathingTubeSize: '40x20',
    lathingStep: 0.5,
    color: '#1e3a5f',
    roofColor: '#00a896',
    floorColor: '#8B4513',
    showBackground: false,
    showRoofCover: true,
    showGables: false,
    hasRailing: true,
    railingHeight: 0.9,
    foundationType: 'concrete',
    foundationDepth: 0.3,
    groundType: 'grass',
    materialType: 'wood',
    floorType: 'wood',
    hasFurniture: false,
    benchCount: 2,
    tableSize: 'medium',
    tableCount: 1,
    tableLegsColor: '#1d1c21',
    tableTopColor: '#2105f5',
    showPillars: true,
    showTrusses: true,
    showLathing: true,
  }), []);

  return (
    <>
      <Sky distance={10000} sunPosition={[10, 20, 10]} />
      <Ground groundType={demoParams.groundType} />
      <ambientLight intensity={1.2} />
      <directionalLight
        position={[10, 20, 10]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <directionalLight position={[-10, 10, -10]} intensity={0.6} />

      <GazeboWalls params={demoParams} />

      {demoParams.roofType === 'gable' && (
        <>
          <GazeboTrusses params={demoParams} />
          <GazeboLathing params={demoParams} />
          {demoParams.showRoofCover && <GazeboRoofCover params={demoParams} offsetY={0.05} />}
        </>
      )}

      {demoParams.roofType === 'single' && (
        <>
          <GazeboTrusses params={demoParams} />
          <GazeboLathing params={demoParams} />
          {demoParams.showRoofCover && <GazeboRoofCover params={demoParams} />}
        </>
      )}

      {demoParams.roofType === 'arched' && (
        <>
          <GazeboTrusses params={demoParams} />
          <GazeboLathing params={demoParams} />
          {demoParams.showRoofCover && <GazeboRoofCover params={demoParams} />}
        </>
      )}

      {/* Вместо GazeboFoundation используем плитку */}
      <GazeboPavementFoundation width={demoParams.width} length={demoParams.length} />

      <OrbitControls
        minDistance={isMobile ? Math.max(demoParams.width, demoParams.length) * 1.2 : Math.max(demoParams.width, demoParams.length) * 0.8}
        maxDistance={isMobile ? Math.max(demoParams.width, demoParams.length) * 4 : Math.max(demoParams.width, demoParams.length) * 3}
        enablePan={false}
        target={[0, demoParams.height / 2, 0]}
        autoRotate={!isMobile}
        autoRotateSpeed={0.5}
        touches={isMobile ? { ONE: 'rotate', TWO: 'dolly' } : undefined}
        rotateSpeed={0.8}
        zoomSpeed={1.2}
      />
    </>
  );
};

// ============================================================================
// GREENHOUSE DEMO COMPONENT
// ============================================================================
const GreenhouseDemoContent: React.FC = () => {
  const isMobile = React.useContext(MobileContext);
  const [doorsOpen] = useState(false);
  const [ventsOpen] = useState(false);

  const demoParams: GreenhouseParams = useMemo<GreenhouseParams>(() => ({
    width: 3,
    length: 5,
    height: 3,
    wallHeight: 1.8,
    archHeight: 1.2,
    trussCount: 4,
    type: 'arched',
    frameMaterial: 'metal',
    coverMaterial: 'polycarbonate',
    foundationType: 'concrete',
    groundType: 'grass',
    hasVentilation: true,
    hasDoors: true,
    color: '#2d5a7a',
    frameColor: '#2d5a7a',
    coverColor: '#98d8c8',
    archSegments: 16,
    roofAngle: 30,
    partitionCount: 0,
    shelving: false,
    postCount: 5,
    rafterCount: 5,
    doorSide: 'front',
    hasVents: true,
    ventSide: 'front',
    vent: {
      count: 2,
      side: 'roof',
      heightOffset: 0.5,
      lengthOffset: 0.5,
      width: 1,
      height: 0.5,
      zOffset: -0.01,
    },
  }), []);

  return (
    <>
      <Sky distance={10000} sunPosition={[10, 20, 10]} />
      <Ground groundType={demoParams.groundType} />
      <ambientLight intensity={1.2} />
      <directionalLight
        position={[10, 20, 10]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <directionalLight position={[-10, 10, -10]} intensity={0.6} />

      {demoParams.type === 'arched' && <ArchedRoof params={demoParams} />}
      {demoParams.type === 'gable' && <GableRoof params={demoParams} />}
      
      <GreenhouseWalls
        params={demoParams}
        doorsOpen={doorsOpen}
        setDoorsOpen={() => {}}
        ventsOpen={ventsOpen}
      />

      <GreenhouseFoundation params={demoParams} />

      <OrbitControls
        minDistance={isMobile ? Math.max(demoParams.width, demoParams.length) * 1.2 : Math.max(demoParams.width, demoParams.length) * 0.8}
        maxDistance={isMobile ? Math.max(demoParams.width, demoParams.length) * 4 : Math.max(demoParams.width, demoParams.length) * 3}
        enablePan={false}
        target={[0, demoParams.height / 2, 0]}
        autoRotate={!isMobile}
        autoRotateSpeed={0.5}
        touches={isMobile ? { ONE: 'rotate', TWO: 'dolly' } : undefined}
        rotateSpeed={0.8}
        zoomSpeed={1.2}
      />
    </>
  );
};

// ============================================================================
// SCENE CONTENT
// ============================================================================
const DemoSceneContent: React.FC<{ modelType: ModelType; isMobile: boolean }> = ({ modelType, isMobile }) => {
  const { scene } = useThree();

  useEffect(() => {
    scene.background = new THREE.Color('#f0f2f5');
    scene.fog = new THREE.Fog('#f0f2f5', 10, 50);
  }, [scene]);

  return (
    <MobileContext.Provider value={isMobile}>
      {modelType === 'canopy' && <CanopyDemoContent />}
      {modelType === 'gazebo' && <GazeboDemoContent />}
      {modelType === 'greenhouse' && <GreenhouseDemoContent />}

      <ContactShadows position={[0, -1.5, 0]} opacity={0.4} scale={20} blur={2} far={4.5} />
    </MobileContext.Provider>
  );
};

// ============================================================================
// LOADING SPINNER
// ============================================================================
const LoadingSpinner: React.FC = () => (
  <div className="demo-scene__loading">
    <div className="demo-scene__spinner"></div>
    <p>Загрузка 3D...</p>
  </div>
);

// ============================================================================
// MAIN DEMO SCENE COMPONENT
// ============================================================================
export const DemoScene: React.FC = () => {
  const [modelType, setModelType] = useState<ModelType>('gazebo');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const models: { type: ModelType; label: string; icon: string }[] = [
    { type: 'canopy', label: 'Навес', icon: '🏠' },
    { type: 'gazebo', label: 'Беседка', icon: '🏡' },
    { type: 'greenhouse', label: 'Теплица', icon: '🌱' },
  ];

  if (isMobile) {
    return (
      <div className="demo-scene demo-scene--mobile">
        <div className="demo-scene__image-fallback">
          <img src="https://via.placeholder.com/600x400/f0f2f5/1e3a5f?text=3D+Demo" alt="3D Demo" className="demo-scene__fallback-image" />
          <p className="demo-scene__mobile-text">Откройте на компьютере для интерактивного 3D-демо</p>
        </div>
      </div>
    );
  }

  return (
    <div className="demo-scene">
      <div className="demo-scene__controls">
        {models.map((model) => (
          <button
            key={model.type}
            className={`demo-scene__btn ${modelType === model.type ? 'demo-scene__btn--active' : ''}`}
            onClick={() => setModelType(model.type)}
          >
            <span className="demo-scene__btn-icon">{model.icon}</span>
            <span className="demo-scene__btn-label">{model.label}</span>
          </button>
        ))}
      </div>

      <div className="demo-scene__canvas-container">
        <Suspense fallback={<LoadingSpinner />}>
          <Canvas
            shadows
            camera={{ position: [8, 5, 8], fov: 50, near: 0.1, far: 1000 }}
            gl={{ antialias: true, alpha: true, preserveDrawingBuffer: false }}
            performance={{ min: 0.5 }}
          >
            <DemoSceneContent modelType={modelType} isMobile={isMobile} />
          </Canvas>
        </Suspense>
      </div>

      <div className="demo-scene__hint">
        <span>🖱️</span> Вращайте мышкой для осмотра
      </div>
    </div>
  );
};