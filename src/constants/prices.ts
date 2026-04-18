// src/constants/prices.ts
// Реальные цены от СПК (Екатеринбург) от 18.04.2026
// Источник: розничный прайс-лист на профильную трубу

export interface PipePrice {
  width: number;      // ширина, мм
  height: number;     // высота, мм
  thickness: number;  // толщина стенки, мм
  pricePerMeter: number; // цена за метр погонный, руб
  weightPerMeter: number; // вес 1 м.п., кг
  isColdRolled?: boolean; // х/к (холоднокатаная)
  steel?: string;     // марка стали (С355 и т.д.)
}

// Труба профильная 10-60 (малые размеры)
export const smallProfilePipes: PipePrice[] = [
  { width: 10, height: 10, thickness: 1, pricePerMeter: 30, weightPerMeter: 0.270, isColdRolled: true },
  { width: 10, height: 10, thickness: 1.2, pricePerMeter: 30, weightPerMeter: 0.310, isColdRolled: true },
  { width: 20, height: 20, thickness: 0.8, pricePerMeter: 40, weightPerMeter: 0.470, isColdRolled: true },
  { width: 20, height: 20, thickness: 1, pricePerMeter: 50, weightPerMeter: 0.580, isColdRolled: true },
  { width: 20, height: 20, thickness: 1.2, pricePerMeter: 60, weightPerMeter: 0.700, isColdRolled: true },
  { width: 20, height: 20, thickness: 1.5, pricePerMeter: 70, weightPerMeter: 0.840 },
  { width: 20, height: 20, thickness: 2, pricePerMeter: 80, weightPerMeter: 1.080 },
  { width: 25, height: 25, thickness: 1, pricePerMeter: 70, weightPerMeter: 0.740, isColdRolled: true },
  { width: 25, height: 25, thickness: 1.2, pricePerMeter: 80, weightPerMeter: 0.880, isColdRolled: true },
  { width: 25, height: 25, thickness: 1.5, pricePerMeter: 90, weightPerMeter: 1.070 },
  { width: 25, height: 25, thickness: 2, pricePerMeter: 110, weightPerMeter: 1.390 },
  { width: 30, height: 20, thickness: 1.5, pricePerMeter: 90, weightPerMeter: 1.080 },
  { width: 30, height: 20, thickness: 2, pricePerMeter: 110, weightPerMeter: 1.390 },
  { width: 30, height: 30, thickness: 1.2, pricePerMeter: 100, weightPerMeter: 1.070, isColdRolled: true },
  { width: 30, height: 30, thickness: 1.5, pricePerMeter: 110, weightPerMeter: 1.310 },
  { width: 30, height: 30, thickness: 2, pricePerMeter: 130, weightPerMeter: 1.700 },
  { width: 40, height: 20, thickness: 1.2, pricePerMeter: 100, weightPerMeter: 1.070, isColdRolled: true },
  { width: 40, height: 20, thickness: 1.5, pricePerMeter: 110, weightPerMeter: 1.310 },
  { width: 40, height: 20, thickness: 2, pricePerMeter: 130, weightPerMeter: 1.700 },
  { width: 40, height: 25, thickness: 1.5, pricePerMeter: 120, weightPerMeter: 1.430 },
  { width: 40, height: 25, thickness: 2, pricePerMeter: 140, weightPerMeter: 1.860 },
  { width: 40, height: 25, thickness: 3, pricePerMeter: 210, weightPerMeter: 2.660 },
  { width: 40, height: 40, thickness: 1.5, pricePerMeter: 150, weightPerMeter: 1.780 },
  { width: 40, height: 40, thickness: 2, pricePerMeter: 180, weightPerMeter: 2.330 },
  { width: 40, height: 40, thickness: 3, pricePerMeter: 250, weightPerMeter: 3.360 },
  { width: 40, height: 40, thickness: 4, pricePerMeter: 320, weightPerMeter: 4.300 },
  { width: 50, height: 25, thickness: 1.5, pricePerMeter: 140, weightPerMeter: 1.670 },
  { width: 50, height: 25, thickness: 2, pricePerMeter: 170, weightPerMeter: 2.170 },
  { width: 50, height: 25, thickness: 2.5, pricePerMeter: 200, weightPerMeter: 2.660 },
  { width: 50, height: 50, thickness: 1.5, pricePerMeter: 200, weightPerMeter: 2.250 },
  { width: 50, height: 50, thickness: 2, pricePerMeter: 230, weightPerMeter: 2.960 },
  { width: 50, height: 50, thickness: 3, pricePerMeter: 320, weightPerMeter: 4.310 },
  { width: 50, height: 50, thickness: 4, pricePerMeter: 410, weightPerMeter: 5.560 },
  { width: 50, height: 50, thickness: 5, pricePerMeter: 660, weightPerMeter: 6.730 },
  { width: 60, height: 30, thickness: 1.5, pricePerMeter: 170, weightPerMeter: 2.020 },
  { width: 60, height: 30, thickness: 2, pricePerMeter: 200, weightPerMeter: 2.650 },
  { width: 60, height: 30, thickness: 3, pricePerMeter: 280, weightPerMeter: 3.830 },
  { width: 60, height: 40, thickness: 1.5, pricePerMeter: 180, weightPerMeter: 2.250 },
  { width: 60, height: 40, thickness: 2, pricePerMeter: 230, weightPerMeter: 2.960 },
  { width: 60, height: 40, thickness: 3, pricePerMeter: 310, weightPerMeter: 4.300 },
  { width: 60, height: 40, thickness: 4, pricePerMeter: 410, weightPerMeter: 5.560 },
  { width: 60, height: 60, thickness: 2, pricePerMeter: 280, weightPerMeter: 3.590 },
  { width: 60, height: 60, thickness: 3, pricePerMeter: 380, weightPerMeter: 5.250 },
  { width: 60, height: 60, thickness: 4, pricePerMeter: 500, weightPerMeter: 6.820 },
  { width: 60, height: 60, thickness: 5, pricePerMeter: 680, weightPerMeter: 8.300 },
];

// Труба профильная НЛГ 70-160 (крупные размеры)
export const largeProfilePipes: PipePrice[] = [
  { width: 80, height: 40, thickness: 4, pricePerMeter: 600, weightPerMeter: 6.820 },
  { width: 80, height: 80, thickness: 4, pricePerMeter: 760, weightPerMeter: 9.220 },
  { width: 80, height: 80, thickness: 4, pricePerMeter: 770, weightPerMeter: 9.220, steel: 'С355' },
  { width: 80, height: 80, thickness: 5, pricePerMeter: 930, weightPerMeter: 11.270 },
  { width: 80, height: 80, thickness: 6, pricePerMeter: 1140, weightPerMeter: 13.210 },
  { width: 80, height: 80, thickness: 6, pricePerMeter: 1160, weightPerMeter: 13.210, steel: 'С355' },
  { width: 100, height: 100, thickness: 4, pricePerMeter: 970, weightPerMeter: 11.730 },
  { width: 100, height: 100, thickness: 5, pricePerMeter: 1190, weightPerMeter: 14.410 },
  { width: 100, height: 100, thickness: 8, pricePerMeter: 2050, weightPerMeter: 21.390 },
  { width: 120, height: 80, thickness: 4, pricePerMeter: 1010, weightPerMeter: 11.730 },
  { width: 120, height: 80, thickness: 5, pricePerMeter: 1260, weightPerMeter: 14.410 },
  { width: 120, height: 80, thickness: 5, pricePerMeter: 1280, weightPerMeter: 14.410, steel: 'С355' },
  { width: 120, height: 80, thickness: 6, pricePerMeter: 1610, weightPerMeter: 16.980, steel: 'С355' },
  { width: 120, height: 120, thickness: 4, pricePerMeter: 1180, weightPerMeter: 14.250 },
  { width: 120, height: 120, thickness: 5, pricePerMeter: 1450, weightPerMeter: 17.550 },
  { width: 120, height: 120, thickness: 5, pricePerMeter: 1470, weightPerMeter: 17.550, steel: 'С355' },
  { width: 120, height: 120, thickness: 6, pricePerMeter: 1770, weightPerMeter: 20.750 },
  { width: 120, height: 120, thickness: 6, pricePerMeter: 1790, weightPerMeter: 20.750, steel: 'С355' },
  { width: 140, height: 100, thickness: 4, pricePerMeter: 1270, weightPerMeter: 14.250, steel: 'С355' },
  { width: 140, height: 100, thickness: 5, pricePerMeter: 1530, weightPerMeter: 17.550, steel: 'С355' },
  { width: 140, height: 140, thickness: 4, pricePerMeter: 1450, weightPerMeter: 16.760 },
  { width: 140, height: 140, thickness: 5, pricePerMeter: 1730, weightPerMeter: 20.690 },
  { width: 140, height: 140, thickness: 5, pricePerMeter: 1760, weightPerMeter: 20.690, steel: 'С355' },
  { width: 140, height: 140, thickness: 6, pricePerMeter: 2050, weightPerMeter: 24.520 },
  { width: 140, height: 140, thickness: 8, pricePerMeter: 2980, weightPerMeter: 31.430 },
  { width: 160, height: 120, thickness: 5, pricePerMeter: 1830, weightPerMeter: 20.690 },
  { width: 160, height: 120, thickness: 5, pricePerMeter: 1860, weightPerMeter: 20.690, steel: 'С355' },
  { width: 160, height: 160, thickness: 6, pricePerMeter: 2370, weightPerMeter: 28.290 },
  { width: 160, height: 160, thickness: 6, pricePerMeter: 2410, weightPerMeter: 28.290, steel: 'С355' },
  { width: 160, height: 160, thickness: 7, pricePerMeter: 3060, weightPerMeter: 32.310 },
  { width: 160, height: 160, thickness: 8, pricePerMeter: 3410, weightPerMeter: 36.460 },
];

// Функция для получения цены по размерам трубы
export const getPipePrice = (
  width: number,
  height: number,
  thickness: number,
  steel?: string
): number | null => {
  // Сначала ищем в крупных размерах
  let found = largeProfilePipes.find(
    (p) =>
      p.width === width &&
      p.height === height &&
      p.thickness === thickness &&
      (steel ? p.steel === steel : !p.steel)
  );
  
  if (!found) {
    // Затем в малых размерах
    found = smallProfilePipes.find(
      (p) =>
        p.width === width &&
        p.height === height &&
        p.thickness === thickness
    );
  }
  
  return found?.pricePerMeter || null;
};

// Базовые цены для калькуляторов (руб/м.п. для типовых сечений)
export const defaultFramePrices = {
  '40x20': 130,      // 40x20x2
  '60x60': 380,      // 60x60x3
  '80x80': 760,      // 80x80x4
  '100x100': 970,    // 100x100x4
  '120x120': 1180,   // 120x120x4
  '140x140': 1450,   // 140x140x4
  '160x160': 2370,   // 160x160x6
};

// Цены на кровельные материалы (руб/м²)
export const roofingPrices = {
  polycarbonate: 600,
  metal: 800,
  shingles: 800,
};

// Цены на фундамент (руб/м.п. или руб/шт)
export const foundationPrices = {
  concrete: { material: 3500, work: 1500 },
  wood: { material: 2500, work: 1200 },
  piles: { material: 3000, work: 1300 },
};

// Цены на работы (руб/м.п. или руб/м²)
export const workPrices = {
  frameAssembly: 300,    // сборка каркаса, руб/м.п.
  roofInstallation: 400, // монтаж кровли, руб/м²
  painting: 200,         // покраска, руб/м²
  foundation: 1000,      // фундамент за стойку, руб
};