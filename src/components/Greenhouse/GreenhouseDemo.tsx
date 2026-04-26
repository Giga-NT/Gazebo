import React, { useRef, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Sky } from '@react-three/drei';
import * as THREE from 'three';
import { GreenhouseParams } from '../../types/GreenhouseTypes';
import ArchedRoof from './ArchedRoof';
import GableRoof from './GableRoof';
import GreenhouseWalls from './GreenhouseWalls';
import GreenhouseFoundation from './GreenhouseFoundation';

// Фиксированные демо-параметры
const demoParams: GreenhouseParams = {
  width: 3,
  length: 4,
  height: 2.5,
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
};

const Ground = ({ groundType = 'grass' }: { groundType?: string }) => {
  const { scene } = useThree();
  useEffect(() => {
    const groundGeometry = new THREE.CircleGeometry(100, 32);
    const textureLoader = new THREE.TextureLoader();
    const groundTexture = textureLoader.load('https://threejs.org/examples/textures/terrain/grasslight-big.jpg');
    groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
    groundTexture.repeat.set(10, 10);
    const groundMaterial = new THREE.MeshStandardMaterial({ map: groundTexture, roughness: 0.4, metalness: 0.0 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.1;
    ground.receiveShadow = true;
    scene.add(ground);
    return () => { scene.remove(ground); };
  }, [groundType, scene]);
  return null;
};

interface GreenhouseDemoProps {
  doorsOpen: boolean;
  ventsOpen: boolean;
}

export const GreenhouseDemo: React.FC<GreenhouseDemoProps> = ({ doorsOpen, ventsOpen }) => {
  return (
    <Canvas
      shadows
      camera={{ position: [6, 4, 7], fov: 50, near: 0.1, far: 1000 }}
      style={{ width: '100%', height: '100%' }}
    >
      <Sky distance={10000} sunPosition={[10, 20, 10]} />
      <Ground groundType="grass" />
      <ambientLight intensity={1.2} />
      <directionalLight position={[10, 20, 10]} intensity={1.2} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
      <directionalLight position={[-10, 10, -10]} intensity={0.6} />

      {demoParams.type === 'arched' && <ArchedRoof params={demoParams} />}
      {demoParams.type === 'gable' && <GableRoof params={demoParams} />}
      <GreenhouseWalls params={demoParams} doorsOpen={doorsOpen} setDoorsOpen={() => {}} ventsOpen={ventsOpen} />
      <GreenhouseFoundation params={demoParams} />

      <OrbitControls
        minDistance={5}
        maxDistance={15}
        enablePan={true}
        target={[0, 1.5, 0]}
        autoRotate={true}
        autoRotateSpeed={0.8}
      />
    </Canvas>
  );
};