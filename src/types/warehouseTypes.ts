export interface WarehouseParams {
  // Основные габариты
  length: number;          // м
  width: number;           // м
  wallHeight: number;      // высота стен (м)
  roofHeight: number;      // высота кровли (м) – для двускатной
  roofType: 'gable' | 'single' | 'flat';
  wallPanelThickness: number; // мм (50, 100, 150, 200)
  roofPanelThickness: number; // мм

  // Каркас
  frameMaterial: 'metal' | 'wood' | 'combined';
  columnSpacing: number;   // шаг колонн (м)
  columnSize: '200x200' | '250x250' | '300x300';
  trussType: 'simple' | 'reinforced' | 'lattice' | 'pratt' | 'howe' | 'warren' | 'fink';
  trussSection: string;
  trussCount: number;
  purlinSpacing: number;   // шаг прогонов (м)
  bracingType: 'none' | 'cross' | 'portal' | 'horizontal' | 'vertical' | 'spacer' | 'fachwerk' | 'combined';
  
  // Параметры для фахверка
  fachwerkSpacing?: number; // шаг стоек фахверка
  hasFachwerkRigels?: boolean; // наличие горизонтальных ригелей
  
  // Параметры для распорок
  spacerCount?: number; // количество распорок
  
  // Параметры для горизонтальных связей
  horizontalBracingLevel?: number; // уровень горизонтальных связей (0-1 от высоты)

  // Ворота
  gateType: 'none' | 'sectional' | 'swing' | 'sliding' | 'roller';
  gateWidth: number;
  gateHeight: number;
  gateCount: number;
  gatePosition: 'front' | 'back' | 'both' | 'side';
  gateSide?: 'left' | 'right' | 'both_sides'; // новое поле для боковых ворот

  // Стены и кровля
  wallMaterial: 'none' | 'profile' | 'sandwich';
  wallColor: string;
  roofMaterial: 'profile' | 'sandwich';
  roofColor: string;
  insulation: boolean;

  // Окна, двери (опционально)
  windowCount: number;
  doorCount: number;

  // Цвет каркаса
  frameColor: string;

  asphaltWidth?: number; // ширина асфальта вокруг здания
  floorType?: 'concrete' | 'paving' | 'self-leveling'; // тип пола внутри

  // Фундамент (можно добавить позже)
  foundationType: 'none' | 'strip' | 'pile';
  foundationColor?: string;
  gateOffset?: number;
  isNight?: boolean;
}

export const initialWarehouseParams: WarehouseParams = {
  // Основные габариты
  length: 12,
  width: 6,
  wallHeight: 4,
  roofHeight: 1.5,
  roofType: 'gable',
  wallPanelThickness: 100,
  roofPanelThickness: 100,

  // Каркас
  frameMaterial: 'metal',
  columnSpacing: 3,
  columnSize: '200x200',
  trussType: 'simple',
  trussSection: '80x80', // ТОЛЬКО ОДИН РАЗ!
  trussCount: 3,
  purlinSpacing: 1,
  bracingType: 'none',
  fachwerkSpacing: 2.0,
  hasFachwerkRigels: true,
  spacerCount: 2,
  horizontalBracingLevel: 0.8,

  // Ворота
  gateType: 'sectional',
  gateWidth: 3,
  gateHeight: 3,
  gateCount: 1,
  gatePosition: 'front',
  gateSide: 'left',

  // Стены и кровля
  wallMaterial: 'profile',
  wallColor: '#a0a0a0',
  roofMaterial: 'profile',
  roofColor: '#505050',
  insulation: false,

  // Окна и двери
  windowCount: 0,
  doorCount: 0,

  // Цвет каркаса
  frameColor: '#4682B4',

  // Фундамент
  foundationType: 'none',


  asphaltWidth: 10,
  floorType: 'concrete',
  
  gateOffset: 0,
};