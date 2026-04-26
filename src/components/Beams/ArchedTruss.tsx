import React, { useMemo } from 'react';
import * as THREE from 'three';
import { CanopyParams } from '../../types/types';
import Beam from './Beam';

interface ArchedTrussProps {
  params: CanopyParams;
  positionZ: number;
  isLast?: boolean;
  nextPositionZ?: number;
  allPositions?: number[];
  trussIndex?: number;
}

const ArchedTruss: React.FC<ArchedTrussProps> = ({ params, positionZ, isLast, nextPositionZ, allPositions, trussIndex }) => {
  const getTubeDimensions = (size: string) => {
    const dimensions: Record<string, { width: number; thickness: number }> = {
      '40x40': { width: 0.04, thickness: 0.04 },
      '50x50': { width: 0.05, thickness: 0.05 },
      '60x60': { width: 0.06, thickness: 0.06 },
      '80x80': { width: 0.08, thickness: 0.08 },
      '100x100': { width: 0.1, thickness: 0.1 },
    };
    return dimensions[size] || { width: 0.1, thickness: 0.2 };
  };

  const trussDimensions = useMemo(() => getTubeDimensions(params.trussTubeSize), [params.trussTubeSize]);
  const roofDimensions = useMemo(() => getTubeDimensions(params.roofTubeSize), [params.roofTubeSize]);
  
  const trussDepth = Math.max(0.15, params.roofHeight * 0.2);

  // ==========================================================
  // ГЕНЕРАЦИЯ ТОЧЕК
  // ==========================================================
  const { upperPoints, lowerPoints, segmentsCount } = useMemo(() => {
    const roofWidth = params.width + (params.overhang * 2);
    const upper: THREE.Vector3[] = [];
    const lower: THREE.Vector3[] = [];
    const segments = 400;
    
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const angle = t * Math.PI;
      
      const x = -roofWidth / 2 + (roofWidth * t);
      const y = params.roofHeight * Math.sin(angle);
      
      const pUpper = new THREE.Vector3(x, y, 0);
      upper.push(pUpper);

      const dx = roofWidth; 
      const dy = params.roofHeight * Math.PI * Math.cos(angle);
      
      const tangent = new THREE.Vector3(dx, dy, 0).normalize();
      const normal = new THREE.Vector3(-tangent.y, tangent.x, 0).normalize();
      const innerNormal = normal.clone().negate();
      
      const pLower = pUpper.clone().add(innerNormal.multiplyScalar(trussDepth));
      lower.push(pLower);
    }
    
    return { upperPoints: upper, lowerPoints: lower, segmentsCount: segments };
  }, [params.width, params.overhang, params.roofHeight, trussDepth]);

  // ==========================================================
  // ГЕНЕРАЦИЯ ЭЛЕМЕНТОВ ФЕРМЫ
  // ==========================================================
  const trussElements = useMemo(() => {
    const elements: React.ReactElement[] = [];
    const segments = segmentsCount;

    // ВЕРХНИЙ ПОЯС
    for (let i = 0; i < segments; i++) {
      elements.push(
        <Beam
          key={`upper-${i}`}
          start={upperPoints[i]}
          end={upperPoints[i + 1]}
          dimensions={roofDimensions}
          color={params.frameColor}
        />
      );
    }

    // НИЖНИЙ ПОЯС
    for (let i = 0; i < segments; i++) {
      elements.push(
        <Beam
          key={`lower-${i}`}
          start={lowerPoints[i]}
          end={lowerPoints[i + 1]}
          dimensions={trussDimensions}
          color={params.frameColor}
        />
      );
    }

    // ВНУТРЕННИЕ СТОЙКИ
    const verticalCount = 8; 
    const verticalIndices: number[] = [];

    for (let i = 1; i <= verticalCount; i++) {
      const t = i / (verticalCount + 1);
      const floatIdx = t * segments;
      const idx = Math.floor(floatIdx);
      
      if (idx >= 0 && idx < segments) {
        const upperPoint = upperPoints[idx];
        const lowerPoint = lowerPoints[idx];

        verticalIndices.push(idx);

        elements.push(
          <Beam
            key={`vertical-${i}`}
            start={lowerPoint}
            end={upperPoint}
            dimensions={trussDimensions}
            color={params.frameColor}
          />
        );
      }
    }

    // УГЛОВЫЕ СТОЙКИ
    const offsetX = trussDimensions.width / 2;
    
    const leftUpper = new THREE.Vector3(
      upperPoints[0].x + offsetX + 0.01,
      upperPoints[0].y,
      0
    );
    const leftLower = new THREE.Vector3(
      lowerPoints[0].x + offsetX + 0.01,
      lowerPoints[0].y,
      0
    );
    
    const rightUpper = new THREE.Vector3(
      upperPoints[segments].x - offsetX - 0.01,
      upperPoints[segments].y,
      0
    );
    const rightLower = new THREE.Vector3(
      lowerPoints[segments].x - offsetX - 0.01,
      lowerPoints[segments].y,
      0
    );
    
    elements.push(
      <Beam
        key="end-left"
        start={leftLower}
        end={leftUpper}
        dimensions={trussDimensions}
        color={params.frameColor}
      />,
      <Beam
        key="end-right"
        start={rightLower}
        end={rightUpper}
        dimensions={trussDimensions}
        color={params.frameColor}
      />
    );

    // ДИАГОНАЛЬНЫЕ РАСКОСЫ
    if (params.trussType === 'reinforced') {
      const allVerticalPositions = [0, ...verticalIndices.map(i => Math.floor((i / segments) * segments)), segments];
      
      for (let i = 0; i < allVerticalPositions.length - 1; i++) {
        const startIdx = allVerticalPositions[i];
        const endIdx = allVerticalPositions[i + 1];

        if (endIdx - startIdx < 2) continue;

        const pLowerStart = lowerPoints[startIdx];
        const pUpperEnd = upperPoints[endIdx];
        const pUpperStart = upperPoints[startIdx];
        const pLowerEnd = lowerPoints[endIdx];

        elements.push(
          <Beam
            key={`diag-cross-a-${i}`}
            start={pLowerStart}
            end={pUpperEnd}
            dimensions={trussDimensions}
            color={params.frameColor}
          />,
          <Beam
            key={`diag-cross-b-${i}`}
            start={pUpperStart}
            end={pLowerEnd}
            dimensions={trussDimensions}
            color={params.frameColor}
          />
        );
      }
    }

    return elements;
  }, [upperPoints, lowerPoints, segmentsCount, params, roofDimensions, trussDimensions]);

  // ==========================================================
  // ПРОДОЛЬНЫЕ ПРОГОНЫ (только если не последняя ферма)
  // ==========================================================
  const longitudinalElements = useMemo(() => {
    if (isLast || nextPositionZ === undefined) return null;
    
    const elements: React.ReactElement[] = [];
    const roofWidth = params.width + (params.overhang * 2);
    const distance = nextPositionZ - positionZ;
    
    // Верхние продольные прогоны (по дуге)
    const longitudinalSteps = 3;
    
    for (let step = 0; step <= longitudinalSteps; step++) {
      const t = step / longitudinalSteps;
      const idx = Math.min(Math.floor(t * segmentsCount), segmentsCount - 1);
      const pointT = (t * segmentsCount) % 1;
      
      if (idx < segmentsCount && idx + 1 <= segmentsCount) {
        const currentPoint = new THREE.Vector3().lerpVectors(
          upperPoints[idx],
          upperPoints[idx + 1],
          pointT
        );
        
        const nextPoint = new THREE.Vector3(
          currentPoint.x,
          currentPoint.y,
          distance
        );
        
        elements.push(
          <Beam
            key={`long-upper-${trussIndex}-${step}`}
            start={currentPoint}
            end={nextPoint}
            dimensions={roofDimensions}
            color={params.frameColor}
          />
        );
      }
    }
    
    return elements;
  }, [isLast, nextPositionZ, positionZ, params, roofDimensions, upperPoints, segmentsCount, trussIndex]);

  return (
    <group position={[0, params.height, positionZ]}>
      {trussElements}
      {longitudinalElements}
    </group>
  );
};

export default React.memo(ArchedTruss);