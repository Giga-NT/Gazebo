import React, { useMemo } from 'react';
import * as THREE from 'three';
import { CanopyParams } from '../../types/types';
import RoofFasteners from '../Beams/RoofFasteners'; 

const RoofCover: React.FC<{ params: CanopyParams }> = ({ params }) => {
  const getTubeDimensions = (size: string) => {
    const dimensions: Record<string, { width: number; thickness: number }> = {
      '40x20': { width: 0.04, thickness: 0.02 },
      '40x40': { width: 0.04, thickness: 0.04 },
      '50x50': { width: 0.05, thickness: 0.05 },
      '60x60': { width: 0.06, thickness: 0.06 },
      '80x80': { width: 0.08, thickness: 0.08 },
      '100x100': { width: 0.1, thickness: 0.1 },
    };
    return dimensions[size] || { width: 0.04, thickness: 0.02 };
  };

  // Толщина трубы верхнего пояса
  const roofTubeDimensions = getTubeDimensions(params.roofTubeSize);
  const upperChordHeight = roofTubeDimensions.thickness;
  
  // Толщина трубы обрешетки
  const lathingDimensions = getTubeDimensions(params.lathingTubeSize);
  const lathingHeight = lathingDimensions.thickness;
  
  // Подъём обрешетки (половина трубы верхнего пояса + половина обрешетки)
  const lathingOffset = upperChordHeight / 2 + lathingHeight / 2 + 0.003;
  
  // РАЗНЫЕ ПОДЪЕМЫ ДЛЯ РАЗНЫХ ТИПОВ КРЫШИ
  const getCoverOffset = (): number => {
    switch (params.roofType) {
      case 'arch':
        return lathingOffset + lathingHeight / 2 + 0.003;
      case 'gable':
        return lathingOffset + lathingHeight / 2 + 0.001;
      case 'shed':
        return lathingOffset + lathingHeight / 2 + 0.005;
      case 'flat':
        return lathingOffset + lathingHeight / 2 + 0.002;
      default:
        return lathingOffset + lathingHeight / 2;
    }
  };

  const roofCoverOffset = getCoverOffset();

  // Параметры профнастила
  const profiledSheet = {
    waveWidth: 0.30,
    waveHeight: 0.035,
    flatTop: 0.10,
    flatBottom: 0.14,
  };

  // Параметры черепицы
  const tileSheet = {
    waveWidth: 0.25,
    waveHeight: 0.035,
    rowHeight: 0.30,
    overlap: 0.03,
  };

  // Функция получения высоты ОСНОВНОГО ската
  const getRoofBaseY = (x: number): number => {
    const roofWidth = params.width + (params.overhang * 2);
    const t = (x + roofWidth / 2) / roofWidth;
    
    switch (params.roofType) {
      case 'arch':
        const angle = t * Math.PI;
        return params.height + params.roofHeight * Math.sin(angle);
      
      case 'gable': {
        const halfWidth = roofWidth / 2;
        const absX = Math.abs(x);
        if (absX <= halfWidth) {
          const t2 = absX / halfWidth;
          return params.height + params.roofHeight * (1 - t2);
        }
        return params.height;
      }
      
      case 'shed':
        return params.height + t * params.roofHeight;
      
      case 'flat':
        return params.height;
      
      default:
        return params.height + params.roofHeight;
    }
  };

  // Профиль профнастила
  const getProfiledWaveY = (z: number, baseY: number): number => {
    const roofLength = params.length + (params.overhang * 2);
    const wavePos = ((z + roofLength / 2) % profiledSheet.waveWidth + profiledSheet.waveWidth) % profiledSheet.waveWidth;
    const t = wavePos / profiledSheet.waveWidth;
    
    const topW = profiledSheet.flatTop / profiledSheet.waveWidth;
    const botW = profiledSheet.flatBottom / profiledSheet.waveWidth;
    const wallW = (1 - topW - botW) / 2;
    
    const endBot = botW;
    const endWallUp = botW + wallW;
    const endTop = botW + wallW + topW;
    const endWallDown = botW + wallW * 2 + topW;
    
    if (t < endBot) {
      return baseY;
    } 
    else if (t < endWallUp) {
      const localT = (t - endBot) / wallW;
      return baseY + profiledSheet.waveHeight * localT;
    } 
    else if (t < endTop) {
      return baseY + profiledSheet.waveHeight;
    } 
    else if (t < endWallDown) {
      const localT = (t - endTop) / wallW;
      return baseY + profiledSheet.waveHeight * (1 - localT);
    } 
    else {
      return baseY;
    }
  };

  // Профиль черепицы
  const getTileY = (x: number, z: number, baseGeometryY: number): number => {
    const roofLength = params.length + (params.overhang * 2);
    const roofWidth = params.width + (params.overhang * 2);
    
    const wavePosZ = ((z + roofLength / 2) % tileSheet.waveWidth + tileSheet.waveWidth) % tileSheet.waveWidth;
    const tWaveZ = wavePosZ / tileSheet.waveWidth;
    const waveY = Math.sin(tWaveZ * Math.PI * 2) * (tileSheet.waveHeight / 2);

    let localRowY = 0;
    
    if (params.roofType === 'gable' || params.roofType === 'shed') {
      let distFromStart = 0;
      if (params.roofType === 'gable') {
        distFromStart = Math.abs(x);
      } else {
        distFromStart = x + roofWidth / 2;
      }

      const rowNumber = Math.floor(distFromStart / tileSheet.rowHeight);
      const posInRow = distFromStart - (rowNumber * tileSheet.rowHeight);
      const tRow = posInRow / tileSheet.rowHeight;
      
      localRowY = (1 - tRow) * tileSheet.overlap;
      const tileBulge = Math.sin(tRow * Math.PI) * 0.01;
      localRowY += tileBulge;
    }
    
    return baseGeometryY + roofCoverOffset + localRowY + waveY;
  };

  const getFinalY = (x: number, z: number): number => {
    const baseY = getRoofBaseY(x);
    
    const effectiveMaterial = (params.roofType === 'arch' && params.roofMaterial === 'tile') 
      ? 'metal' 
      : params.roofMaterial;
    
    if (effectiveMaterial === 'metal') {
      return getProfiledWaveY(z, baseY + roofCoverOffset);
    } else if (effectiveMaterial === 'tile') {
      return getTileY(x, z, baseY);
    }
    
    return baseY + roofCoverOffset;
  };

  const getMaterialColor = (): THREE.Color => {
    if (params.roofColor && params.roofColor !== '#000000') {
      return new THREE.Color(params.roofColor);
    }
    switch (params.roofMaterial) {
      case 'metal':
        return new THREE.Color(0x888899);
      case 'tile':
        return new THREE.Color(0xB22222);
      case 'polycarbonate':
        return new THREE.Color(0x87CEEB);
      default:
        return new THREE.Color(0xCCCCCC);
    }
  };

  const roofGeometry = useMemo(() => {
    const roofWidth = params.width + (params.overhang * 2);
    const roofLength = params.length + (params.overhang * 2);
    
    const isTile = params.roofMaterial === 'tile';
    
    const segmentsX = isTile ? 150 : 60; 
    const segmentsZ = isTile ? 200 : Math.max(150, Math.ceil(roofLength / 0.05)); 
    
    const stepX = roofWidth / segmentsX;
    const stepZ = roofLength / segmentsZ;
    
    const vertices: number[] = [];
    const indices: number[] = [];
    
    for (let i = 0; i <= segmentsZ; i++) {
      const z = -roofLength / 2 + i * stepZ;
      
      for (let j = 0; j <= segmentsX; j++) {
        const x = -roofWidth / 2 + j * stepX;
        const y = getFinalY(x, z);
        
        vertices.push(x, y, z);
      }
    }
    
    for (let i = 0; i < segmentsZ; i++) {
      for (let j = 0; j < segmentsX; j++) {
        const a = i * (segmentsX + 1) + j;
        const b = i * (segmentsX + 1) + j + 1;
        const c = (i + 1) * (segmentsX + 1) + j;
        const d = (i + 1) * (segmentsX + 1) + j + 1;
        
        indices.push(a, b, c);
        indices.push(b, d, c);
      }
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    
    return geometry;
  }, [params, roofCoverOffset]);

  const materialColor = getMaterialColor();
  const isMetal = params.roofMaterial === 'metal';
  const isTile = params.roofMaterial === 'tile';
  const isPolycarbonate = params.roofMaterial === 'polycarbonate';
  
  const materialProps = {
    color: materialColor,
    metalness: isMetal ? 0.9 : (isTile ? 0.2 : 0.1),
    roughness: isMetal ? 0.3 : (isTile ? 0.5 : 0.2),
    emissive: isMetal ? 0x111111 : 0x000000,
    emissiveIntensity: isMetal ? 0.1 : 0.0,
    transparent: isPolycarbonate,
    opacity: isPolycarbonate ? 0.85 : 1.0,
    side: THREE.DoubleSide,
    flatShading: true 
  };

  return (
    <group>
      <ambientLight intensity={0.6} />
      <hemisphereLight color={0x87CEEB} groundColor={0x666666} intensity={0.8} />
      <directionalLight position={[5, 15, 8]} intensity={1.3} castShadow />
      <directionalLight position={[-3, 10, -4]} intensity={0.7} />
      <directionalLight position={[-6, 6, 2]} intensity={0.5} />
      <directionalLight position={[6, 6, 2]} intensity={0.5} />
      <pointLight position={[0, -1, 0]} intensity={0.2} />
      
      <mesh geometry={roofGeometry} castShadow receiveShadow>
        <meshStandardMaterial {...materialProps} />
      </mesh>
      
      {/* Крепления (саморезы с шайбами) */}
      <RoofFasteners params={params} />
    </group>
  );
};

export default React.memo(RoofCover);