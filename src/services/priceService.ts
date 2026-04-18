// src/services/priceService.ts

// Типы для каждого изделия
export interface MaterialWork {
  material: number;
  work: number;
}

// Цены для беседки
export interface GazeboPrices {
  wood: MaterialWork;
  metal: MaterialWork;
  combined: MaterialWork;
  tile: MaterialWork;
  concrete: MaterialWork;
  none: MaterialWork;
  foundation: {
    wood: MaterialWork;
    concrete: MaterialWork;
    piles: MaterialWork;
    none: MaterialWork;
  };
  furniture: {
    bench: number;
    table: { small: number; medium: number; large: number };
  };
  roofing: {
    shingles: number;
    metal: number;
    polycarbonate: number;
  };
  pipes: {
    [key: string]: number;
  };
}

// Цены для навеса
export interface CanopyPrices {
  roofMaterial: {
    polycarbonate: MaterialWork;
    metal: MaterialWork;
    tile: MaterialWork;
  };
  frame: MaterialWork;
  pillar: MaterialWork;
  truss: MaterialWork;
  lathing: MaterialWork;
  painting: MaterialWork;
  foundation: {
    pillars: MaterialWork;
    slab: MaterialWork;
    surface: MaterialWork;
  };
  screws: MaterialWork;
  pipes: {
    '20x20x1.5': number;
    '20x20x2': number;
    '25x25x1.5': number;
    '25x25x2': number;
    '30x30x1.5': number;
    '30x30x2': number;
    '40x20x1.5': number;
    '40x20x2': number;
    '40x40x1.5': number;
    '40x40x2': number;
    '40x40x3': number;
    '50x50x2': number;
    '50x50x3': number;
    '60x40x2': number;
    '60x40x3': number;
    '60x60x2': number;
    '60x60x3': number;
    '60x60x4': number;
    '80x40x2': number;
    '80x40x3': number;
    '80x80x2': number;
    '80x80x3': number;
    '80x80x4': number;
    '100x50x3': number;
    '100x100x3': number;
    '100x100x4': number;
    '120x120x4': number;
    '120x120x5': number;
    '140x140x4': number;
    '140x140x5': number;
    '160x160x4': number;
    '160x160x5': number;
    '160x160x6': number;
  };
}

// Цены для теплицы
export interface GreenhousePrices {
  cover: {
    polycarbonate: MaterialWork;
    glass: MaterialWork;
    film: MaterialWork;
  };
  frame: {
    metal: {
      '40x20': number;
      '60x60': number;
      '80x80': number;
      '100x100': number;
    };
    pvc: number;
    wood: number;
  };
  foundation: {
    wood: MaterialWork;
    concrete: MaterialWork;
    piles: MaterialWork;
    none: MaterialWork;
  };
  additional: {
    ventilation: MaterialWork;
    doors: MaterialWork;
    partition: MaterialWork;
    shelving: MaterialWork;
  };
  screws: MaterialWork;
  painting: MaterialWork;
  pipes?: {
    [key: string]: number;
  };
}

// Дефолтные цены для навеса
export const defaultCanopyPrices: CanopyPrices = {
  roofMaterial: {
    polycarbonate: { material: 600, work: 400 },
    metal: { material: 800, work: 400 },
    tile: { material: 1500, work: 700 },
  },
  frame: { material: 180, work: 200 },
  pillar: { material: 1200, work: 800 },
  truss: { material: 200, work: 150 },
  lathing: { material: 100, work: 80 },
  painting: { material: 100, work: 150 },
  foundation: {
    pillars: { material: 1200, work: 800 },
    slab: { material: 2500, work: 1200 },
    surface: { material: 800, work: 400 },
  },
  screws: { material: 8, work: 0.5 },
  pipes: {
    '20x20x1.5': 70,
    '20x20x2': 80,
    '25x25x1.5': 90,
    '25x25x2': 110,
    '30x30x1.5': 110,
    '30x30x2': 130,
    '40x20x1.5': 110,
    '40x20x2': 130,
    '40x40x1.5': 150,
    '40x40x2': 180,
    '40x40x3': 250,
    '50x50x2': 230,
    '50x50x3': 320,
    '60x40x2': 230,
    '60x40x3': 310,
    '60x60x2': 280,
    '60x60x3': 380,
    '60x60x4': 500,
    '80x40x2': 280,
    '80x40x3': 390,
    '80x80x2': 380,
    '80x80x3': 510,
    '80x80x4': 670,
    '100x50x3': 490,
    '100x100x3': 650,
    '100x100x4': 850,
    '120x120x4': 1030,
    '120x120x5': 1270,
    '140x140x4': 1240,
    '140x140x5': 1530,
    '160x160x4': 1420,
    '160x160x5': 1760,
    '160x160x6': 2080,
  },
};

// Дефолтные цены для теплицы
export const defaultGreenhousePrices: GreenhousePrices = {
  cover: {
    polycarbonate: { material: 600, work: 400 },
    glass: { material: 1500, work: 700 },
    film: { material: 200, work: 100 },
  },
  frame: {
    metal: {
      '40x20': 500,
      '60x60': 700,
      '80x80': 900,
      '100x100': 1200,
    },
    pvc: 800,
    wood: 600,
  },
  foundation: {
    wood: { material: 1000, work: 500 },
    concrete: { material: 2500, work: 1500 },
    piles: { material: 3000, work: 2000 },
    none: { material: 0, work: 0 },
  },
  additional: {
    ventilation: { material: 2000, work: 1000 },
    doors: { material: 5000, work: 2000 },
    partition: { material: 3000, work: 1500 },
    shelving: { material: 4000, work: 2000 },
  },
  screws: { material: 10, work: 0.5 },
  painting: { material: 150, work: 100 },
  pipes: {
    '40x20x2': 130,
    '40x20x1.5': 110,
    '60x60x3': 380,
    '80x80x3': 510,
  },
};

// Дефолтные цены для беседки
export const defaultGazeboPrices: GazeboPrices = {
  wood: { material: 1500, work: 800 },
  metal: { material: 1200, work: 600 },
  combined: { material: 1800, work: 1000 },
  tile: { material: 2000, work: 1000 },
  concrete: { material: 1800, work: 700 },
  none: { material: 0, work: 0 },
  foundation: {
    wood: { material: 2500, work: 1200 },
    concrete: { material: 3500, work: 1500 },
    piles: { material: 3000, work: 1300 },
    none: { material: 0, work: 0 },
  },
  furniture: {
    bench: 3000,
    table: { small: 5000, medium: 7000, large: 9000 },
  },
  roofing: {
    shingles: 800,
    metal: 600,
    polycarbonate: 400,
  },
  pipes: {
    '80x80x3': 510,
    '80x80x2': 380,
    '60x60x3': 380,
    '40x20x2': 130,
  },
};

// Универсальная функция получения цен из localStorage
export const getPrices = async <T>(type: string, defaultPrices: T): Promise<T> => {
  const saved = localStorage.getItem(`prices_${type}`);
  if (saved) {
    try {
      return JSON.parse(saved) as T;
    } catch {
      return defaultPrices;
    }
  }
  return defaultPrices;
};

export const savePrices = async (type: string, data: any) => {
  localStorage.setItem(`prices_${type}`, JSON.stringify(data));
};

// Удобные обёртки для конкретных типов
export const getCanopyPrices = () => getPrices('canopy', defaultCanopyPrices);
export const getGreenhousePrices = () => getPrices('greenhouse', defaultGreenhousePrices);
export const getGazeboPrices = () => getPrices('gazebo', defaultGazeboPrices);