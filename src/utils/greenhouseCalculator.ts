// src/utils/greenhouseCalculator.ts
import { GreenhouseParams } from '../types/GreenhouseTypes';
import { getGreenhousePrices, GreenhousePrices } from '../services/priceService';

export interface PipeDetail {
  size: string;
  length: number;
  pricePerMeter: number;
  cost: number;
}

export const calculateGreenhouseCost = async (params: GreenhouseParams) => {
  const prices: GreenhousePrices = await getGreenhousePrices();

  // ============================================================
  // 1. РАСЧЁТ ДЛИНЫ ТРУБ ПО ТИПОРАЗМЕРАМ
  // ============================================================
  
  let coverArea = 0;
  let frameLength = 0;
  
  if (params.type === 'arched') {
    const archLength = Math.PI * params.height / 2;
    coverArea = (params.length * archLength) + (params.width * params.length * 2);
    frameLength = (params.wallHeight * 4 * 2) + ((params.length * 2 + params.width * 2) * 2) + (params.length * 4 * 2);
  } else {
    const roofHeight = params.width * Math.tan(params.roofAngle * Math.PI / 180);
    const roofSide = Math.sqrt(Math.pow(params.width/2, 2) + Math.pow(roofHeight, 2));
    coverArea = (params.length * roofSide * 2) + (params.width * params.length * 2);
    frameLength = (params.wallHeight * 4 * 2) + ((params.length * 2 + params.width * 2) * 2) + (params.width * params.trussCount * 2);
  }
  
  // ============================================================
  // 2. ПОЛУЧЕНИЕ ЦЕН НА ТРУБЫ
  // ============================================================
  
  const getPipePrice = (size: string): number => {
    if (prices.pipes && (prices.pipes as any)[size]) {
      return (prices.pipes as any)[size];
    }
    
    const defaultPrices: Record<string, number> = {
      '40x20x2': 130,
      '40x20x1.5': 110,
      '60x60x3': 380,
      '80x80x3': 510,
    };
    
    return defaultPrices[size] || 130;
  };
  
  // Для теплицы используем трубу 40x20x2
  const pipeSize = '40x20x2';
  const pipePrice = getPipePrice(pipeSize);
  const frameCost = frameLength * pipePrice;
  
  // ============================================================
  // 3. ПОКРЫТИЕ
  // ============================================================
  
  const coverPrices = prices.cover?.[params.coverMaterial] || { material: 600, work: 400 };
  const coverCost = coverArea * coverPrices.material;
  const coverWorkCost = coverArea * coverPrices.work;
  
  // ============================================================
  // 4. ФУНДАМЕНТ
  // ============================================================
  
  const foundationPerimeter = (params.length * 2) + (params.width * 2);
  const foundationPrices = prices.foundation?.[params.foundationType] || { material: 1000, work: 500 };
  const foundationCost = foundationPerimeter * foundationPrices.material;
  const foundationWorkCost = foundationPerimeter * foundationPrices.work;
  
  // ============================================================
  // 5. ДОПОЛНИТЕЛЬНЫЕ ЭЛЕМЕНТЫ
  // ============================================================
  
  let additionalCost = 0;
  let additionalWorkCost = 0;
  
  if (params.hasVentilation) {
    additionalCost += prices.additional?.ventilation?.material || 2000;
    additionalWorkCost += prices.additional?.ventilation?.work || 1000;
  }
  if (params.hasDoors) {
    additionalCost += prices.additional?.doors?.material || 5000;
    additionalWorkCost += prices.additional?.doors?.work || 2000;
  }
  
  // Крепеж
  const screwCount = Math.ceil(coverArea * 8);
  const screwCost = screwCount * (prices.screws?.material || 10);
  const screwWorkCost = screwCount * (prices.screws?.work || 0.5);
  
  // Покраска
  const paintingArea = frameLength * 0.2;
  const paintingCost = paintingArea * ((prices.painting?.material || 100) + (prices.painting?.work || 100));
  
  // ============================================================
  // 6. ИТОГИ
  // ============================================================
  
  const totalMaterials = frameCost + coverCost + foundationCost + additionalCost + screwCost;
  const totalWorks = coverWorkCost + foundationWorkCost + additionalWorkCost + screwWorkCost + paintingCost;
  const totalCost = totalMaterials + totalWorks;
  
  return {
    frame: {
      name: 'Каркас',
      cost: frameCost,
      details: `${frameLength.toFixed(1)} м × ${pipePrice} ₽/м (${pipeSize})`
    },
    cover: {
      name: 'Покрытие',
      cost: coverCost,
      work: coverWorkCost,
      details: `${coverArea.toFixed(1)} м² × ${coverPrices.material} ₽/м²`
    },
    foundation: {
      name: 'Фундамент',
      cost: foundationCost,
      work: foundationWorkCost,
      details: `${foundationPerimeter.toFixed(1)} м.п. (${params.foundationType})`
    },
    additional: {
      name: 'Дополнительно',
      cost: additionalCost,
      work: additionalWorkCost,
      details: `${params.hasVentilation ? 'Вентиляция, ' : ''}${params.hasDoors ? 'Двери' : ''}`
    },
    screws: {
      name: 'Крепеж',
      cost: screwCost,
      work: screwWorkCost,
      details: `${screwCount} шт × 10 ₽`
    },
    painting: {
      name: 'Покраска',
      cost: paintingCost,
      details: `${paintingArea.toFixed(1)} м²`
    },
    totalMaterials,
    totalWorks,
    totalCost
  };
};