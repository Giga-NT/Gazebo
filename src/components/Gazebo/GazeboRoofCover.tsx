import React, { useMemo } from 'react';
import * as THREE from 'three';
import { GazeboParams } from '../../types/gazeboTypes';

const GazeboRoofCover: React.FC<{ params: GazeboParams; offsetY?: number }> = ({ params, offsetY = 0 }) => {
  const roofMaterial = (params as any).roofMaterial || 'metal';

  // Получаем толщину верхнего пояса фермы
  const trussThickness = useMemo(() => {
    const tubeSize = (params as any).roofTubeSize || (params as any).trussTubeSize || '60x60';
    const match = tubeSize.match(/(\d+)x(\d+)/);
    if (match) {
      return parseInt(match[1]) / 1000;
    }
    return 0.06;
  }, [params]);

  // Разные смещения для разных типов крыш
  const getTypeOffset = (): number => {
    switch (params.roofType) {
      case 'arched':
        return 0.05; // Арочная поднимаем на 2 см
      case 'single':
        return 0.05; // Односкатная поднимаем на 3 см
      case 'gable':
        return 0.00; // Двускатная не поднимаем
      default:
        return 0.00;
    }
  };

  const typeOffset = getTypeOffset();

  const profiledSheet = {
    waveWidth: 0.30,
    waveHeight: 0.035,
    flatTop: 0.10,
    flatBottom: 0.14,
  };

  const tileSheet = {
    waveWidth: 0.25,
    waveHeight: 0.035,
    rowHeight: 0.30,
    overlap: 0.03,
  };

  // Функция получения Y для кровли
  const getRoofBaseY = (x: number): number => {
    // Базовая высота кровли = высота фермы + смещение по типу
    const baseHeight = params.height + typeOffset;
    
    switch (params.roofType) {
      case 'arched': {
        const archWidth = params.width + (params.overhang * 2);
        const t = (x + archWidth / 2) / archWidth;
        const angle = t * Math.PI;
        return baseHeight + params.roofHeight * Math.sin(angle) + offsetY;
      }
      
      case 'gable': {
        const roofWidth = params.width + (params.overhang * 2);
        const halfWidth = roofWidth / 2;
        const absX = Math.abs(x);
        if (absX <= halfWidth) {
          const t2 = absX / halfWidth;
          return baseHeight + params.roofHeight * (1 - t2) + offsetY;
        }
        return baseHeight + offsetY;
      }
      
      case 'single': {
        const roofWidth = params.width + (params.overhang * 2);
        const tSingle = (x + roofWidth / 2) / roofWidth;
        return baseHeight + tSingle * params.roofHeight + offsetY;
      }
      
      default:
        return baseHeight + params.roofHeight + offsetY;
    }
  };

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

  const getTileY = (x: number, z: number, baseGeometryY: number): number => {
    const roofLength = params.length + (params.overhang * 2);
    const roofWidth = params.width + (params.overhang * 2);
    
    const wavePosZ = ((z + roofLength / 2) % tileSheet.waveWidth + tileSheet.waveWidth) % tileSheet.waveWidth;
    const tWaveZ = wavePosZ / tileSheet.waveWidth;
    const waveY = Math.sin(tWaveZ * Math.PI * 2) * (tileSheet.waveHeight / 2);

    let localRowY = 0;
    
    if (params.roofType === 'gable' || params.roofType === 'single') {
      let distFromStart = 0;
      if (params.roofType === 'gable') {
        distFromStart = Math.abs(x);
      } else {
        const roofWidthSingle = params.width + (params.overhang * 2);
        distFromStart = x + roofWidthSingle / 2;
      }

      const rowNumber = Math.floor(distFromStart / tileSheet.rowHeight);
      const posInRow = distFromStart - (rowNumber * tileSheet.rowHeight);
      const tRow = posInRow / tileSheet.rowHeight;
      
      localRowY = (1 - tRow) * tileSheet.overlap;
      const tileBulge = Math.sin(tRow * Math.PI) * 0.01;
      localRowY += tileBulge;
    }
    
    return baseGeometryY + localRowY + waveY;
  };

  const getFinalY = (x: number, z: number): number => {
    const baseY = getRoofBaseY(x);
    const coverOffset = 0.02;
    
    const effectiveMaterial = (params.roofType === 'arched' && roofMaterial === 'tile') 
      ? 'metal' 
      : roofMaterial;
    
    if (effectiveMaterial === 'metal') {
      return getProfiledWaveY(z, baseY + coverOffset);
    } else if (effectiveMaterial === 'tile') {
      return getTileY(x, z, baseY + coverOffset);
    }
    
    return baseY + coverOffset;
  };

  const getMaterialColor = (): THREE.Color => {
    if (params.roofColor && params.roofColor !== '#000000') {
      return new THREE.Color(params.roofColor);
    }
    switch (roofMaterial) {
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
    
    const isTile = roofMaterial === 'tile';
    
    const segmentsX = isTile ? 150 : 80; 
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
  }, [params, roofMaterial, offsetY, trussThickness, typeOffset]);

  const materialColor = getMaterialColor();
  const isMetal = roofMaterial === 'metal';
  const isTile = roofMaterial === 'tile';
  const isPolycarbonate = roofMaterial === 'polycarbonate';
  
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
    <mesh
      geometry={roofGeometry}
      castShadow
      receiveShadow
    >
      <meshStandardMaterial {...materialProps} />
    </mesh>
  );
};

export default React.memo(GazeboRoofCover);