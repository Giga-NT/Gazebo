import React, { useMemo } from 'react';
import * as THREE from 'three';
import { CanopyParams } from '../../types/types';
import Beam from './Beam';

interface LongitudinalBeamsProps {
  params: CanopyParams;
}

const LongitudinalBeams: React.FC<LongitudinalBeamsProps> = ({ params }) => {
  const getTubeDimensions = (size: string) => {
    const dimensions: Record<string, { width: number; thickness: number }> = {
      '40x40': { width: 0.04, thickness: 0.04 },
      '50x50': { width: 0.05, thickness: 0.05 },
      '60x60': { width: 0.06, thickness: 0.06 },
      '80x80': { width: 0.08, thickness: 0.08 },
      '100x100': { width: 0.1, thickness: 0.1 },
    };
    return dimensions[size] || { width: 0.1, thickness: 0.1 };
  };

  const pillarDimensions = getTubeDimensions(params.pillarTubeSize);
  const beamDimensions = getTubeDimensions(params.trussTubeSize);
  
  // ТОЧНЫЙ РАСЧЕТ СМЕЩЕНИЯ:
  const pillarWidth = pillarDimensions.width;
  const beamWidth = beamDimensions.width;
  const beamThickness = beamDimensions.thickness;
  
  // Смещение по X (как у вас было)
  const offset = pillarWidth - (beamWidth / 2);
  
  // Левые и правые продольные балки
  const leftBeamX = -params.width / 2 - offset/24;
  const rightBeamX = params.width / 2 + offset/24;
  
  // Смещение по Y вниз на половину толщины трубы
  const yOffset = beamThickness / 2;
  const beamY = params.height - yOffset;
  
  // Позиции опорных стоек по длине
  const pillarZPositions = useMemo(() => {
    const positions: number[] = [];
    const step = params.length / (params.pillarCount - 1);
    for (let i = 0; i < params.pillarCount; i++) {
      positions.push(-params.length / 2 + i * step);
    }
    return positions;
  }, [params.length, params.pillarCount]);
  
  const elements = useMemo(() => {
    const result: React.ReactElement[] = [];
    
    // Левая продольная балка
    for (let i = 0; i < pillarZPositions.length - 1; i++) {
      const startZ = pillarZPositions[i];
      const endZ = pillarZPositions[i + 1];
      
      result.push(
        <Beam
          key={`long-beam-left-${i}`}
          start={new THREE.Vector3(leftBeamX, beamY, startZ)}
          end={new THREE.Vector3(leftBeamX, beamY, endZ)}
          dimensions={beamDimensions}
          color={params.frameColor}
        />
      );
    }
    
    // Правая продольная балка
    for (let i = 0; i < pillarZPositions.length - 1; i++) {
      const startZ = pillarZPositions[i];
      const endZ = pillarZPositions[i + 1];
      
      result.push(
        <Beam
          key={`long-beam-right-${i}`}
          start={new THREE.Vector3(rightBeamX, beamY, startZ)}
          end={new THREE.Vector3(rightBeamX, beamY, endZ)}
          dimensions={beamDimensions}
          color={params.frameColor}
        />
      );
    }
    
    return result;
  }, [pillarZPositions, leftBeamX, rightBeamX, beamY, params.frameColor, beamDimensions]);
  
  return <>{elements}</>;
};

export default LongitudinalBeams;