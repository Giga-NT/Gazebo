// src/utils/gazeboCostCalculation.ts
import { GazeboParams } from '../types/gazeboTypes';
import { getGazeboPrices, GazeboPrices } from '../services/priceService';

export interface PipeDetail {
  size: string;
  length: number;
  pricePerMeter: number;
  cost: number;
}

export const calculateGazeboCost = async (params: GazeboParams) => {
  const prices: GazeboPrices = await getGazeboPrices();

  // ============================================================
  // 1. РАСЧЁТ ДЛИНЫ ТРУБ ПО ТИПОРАЗМЕРАМ
  // ============================================================
  
  const perimeter = (params.width + params.length) * 2;
  
  // Стойки (4 угловые + промежуточные)
  const pillarCount = 4 + Math.floor(perimeter / 2);
  const pillarLength = pillarCount * params.height;
  
  // Верхняя обвязка (периметр)
  const topFrameLength = perimeter;
  
  // Фермы крыши
  let roofArea = params.width * params.length;
  let trussCount = 4;
  let trussLength = 0;
  
  if (params.roofType === 'gable') {
    roofArea *= 1.2;
    trussLength = params.width * trussCount * 2;
  } else if (params.roofType === 'arched') {
    roofArea *= 1.3;
    trussLength = params.width * trussCount * 2.5;
  } else {
    trussLength = params.width * trussCount * 2;
  }
  
  // Обрешётка
  const lathingStep = 0.5;
  const lathingRows = Math.ceil(params.length / lathingStep) + 1;
  const lathingLength = lathingRows * params.width;
  
  // ============================================================
  // 2. ПОЛУЧЕНИЕ ЦЕН НА ТРУБЫ
  // ============================================================
  
  const getPipePrice = (size: string): number => {
    if (prices.pipes && (prices.pipes as any)[size]) {
      return (prices.pipes as any)[size];
    }
    
    const defaultPrices: Record<string, number> = {
      '80x80x3': 510,
      '80x80x2': 380,
      '60x60x3': 380,
      '60x60x2': 280,
      '40x20x2': 130,
      '40x20x1.5': 110,
    };
    
    return defaultPrices[size] || 280;
  };
  
  const pipeDetails: PipeDetail[] = [];
  
  // Стойки (80x80x3)
  const pillarSize = '80x80x3';
  pipeDetails.push({
    size: pillarSize,
    length: pillarLength,
    pricePerMeter: getPipePrice(pillarSize),
    cost: pillarLength * getPipePrice(pillarSize)
  });
  
  // Верхняя обвязка (80x80x2)
  const frameSize = '80x80x2';
  pipeDetails.push({
    size: frameSize,
    length: topFrameLength,
    pricePerMeter: getPipePrice(frameSize),
    cost: topFrameLength * getPipePrice(frameSize)
  });
  
  // Фермы (60x60x3)
  const trussSize = '60x60x3';
  pipeDetails.push({
    size: trussSize,
    length: trussLength,
    pricePerMeter: getPipePrice(trussSize),
    cost: trussLength * getPipePrice(trussSize)
  });
  
  // Обрешётка (40x20x2)
  const lathingSize = '40x20x2';
  pipeDetails.push({
    size: lathingSize,
    length: lathingLength,
    pricePerMeter: getPipePrice(lathingSize),
    cost: lathingLength * getPipePrice(lathingSize)
  });
  
  const totalPipeCost = pipeDetails.reduce((sum, p) => sum + p.cost, 0);
  const totalPipeLength = pipeDetails.reduce((sum, p) => sum + p.length, 0);
  
  const getFrameDetails = () => {
    return pipeDetails
      .filter(p => p.length > 0)
      .map(p => `${p.size}: ${p.length.toFixed(1)} м = ${p.cost.toLocaleString('ru-RU')} ₽`)
      .join('\n');
  };
  
  // ============================================================
  // 3. ОСТАЛЬНЫЕ МАТЕРИАЛЫ
  // ============================================================
  
  // Кровля
  let roofPricePerM2 = 0;
  if (params.materialType === 'wood') {
    roofPricePerM2 = prices.roofing?.shingles || 800;
  } else {
    roofPricePerM2 = prices.roofing?.metal || 600;
  }
  const roofCost = roofArea * roofPricePerM2;
  
  // Фундамент
  const foundationPerimeter = perimeter;
  const foundationPrices = prices.foundation?.[params.foundationType] || { material: 2500, work: 1200 };
  const foundationCost = foundationPerimeter * foundationPrices.material;
  const foundationWorkCost = foundationPerimeter * foundationPrices.work;
  
  // Пол
  const floorArea = params.width * params.length;
  let floorPrice = 0;
  switch (params.floorType) {
    case 'wood': floorPrice = prices.wood?.material || 1500; break;
    case 'concrete': floorPrice = prices.concrete?.material || 1800; break;
    case 'tile': floorPrice = prices.tile?.material || 2000; break;
    default: floorPrice = 0;
  }
  const floorCost = floorArea * floorPrice;
  
  // Мебель
  const furnitureCost = params.hasFurniture
    ? (params.benchCount * (prices.furniture?.bench || 3000)) + (prices.furniture?.table?.[params.tableSize] || 5000)
    : 0;
  
  // Работы
  const frameWorkCost = totalPipeLength * (prices.metal?.work || 600);
  const roofWorkCost = roofArea * (roofPricePerM2 * 0.5);
  const floorWorkCost = floorArea * (floorPrice * 0.3);
  const furnitureWorkCost = furnitureCost * 0.3;
  
  const totalMaterials = totalPipeCost + roofCost + foundationCost + floorCost + furnitureCost;
  const totalWorks = frameWorkCost + roofWorkCost + foundationWorkCost + floorWorkCost + furnitureWorkCost;
  const totalCost = totalMaterials + totalWorks;
  
  return {
    pipeDetails,
    totalPipeLength,
    totalPipeCost,
    frame: {
      name: 'Металлоконструкции',
      cost: totalPipeCost,
      details: `Всего труб: ${totalPipeLength.toFixed(1)} м\n` + getFrameDetails()
    },
    roof: {
      name: 'Крыша',
      cost: roofCost,
      details: `${roofArea.toFixed(1)} м² × ${roofPricePerM2} ₽/м²`
    },
    foundation: {
      name: 'Фундамент',
      cost: foundationCost,
      work: foundationWorkCost,
      details: `Периметр: ${foundationPerimeter.toFixed(1)} м (${params.foundationType})`
    },
    floor: {
      name: 'Пол',
      cost: floorCost,
      work: floorWorkCost,
      details: `${floorArea.toFixed(1)} м² × ${floorPrice} ₽/м²`
    },
    furniture: {
      name: 'Мебель',
      cost: furnitureCost,
      work: furnitureWorkCost,
      details: `Скамейки: ${params.benchCount} шт, Стол: ${params.tableSize}`
    },
    frameWork: {
      name: 'Сборка каркаса',
      cost: frameWorkCost,
      details: `${totalPipeLength.toFixed(1)} м × ${prices.metal?.work || 600} ₽/м`
    },
    totalMaterials,
    totalWorks,
    totalCost
  };
};