// src/utils/warehouseCostCalculation.ts
import { WarehouseParams } from '../types/warehouseTypes';

export const calculateWarehouseCost = (params: WarehouseParams) => {
  const prices = {
    frame: 50000,
    roof: 3000,
    wall: 2500,
    gate: 100000,
  };

  let roofArea = params.length * params.width;
  if (params.roofType === 'gable') roofArea *= 1.2;
  else if (params.roofType === 'single') roofArea *= 1.1;

  const columnVolume = (params.length / params.columnSpacing + 1) * 2 * params.wallHeight * 0.04;
  const trussVolume = params.trussCount * params.width * 0.02;
  const frameCost = (columnVolume + trussVolume) * prices.frame;

  const roofCost = roofArea * prices.roof;
  const wallArea = params.wallHeight * params.length * 2 + params.wallHeight * params.width * 2;
  const wallCost = params.wallMaterial !== 'none' ? wallArea * prices.wall : 0;
  const gateCost = params.gateType !== 'none' ? params.gateCount * prices.gate : 0;

  const totalCost = frameCost + roofCost + wallCost + gateCost;

  return {
    frameCost,
    roofCost,
    wallCost,
    gateCost,
    totalCost,
  };
};