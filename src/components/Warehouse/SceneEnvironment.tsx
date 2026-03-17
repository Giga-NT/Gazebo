import React from 'react';
import * as THREE from 'three';

interface SceneEnvironmentProps {
  siteLength?: number; // Длина площадки
  siteWidth?: number;  // Ширина площадки
  buildingLength?: number; // Длина здания
  buildingWidth?: number;  // Ширина здания
  buildingPosition?: [number, number, number]; // Позиция здания
}

const SceneEnvironment: React.FC<SceneEnvironmentProps> = ({
  siteLength = 40,
  siteWidth = 40,
  buildingLength = 12,
  buildingWidth = 6,
  buildingPosition = [0, 0, 0]
}) => {
  
  // Цвета
  const asphaltColor = '#2a2a2a';
  const grassColor = '#3c5e3a';
  const lineColor = '#f0f0f0';
  
  // Размеры асфальтовой площадки (чуть больше здания)
  const asphaltLength = buildingLength + 8;
  const asphaltWidth = buildingWidth + 8;
  
  // Позиция асфальта (центрируем относительно здания)
  const asphaltX = buildingPosition[0];
  const asphaltZ = buildingPosition[2];
  
  return (
    <>
      {/* Небо через градиентный фон - используем большой купол или скайбокс */}
      <color attach="background" args={['#87CEEB']} />
      
      {/* Окружающий свет для мягкого освещения */}
      <ambientLight intensity={0.4} />
      
      {/* Солнце (направленный свет) */}
      <directionalLight 
        position={[10, 20, 5]} 
        intensity={1.2} 
        castShadow 
        shadow-mapSize-width={2048} 
        shadow-mapSize-height={2048}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
        shadow-camera-near={1}
        shadow-camera-far={50}
      />
      
      {/* Заполняющий свет сзади */}
      <directionalLight position={[-10, 10, -10]} intensity={0.3} />
      
      {/* 1. ГАЗОН (основная земля) - большой круг или прямоугольник */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[asphaltX, -0.05, asphaltZ]} 
        receiveShadow
      >
        <planeGeometry args={[siteLength, siteWidth]} />
        <meshStandardMaterial color={grassColor} roughness={0.8} />
      </mesh>
      
      {/* 2. АСФАЛЬТОВАЯ ПЛОЩАДКА (вокруг здания) */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[asphaltX, 0, asphaltZ]} 
        receiveShadow
      >
        <planeGeometry args={[asphaltLength, asphaltWidth]} />
        <meshStandardMaterial color={asphaltColor} roughness={0.7} metalness={0.1} />
      </mesh>
      
      {/* 3. РАЗМЕТКА - белые линии по краям асфальта */}
      
      {/* Левая линия */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[asphaltX - asphaltLength/2 + 0.1, 0.01, asphaltZ]}
      >
        <planeGeometry args={[0.1, asphaltWidth - 1]} />
        <meshStandardMaterial color={lineColor} emissive="#444444" />
      </mesh>
      
      {/* Правая линия */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[asphaltX + asphaltLength/2 - 0.1, 0.01, asphaltZ]}
      >
        <planeGeometry args={[0.1, asphaltWidth - 1]} />
        <meshStandardMaterial color={lineColor} emissive="#444444" />
      </mesh>
      
      {/* Передняя линия */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[asphaltX, 0.01, asphaltZ - asphaltWidth/2 + 0.1]}
      >
        <planeGeometry args={[asphaltLength - 1, 0.1]} />
        <meshStandardMaterial color={lineColor} emissive="#444444" />
      </mesh>
      
      {/* Задняя линия */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[asphaltX, 0.01, asphaltZ + asphaltWidth/2 - 0.1]}
      >
        <planeGeometry args={[asphaltLength - 1, 0.1]} />
        <meshStandardMaterial color={lineColor} emissive="#444444" />
      </mesh>
      
      {/* 4. ПЕШЕХОДНЫЙ ПЕРЕХОД (опционально) - полоски перед зданием */}
      {[...Array(5)].map((_, i) => (
        <mesh 
          key={`crosswalk-${i}`}
          rotation={[-Math.PI / 2, 0, 0]} 
          position={[asphaltX - 1 + i * 0.5, 0.02, asphaltZ - asphaltWidth/2 + 1.5]}
        >
          <planeGeometry args={[0.2, 2]} />
          <meshStandardMaterial color={lineColor} />
        </mesh>
      ))}
      
      {/* 5. ДЕРЕВЬЯ или КУСТЫ по краям для украшения */}
      {/* Левое дерево */}
      <group position={[asphaltX - asphaltLength/2 - 2, 0, asphaltZ - 3]}>
        <mesh castShadow receiveShadow position={[0, 1.5, 0]}>
          <cylinderGeometry args={[0.3, 0.4, 3]} />
          <meshStandardMaterial color="#8B4513" roughness={0.7} />
        </mesh>
        <mesh castShadow receiveShadow position={[0, 3.5, 0]}>
          <sphereGeometry args={[1.2, 8, 8]} />
          <meshStandardMaterial color="#2E7D32" roughness={0.4} />
        </mesh>
      </group>
      
      {/* Правое дерево */}
      <group position={[asphaltX + asphaltLength/2 + 2, 0, asphaltZ + 3]}>
        <mesh castShadow receiveShadow position={[0, 1.5, 0]}>
          <cylinderGeometry args={[0.3, 0.4, 3]} />
          <meshStandardMaterial color="#8B4513" roughness={0.7} />
        </mesh>
        <mesh castShadow receiveShadow position={[0, 3.5, 0]}>
          <sphereGeometry args={[1.2, 8, 8]} />
          <meshStandardMaterial color="#2E7D32" roughness={0.4} />
        </mesh>
      </group>
      
      {/* 6. ОБЛАКА (декоративные) - через спрайты или простые сферы */}
      <group position={[5, 12, -10]}>
        <mesh castShadow>
          <sphereGeometry args={[1.5, 7, 7]} />
          <meshStandardMaterial color="#ffffff" emissive="#aaaaaa" transparent opacity={0.7} />
        </mesh>
        <mesh position={[1.2, 0.3, 0.5]} castShadow>
          <sphereGeometry args={[1.2, 7, 7]} />
          <meshStandardMaterial color="#ffffff" emissive="#aaaaaa" transparent opacity={0.7} />
        </mesh>
        <mesh position={[-1.3, -0.2, -0.3]} castShadow>
          <sphereGeometry args={[1.3, 7, 7]} />
          <meshStandardMaterial color="#ffffff" emissive="#aaaaaa" transparent opacity={0.7} />
        </mesh>
      </group>
      
      {/* 7. ФОНАРИ (опционально) */}
      {[-1, 1].map((side) => (
        <group key={`lamp-${side}`} position={[asphaltX + side * (asphaltLength/2 - 1), 0, asphaltZ - 2]}>
          <mesh castShadow position={[0, 2, 0]}>
            <cylinderGeometry args={[0.1, 0.15, 4]} />
            <meshStandardMaterial color="#555555" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh castShadow position={[0, 4, 0]}>
            <sphereGeometry args={[0.3, 8, 8]} />
            <meshStandardMaterial color="#FFD700" emissive="#FFAA00" />
          </mesh>
        </group>
      ))}
    </>
  );
};

export default SceneEnvironment;