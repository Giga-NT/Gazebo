import React, { useMemo } from 'react';
import * as THREE from 'three';

interface SceneEnvironmentProps {
  buildingLength?: number;
  buildingWidth?: number;
  buildingPosition?: [number, number, number];
}

// Создаем процедурную текстуру для металла
const createMetalTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  
  // Металлический фон
  ctx.fillStyle = '#888888';
  ctx.fillRect(0, 0, 256, 256);
  
  // Добавляем шум
  for (let i = 0; i < 2000; i++) {
    const x = Math.random() * 256;
    const y = Math.random() * 256;
    const brightness = 100 + Math.random() * 155;
    ctx.fillStyle = `rgb(${brightness}, ${brightness}, ${brightness})`;
    ctx.fillRect(x, y, 2, 2);
  }
  
  // Добавляем полосы
  ctx.strokeStyle = '#555555';
  ctx.lineWidth = 2;
  for (let i = 0; i < 10; i++) {
    ctx.beginPath();
    ctx.moveTo(i * 25, 0);
    ctx.lineTo(i * 25 + 50, 256);
    ctx.stroke();
  }
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  return texture;
};

// Создаем процедурную текстуру для дерева
const createWoodTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  
  // Базовый цвет дерева
  ctx.fillStyle = '#8B4513';
  ctx.fillRect(0, 0, 256, 256);
  
  // Рисуем годичные кольца
  ctx.strokeStyle = '#5D3A1A';
  ctx.lineWidth = 4;
  for (let r = 30; r < 150; r += 25) {
    ctx.beginPath();
    ctx.arc(128, 128, r, 0, Math.PI * 2);
    ctx.stroke();
  }
  
  // Добавляем текстуру волокон
  ctx.strokeStyle = '#A0522D';
  ctx.lineWidth = 2;
  for (let i = 0; i < 50; i++) {
    ctx.beginPath();
    ctx.moveTo(0, i * 5);
    ctx.lineTo(256, i * 5 + 30);
    ctx.stroke();
  }
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  return texture;
};

// Фонарь с процедурной текстурой
const TexturedLampPost: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  const metalTexture = useMemo(() => createMetalTexture(), []);
  
  return (
    <group position={position}>
      {/* Основание */}
      <mesh castShadow receiveShadow position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.3, 0.4, 0.4, 24]} />
        <meshStandardMaterial 
          map={metalTexture}
          color="#cccccc"
          metalness={0.9} 
          roughness={0.2} 
        />
      </mesh>
      
      {/* Столб */}
      <mesh castShadow receiveShadow position={[0, 2.5, 0]}>
        <cylinderGeometry args={[0.15, 0.18, 5, 16]} />
        <meshStandardMaterial 
          map={metalTexture}
          color="#dddddd"
          metalness={0.9} 
          roughness={0.1} 
        />
      </mesh>
      
      {/* Декоративные кольца */}
      {[1, 2, 3, 4].map((y) => (
        <mesh key={`ring-${y}`} castShadow receiveShadow position={[0, y, 0]}>
          <torusGeometry args={[0.16, 0.02, 16, 24]} />
          <meshStandardMaterial 
            color="#ffaa00" 
            metalness={0.9} 
            roughness={0.1}
            emissive="#ff5500"
            emissiveIntensity={0.5}
          />
        </mesh>
      ))}
      
      {/* Кронштейн */}
      <mesh castShadow receiveShadow position={[0.8, 4.2, 0]} rotation={[0, 0, -0.3]}>
        <boxGeometry args={[0.1, 0.1, 1.4]} />
        <meshStandardMaterial 
          map={metalTexture}
          color="#aaaaaa"
          metalness={0.8} 
          roughness={0.2} 
        />
      </mesh>
      
      {/* Плафон */}
      <mesh castShadow receiveShadow position={[1.4, 4.1, 0]}>
        <sphereGeometry args={[0.3, 24, 24]} />
        <meshStandardMaterial 
          color="#ffeedd" 
          emissive="#ffaa33" 
          emissiveIntensity={2.0}
          roughness={0.1}
        />
      </mesh>
      
      {/* Верхушка */}
      <mesh castShadow receiveShadow position={[0, 5.0, 0]}>
        <sphereGeometry args={[0.15, 12, 12]} />
        <meshStandardMaterial 
          color="#ffaa00" 
          metalness={0.9} 
          roughness={0.1}
          emissive="#ff5500"
          emissiveIntensity={0.5}
        />
      </mesh>
    </group>
  );
};

// Дерево с процедурной текстурой
const TexturedTree: React.FC<{ position: [number, number, number]; scale?: number }> = ({ position, scale = 1 }) => {
  const woodTexture = useMemo(() => createWoodTexture(), []);
  
  return (
    <group position={position} scale={scale}>
      {/* Ствол */}
      <mesh castShadow receiveShadow position={[0, 1.5, 0]}>
        <cylinderGeometry args={[0.25, 0.4, 3, 12]} />
        <meshStandardMaterial 
          map={woodTexture}
          color="#8B4513" 
          roughness={0.9} 
        />
      </mesh>
      
      {/* Ветки */}
      {[
        { pos: [0.3, 2.0, 0.2], size: [0.1, 0.8, 0.1], rot: [0.2, 0.1, 0.3] },
        { pos: [-0.2, 2.2, -0.3], size: [0.1, 0.7, 0.1], rot: [-0.1, -0.2, 0.2] },
        { pos: [0.2, 1.8, -0.4], size: [0.1, 0.6, 0.1], rot: [0.3, -0.1, 0.1] },
        { pos: [0.4, 2.5, -0.1], size: [0.1, 0.5, 0.1], rot: [0.4, 0.2, 0.2] },
      ].map((branch, i) => (
        <mesh 
          key={`branch-${i}`}
          castShadow 
          receiveShadow 
          position={branch.pos as [number, number, number]}
          rotation={branch.rot as [number, number, number]}
        >
          <boxGeometry args={branch.size as [number, number, number]} />
          <meshStandardMaterial 
            map={woodTexture}
            color="#8B4513" 
            roughness={0.8} 
          />
        </mesh>
      ))}
      
      {/* Листва */}
      <mesh castShadow receiveShadow position={[0.3, 3.2, 0.2]}>
        <sphereGeometry args={[0.9, 10, 10]} />
        <meshStandardMaterial 
          color="#2d5a2d" 
          roughness={0.5} 
          emissive="#1a3a1a" 
          emissiveIntensity={0.2}
        />
      </mesh>
      <mesh castShadow receiveShadow position={[-0.4, 3.0, -0.3]}>
        <sphereGeometry args={[0.8, 10, 10]} />
        <meshStandardMaterial color="#2d5a2d" roughness={0.5} />
      </mesh>
      <mesh castShadow receiveShadow position={[0.2, 2.7, -0.5]}>
        <sphereGeometry args={[0.7, 10, 10]} />
        <meshStandardMaterial color="#2d5a2d" roughness={0.5} />
      </mesh>
      <mesh castShadow receiveShadow position={[0.5, 3.6, -0.2]}>
        <sphereGeometry args={[0.7, 10, 10]} />
        <meshStandardMaterial color="#2d5a2d" roughness={0.5} />
      </mesh>
      <mesh castShadow receiveShadow position={[-0.1, 3.8, 0.3]}>
        <sphereGeometry args={[0.7, 10, 10]} />
        <meshStandardMaterial color="#2d5a2d" roughness={0.5} />
      </mesh>
    </group>
  );
};

// Бордюр
const Curb: React.FC<{ start: [number, number, number]; end: [number, number, number] }> = ({ start, end }) => {
  const length = Math.sqrt(
    Math.pow(end[0] - start[0], 2) + 
    Math.pow(end[2] - start[2], 2)
  );
  
  const direction = new THREE.Vector3(end[0] - start[0], 0, end[2] - start[2]).normalize();
  const angle = Math.atan2(direction.x, direction.z);
  const midX = (start[0] + end[0]) / 2;
  const midZ = (start[2] + end[2]) / 2;
  
  return (
    <mesh castShadow receiveShadow position={[midX, 0.1, midZ]} rotation={[0, -angle, 0]}>
      <boxGeometry args={[0.15, 0.2, length]} />
      <meshStandardMaterial color="#888888" roughness={0.6} metalness={0.2} />
    </mesh>
  );
};

// Разметка
const RoadMarking: React.FC<{ position: [number, number, number]; width: number; length: number; rotation?: number }> = 
  ({ position, width, length, rotation = 0 }) => {
  return (
    <mesh rotation={[-Math.PI / 2, rotation, 0]} position={[position[0], 0.02, position[2]]}>
      <planeGeometry args={[width, length]} />
      <meshStandardMaterial color="#f0f0f0" emissive="#888888" />
    </mesh>
  );
};

// Главный компонент
const SceneEnvironmentAdvanced: React.FC<SceneEnvironmentProps> = ({
  buildingLength = 12,
  buildingWidth = 6,
  buildingPosition = [0, 0, 0]
}) => {
  const asphaltLength = buildingLength + 10;
  const asphaltWidth = buildingWidth + 10;
  const asphaltX = buildingPosition[0];
  const asphaltZ = buildingPosition[2];
  
  const lampPositions = [
    [asphaltX - asphaltLength/2 - 2, 0, asphaltZ - 3],
    [asphaltX + asphaltLength/2 + 2, 0, asphaltZ + 3],
    [asphaltX - 4, 0, asphaltZ - asphaltWidth/2 - 2],
    [asphaltX + 4, 0, asphaltZ + asphaltWidth/2 + 2],
  ];
  
  const treePositions = [
    [asphaltX - asphaltLength/2 - 5, 0, asphaltZ - 5],
    [asphaltX + asphaltLength/2 + 5, 0, asphaltZ + 5],
    [asphaltX - asphaltLength/2 - 4, 0, asphaltZ + 4],
    [asphaltX + asphaltLength/2 + 4, 0, asphaltZ - 4],
    [asphaltX - 6, 0, asphaltZ - asphaltWidth/2 - 4],
    [asphaltX + 6, 0, asphaltZ + asphaltWidth/2 + 4],
  ];

  return (
    <>
      {/* Освещение */}
      <ambientLight intensity={0.4} />
      <directionalLight 
        position={[15, 25, 15]} 
        intensity={1.5} 
        castShadow 
        shadow-mapSize-width={2048} 
        shadow-mapSize-height={2048}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
        color="#fff5e6"
      />
      <directionalLight position={[-10, 15, -10]} intensity={0.5} color="#b0e0ff" />
      
      {/* Газон */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[asphaltX, -0.05, asphaltZ]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#3c5e3a" roughness={0.9} />
      </mesh>
      
      {/* Асфальт */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[asphaltX, 0, asphaltZ]} receiveShadow>
        <planeGeometry args={[asphaltLength, asphaltWidth]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.8} metalness={0.2} />
      </mesh>
      
      {/* Бордюры */}
      <Curb start={[asphaltX - asphaltLength/2, 0, asphaltZ - asphaltWidth/2]} end={[asphaltX + asphaltLength/2, 0, asphaltZ - asphaltWidth/2]} />
      <Curb start={[asphaltX + asphaltLength/2, 0, asphaltZ - asphaltWidth/2]} end={[asphaltX + asphaltLength/2, 0, asphaltZ + asphaltWidth/2]} />
      <Curb start={[asphaltX + asphaltLength/2, 0, asphaltZ + asphaltWidth/2]} end={[asphaltX - asphaltLength/2, 0, asphaltZ + asphaltWidth/2]} />
      <Curb start={[asphaltX - asphaltLength/2, 0, asphaltZ + asphaltWidth/2]} end={[asphaltX - asphaltLength/2, 0, asphaltZ - asphaltWidth/2]} />
      
      {/* Разметка */}
      <RoadMarking position={[asphaltX - 2, 0, asphaltZ]} width={0.1} length={asphaltWidth - 4} rotation={0} />
      <RoadMarking position={[asphaltX + 2, 0, asphaltZ]} width={0.1} length={asphaltWidth - 4} rotation={0} />
      
      {/* Пешеходный переход */}
      {[-2, -1, 0, 1, 2].map((i) => (
        <RoadMarking key={`cross-${i}`} position={[asphaltX + i * 0.8, 0, asphaltZ - asphaltWidth/2 + 2]} width={0.2} length={2.5} rotation={0} />
      ))}
      
      {/* Фонари */}
      {lampPositions.map((pos, i) => (
        <TexturedLampPost key={`lamp-${i}`} position={[pos[0], pos[1], pos[2]]} />
      ))}
      
      {/* Деревья */}
      {treePositions.map((pos, i) => (
        <TexturedTree key={`tree-${i}`} position={[pos[0], pos[1], pos[2]]} scale={0.9 + Math.random() * 0.3} />
      ))}
      
      {/* Кусты */}
      {[...Array(8)].map((_, i) => (
        <mesh key={`bush-${i}`} castShadow receiveShadow position={[asphaltX - 15 + Math.random() * 30, 0.2, asphaltZ - 15 + Math.random() * 30]}>
          <sphereGeometry args={[0.4 + Math.random() * 0.3, 8, 8]} />
          <meshStandardMaterial color="#3a6e3a" roughness={0.7} />
        </mesh>
      ))}
    </>
  );
};

export default SceneEnvironmentAdvanced;