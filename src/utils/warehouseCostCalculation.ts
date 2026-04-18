// src/utils/warehouseCostCalculation.ts
import { WarehouseParams } from '../types/warehouseTypes';

export const calculateWarehouseCost = (params: WarehouseParams) => {
  // Цены
  const prices = {
    frame: {
      material: 35000,  // руб/м³
      work: 15000       // руб/м³
    },
    roof: {
      material: 2500,   // руб/м²
      work: 500         // руб/м²
    },
    wall: {
      material: 2000,   // руб/м²
      work: 500         // руб/м²
    },
    gate: {
      material: 80000,  // руб/шт
      work: 20000       // руб/шт
    }
  };

  // Площадь кровли с учётом типа крыши
  let roofArea = params.length * params.width;
  if (params.roofType === 'gable') roofArea *= 1.2;
  else if (params.roofType === 'single') roofArea *= 1.1;

  // Объём колонн (каркас)
  const columnCount = Math.ceil(params.length / params.columnSpacing) + 1;
  const columnVolume = columnCount * 2 * params.wallHeight * 0.04; // 0.04м² сечение
  
  // Объём ферм
  const trussVolume = params.trussCount * params.width * 0.02; // 0.02м² сечение
  
  const totalFrameVolume = columnVolume + trussVolume;

  // Площадь стен
  const wallArea = params.wallHeight * params.length * 2 + params.wallHeight * params.width * 2;

  // === МАТЕРИАЛЫ ===
  const frameMaterialCost = totalFrameVolume * prices.frame.material;
  const roofMaterialCost = roofArea * prices.roof.material;
  const wallMaterialCost = params.wallMaterial !== 'none' ? wallArea * prices.wall.material : 0;
  const gateMaterialCost = params.gateType !== 'none' ? params.gateCount * prices.gate.material : 0;

  // === РАБОТЫ ===
  const frameWorkCost = totalFrameVolume * prices.frame.work;
  const roofWorkCost = roofArea * prices.roof.work;
  const wallWorkCost = params.wallMaterial !== 'none' ? wallArea * prices.wall.work : 0;
  const gateWorkCost = params.gateType !== 'none' ? params.gateCount * prices.gate.work : 0;

  // === ИТОГИ ===
  const totalMaterials = frameMaterialCost + roofMaterialCost + wallMaterialCost + gateMaterialCost;
  const totalWorks = frameWorkCost + roofWorkCost + wallWorkCost + gateWorkCost;
  const totalCost = totalMaterials + totalWorks;

  return {
    frame: {
      name: 'Каркас (колонны + фермы)',
      cost: frameMaterialCost,
      work: frameWorkCost,
      volume: totalFrameVolume,
      details: `${totalFrameVolume.toFixed(2)} м³ × ${prices.frame.material} ₽/м³ (мат) + ${prices.frame.work} ₽/м³ (раб)`
    },
    roof: {
      name: 'Кровля',
      cost: roofMaterialCost,
      work: roofWorkCost,
      area: roofArea,
      details: `${roofArea.toFixed(1)} м² × ${prices.roof.material} ₽/м² (мат) + ${prices.roof.work} ₽/м² (раб)`
    },
    walls: {
      name: 'Стены',
      cost: wallMaterialCost,
      work: wallWorkCost,
      area: wallArea,
      details: params.wallMaterial !== 'none' 
        ? `${wallArea.toFixed(1)} м² × ${prices.wall.material} ₽/м² (мат) + ${prices.wall.work} ₽/м² (раб)`
        : 'Не требуются'
    },
    gates: {
      name: 'Ворота',
      cost: gateMaterialCost,
      work: gateWorkCost,
      count: params.gateCount,
      details: params.gateType !== 'none'
        ? `${params.gateCount} шт × ${prices.gate.material} ₽/шт (мат) + ${prices.gate.work} ₽/шт (раб)`
        : 'Не требуются'
    },
    totalMaterials,
    totalWorks,
    totalCost
  };
};