import React, { useMemo } from 'react';
import { CanopyParams } from '../../types/types';
import ArchedTruss from './ArchedTruss';

const ArchedTrusses: React.FC<{ params: CanopyParams }> = ({ params }) => {
  const trussPositions = useMemo(() => {
    const positions: number[] = [];
    const step = params.length / (params.trussCount - 1);
    for (let i = 0; i < params.trussCount; i++) {
      positions.push(-params.length / 2 + i * step);
    }
    return positions;
  }, [params.length, params.trussCount]);

  return (
    <>
      {trussPositions.map((zPos, index) => (
        <ArchedTruss
          key={`arched-truss-${index}`}
          params={params}
          positionZ={zPos}
          isLast={index === trussPositions.length - 1}
          nextPositionZ={trussPositions[index + 1]}
          allPositions={trussPositions}
          trussIndex={index}
        />
      ))}
    </>
  );
};

export default ArchedTrusses;