import { ProjectParams } from '../types/types';
import { getCanopyPrices, CanopyPrices } from '../services/priceService';

export interface PipeDetail {
  size: string;
  length: number;
  pricePerMeter: number;
  cost: number;
}

export const calculateCanopyCost = async (params: ProjectParams) => {
  const prices: CanopyPrices = await getCanopyPrices();
  
  const roofArea = params.length * params.width * (params.roofType === 'gable' ? 1.2 : 1);
  
  // ============================================================
  // 1. РАСЧЁТ ДЛИНЫ ТРУБ ПО ТИПОРАЗМЕРАМ
  // ============================================================
  
  const pillarCountTotal = (params.pillarCount || 4) * 2;
  const pillarLength = pillarCountTotal * params.height;
  const horizontalLength = (params.length * 2 + params.width * 2);
  
  const trussCount = params.trussCount || 4;
  const trussMainLength = trussCount * params.width * 2;
  const trussDiagonalLength = trussCount * params.width * 1.2;
  const trussTotalLength = trussMainLength + trussDiagonalLength;
  
  const lathingStep = params.lathingStep || 0.5;
  const lathingRows = Math.ceil(params.length / lathingStep) + 1;
  const lathingLength = lathingRows * params.width;
  
  const longitudinalLength = trussCount * params.length;
  
  // ============================================================
  // 2. ПОЛУЧЕНИЕ ЦЕН НА ТРУБЫ
  // ============================================================
  
  const getPipePrice = (size: string): number => {
    // Проверяем, существует ли prices.pipes
    if (prices.pipes && (prices.pipes as any)[size]) {
      return (prices.pipes as any)[size];
    }
    
    // Цены по умолчанию (реальные от СПК)
    const defaultPrices: Record<string, number> = {
      '80x80x3': 510,
      '80x80x2': 380,
      '60x60x3': 380,
      '60x60x2': 280,
      '40x20x2': 130,
      '40x20x1.5': 110,
      '100x100x3': 650,
      '100x100x4': 850,
    };
    
    return defaultPrices[size] || prices.frame?.material || 180;
  };
  
  const pipeDetails: PipeDetail[] = [];
  
  const pillarSize = params.pillarTubeSize || '80x80x3';
  pipeDetails.push({
    size: pillarSize,
    length: pillarLength,
    pricePerMeter: getPipePrice(pillarSize),
    cost: pillarLength * getPipePrice(pillarSize)
  });
  
  const beamSize = params.roofTubeSize || '80x80x2';
  pipeDetails.push({
    size: beamSize,
    length: horizontalLength,
    pricePerMeter: getPipePrice(beamSize),
    cost: horizontalLength * getPipePrice(beamSize)
  });
  
  const trussSize = params.trussTubeSize || '60x60x3';
  pipeDetails.push({
    size: trussSize,
    length: trussTotalLength,
    pricePerMeter: getPipePrice(trussSize),
    cost: trussTotalLength * getPipePrice(trussSize)
  });
  
  const lathingSize = params.lathingTubeSize || '40x20x2';
  pipeDetails.push({
    size: lathingSize,
    length: lathingLength,
    pricePerMeter: getPipePrice(lathingSize),
    cost: lathingLength * getPipePrice(lathingSize)
  });
  
  pipeDetails.push({
    size: lathingSize,
    length: longitudinalLength,
    pricePerMeter: getPipePrice(lathingSize),
    cost: longitudinalLength * getPipePrice(lathingSize)
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
  // 3. ОСТАЛЬНЫЕ МАТЕРИАЛЫ И РАБОТЫ
  // ============================================================
  
  let roofMaterialPrice = 0;
  let roofWorkPrice = 0;
  if (params.roofMaterial === 'polycarbonate') {
    roofMaterialPrice = prices.roofMaterial?.polycarbonate?.material || 600;
    roofWorkPrice = prices.roofMaterial?.polycarbonate?.work || 400;
  } else if (params.roofMaterial === 'metal') {
    roofMaterialPrice = prices.roofMaterial?.metal?.material || 800;
    roofWorkPrice = prices.roofMaterial?.metal?.work || 400;
  } else {
    roofMaterialPrice = prices.roofMaterial?.tile?.material || 1500;
    roofWorkPrice = prices.roofMaterial?.tile?.work || 700;
  }
  
  const roofCost = roofArea * roofMaterialPrice;
  const roofWorkCost = roofArea * roofWorkPrice;
  
  const foundationCost = pillarCountTotal * (prices.pillar?.material || 1200);
  const foundationWorkCost = pillarCountTotal * (prices.pillar?.work || 800);
  
  const screwCount = Math.ceil(roofArea * 8);
  const screwsCost = screwCount * (prices.screws?.material || 10);
  const screwsWorkCost = screwCount * (prices.screws?.work || 0.5);
  
  const frameAssemblyCost = totalPipeLength * (prices.frame?.work || 200);
  const paintingArea = totalPipeLength * 0.2 + roofArea * 0.3;
  const paintingCost = paintingArea * (prices.painting?.work || 150);
  
  const totalMaterials = roofCost + totalPipeCost + foundationCost + screwsCost;
  const totalWorks = roofWorkCost + frameAssemblyCost + paintingCost + foundationWorkCost + screwsWorkCost;
  const totalAmount = totalMaterials + totalWorks;
  
  return {
    pipeDetails,
    totalPipeLength,
    totalPipeCost,
    roof: {
      name: 'Материал кровли',
      cost: roofCost,
      details: `${roofArea.toFixed(1)} м² × ${roofMaterialPrice} ₽/м²`
    },
    frame: {
      name: 'Металлоконструкции',
      cost: totalPipeCost,
      details: `Всего труб: ${totalPipeLength.toFixed(1)} м\n` + getFrameDetails()
    },
    foundation: {
      name: 'Фундамент',
      cost: foundationCost,
      work: foundationWorkCost,
      details: `${pillarCountTotal} столбов (${pillarSize})`
    },
    fasteners: {
      name: 'Крепеж',
      cost: screwsCost,
      work: screwsWorkCost,
      details: `${screwCount} шт × ${prices.screws?.material || 10} ₽`
    },
    roofWork: {
      name: 'Монтаж кровли',
      cost: roofWorkCost,
      details: `${roofArea.toFixed(1)} м² × ${roofWorkPrice} ₽/м²`
    },
    frameWork: {
      name: 'Сборка каркаса',
      cost: frameAssemblyCost,
      details: `${totalPipeLength.toFixed(1)} м × ${prices.frame?.work || 200} ₽/м`
    },
    painting: {
      name: 'Покраска',
      cost: paintingCost,
      details: `${paintingArea.toFixed(1)} м² × ${prices.painting?.work || 150} ₽/м²`
    },
    totalMaterials,
    totalWorks,
    totalAmount
  };
};