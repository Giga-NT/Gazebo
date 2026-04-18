import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import {
  getPrices,
  savePrices,
  defaultGazeboPrices,
  defaultCanopyPrices,
  defaultGreenhousePrices,
} from '../services/priceService';

// ==================== СТИЛИ ====================

const Container = styled.div`
  padding: 30px 20px;
  max-width: 1400px;
  margin: 0 auto;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 15px;
`;

const Title = styled.h1`
  color: #2c3e50;
  border-bottom: 2px solid #3498db;
  padding-bottom: 10px;
  margin: 0;
`;

const BackButton = styled.button`
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.2s;
  &:hover {
    background: #5a6268;
  }
`;

const TypeSelector = styled.select`
  width: 100%;
  padding: 12px 15px;
  margin-bottom: 30px;
  border: 1px solid #bdc3c7;
  border-radius: 6px;
  font-size: 16px;
  background: white;
  cursor: pointer;
  &:hover {
    border-color: #3498db;
  }
`;

const TabsContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 25px;
  border-bottom: 1px solid #e2e8f0;
  flex-wrap: wrap;
`;

const Tab = styled.button<{ $active: boolean }>`
  padding: 12px 24px;
  background: ${props => props.$active ? '#3498db' : '#f1f5f9'};
  color: ${props => props.$active ? 'white' : '#475569'};
  border: none;
  border-radius: 8px 8px 0 0;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  &:hover {
    background: ${props => props.$active ? '#2980b9' : '#e2e8f0'};
  }
`;

const MergeButton = styled.button<{ $merged: boolean }>`
  padding: 10px 20px;
  background: ${props => props.$merged ? '#e74c3c' : '#2ecc71'};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
  &:hover {
    opacity: 0.9;
  }
`;

const MarketAlert = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 15px 20px;
  border-radius: 12px;
  margin-bottom: 25px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
  
  p {
    margin: 0;
    font-size: 14px;
  }
  
  strong {
    font-size: 18px;
  }
`;

const ResetButton = styled.button`
  background: rgba(255,255,255,0.2);
  color: white;
  border: 1px solid rgba(255,255,255,0.3);
  border-radius: 8px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;
  &:hover {
    background: rgba(255,255,255,0.3);
  }
`;

const Section = styled.div`
  background: #f9f9f9;
  border-radius: 8px;
  padding: 15px 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 15px;
  flex-wrap: wrap;
  gap: 10px;
`;

const SectionTitle = styled.h3`
  margin: 0;
  font-size: 1.2rem;
  color: #2c3e50;
  word-break: break-word;
`;

const InputGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 10px;
  background: white;
  padding: 10px 15px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  flex-wrap: wrap;
  
  &:hover {
    border-color: #3498db;
  }
`;

const Label = styled.label`
  font-weight: 600;
  color: #2c3e50;
  min-width: 180px;
  font-size: 14px;
`;

const Input = styled.input`
  flex: 1;
  min-width: 120px;
  padding: 10px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 14px;
  &:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
  }
`;

const SubInput = styled.input`
  width: 120px;
  padding: 8px 10px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 14px;
  text-align: center;
  &:focus {
    outline: none;
    border-color: #3498db;
  }
`;

const SaveButton = styled.button`
  background: #2ecc71;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 15px 30px;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  width: 100%;
  margin-top: 30px;
  transition: background 0.2s;
  &:hover {
    background: #27ae60;
  }
`;

const TwoColumnGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 10px;
`;

const PriceHint = styled.span`
  font-size: 11px;
  color: #27ae60;
  margin-left: 10px;
`;

// ==================== ТИПЫ ====================

interface PipePrice {
  size: string;
  pricePerMeter: number;
  marketPrice?: number;
}

// Рыночные цены на трубы (на основе анализа конкурентов)
const marketPipePrices: Record<string, number> = {
  '40x20x1.5': 120,
  '40x20x2': 150,
  '40x40x2': 180,
  '60x40x2': 220,
  '60x60x2': 250,
  '60x60x3': 350,
  '80x80x2.5': 380,
  '80x80x3': 450,
  '100x100x3': 600,
  '100x100x4': 750,
};

// Рекомендуемые цены для навеса 6x6м (рыночный анализ)
const recommendedCanopyPrices = {
  frame: { material: 180, work: 200 },      // руб/м.п.
  pillar: { material: 1200, work: 800 },    // руб/шт
  painting: { material: 100, work: 150 },   // руб/м²
  foundation: { pillars: { material: 1200, work: 800 } },
  screws: { material: 8, work: 0.5 },
  roofMaterial: {
    polycarbonate: { material: 600, work: 350 },
    metal: { material: 700, work: 350 },
    tile: { material: 1200, work: 600 },
  },
};

const defaultPipeSizes: PipePrice[] = [
  // Малые трубы (10-60)
  { size: "20x20x1.5", pricePerMeter: 70, marketPrice: 70 },
  { size: "20x20x2", pricePerMeter: 80, marketPrice: 80 },
  { size: "25x25x1.5", pricePerMeter: 90, marketPrice: 90 },
  { size: "25x25x2", pricePerMeter: 110, marketPrice: 110 },
  { size: "30x30x1.5", pricePerMeter: 110, marketPrice: 110 },
  { size: "30x30x2", pricePerMeter: 130, marketPrice: 130 },
  { size: "40x20x1.5", pricePerMeter: 110, marketPrice: 110 },
  { size: "40x20x2", pricePerMeter: 130, marketPrice: 130 },
  { size: "40x40x1.5", pricePerMeter: 150, marketPrice: 150 },
  { size: "40x40x2", pricePerMeter: 180, marketPrice: 180 },
  { size: "40x40x3", pricePerMeter: 250, marketPrice: 250 },
  { size: "50x50x2", pricePerMeter: 230, marketPrice: 230 },
  { size: "50x50x3", pricePerMeter: 320, marketPrice: 320 },
  { size: "60x40x2", pricePerMeter: 230, marketPrice: 230 },
  { size: "60x40x3", pricePerMeter: 310, marketPrice: 310 },
  { size: "60x60x2", pricePerMeter: 280, marketPrice: 280 },
  { size: "60x60x3", pricePerMeter: 380, marketPrice: 380 },
  { size: "60x60x4", pricePerMeter: 500, marketPrice: 500 },
  
  // Крупные трубы (70-160)
  { size: "80x40x2", pricePerMeter: 280, marketPrice: 280 },
  { size: "80x40x3", pricePerMeter: 390, marketPrice: 390 },
  { size: "80x80x2", pricePerMeter: 380, marketPrice: 380 },
  { size: "80x80x3", pricePerMeter: 510, marketPrice: 510 },
  { size: "80x80x4", pricePerMeter: 670, marketPrice: 670 },
  { size: "100x50x3", pricePerMeter: 490, marketPrice: 490 },
  { size: "100x100x3", pricePerMeter: 650, marketPrice: 650 },
  { size: "100x100x4", pricePerMeter: 850, marketPrice: 850 },
  { size: "120x120x4", pricePerMeter: 1030, marketPrice: 1030 },
  { size: "120x120x5", pricePerMeter: 1270, marketPrice: 1270 },
  { size: "140x140x4", pricePerMeter: 1240, marketPrice: 1240 },
  { size: "140x140x5", pricePerMeter: 1530, marketPrice: 1530 },
  { size: "160x160x4", pricePerMeter: 1420, marketPrice: 1420 },
  { size: "160x160x5", pricePerMeter: 1760, marketPrice: 1760 },
  { size: "160x160x6", pricePerMeter: 2080, marketPrice: 2080 },
];

// ==================== КОМПОНЕНТ ====================

const PriceEditor: React.FC = () => {
  const [prices, setPrices] = useState<any>(null);
  const [type, setType] = useState<'canopy' | 'greenhouse' | 'gazebo'>('canopy');
  const [activeTab, setActiveTab] = useState<'materials' | 'works'>('materials');
  const [isMerged, setIsMerged] = useState(false);
  const [pipePrices, setPipePrices] = useState<PipePrice[]>(defaultPipeSizes);
  const navigate = useNavigate();

  useEffect(() => {
    loadPrices();
  }, [type]);

  const loadPrices = async () => {
    let defaultPrices;
    if (type === 'gazebo') defaultPrices = defaultGazeboPrices;
    else if (type === 'canopy') defaultPrices = defaultCanopyPrices;
    else defaultPrices = defaultGreenhousePrices;
    const data = await getPrices(type, defaultPrices);
    setPrices(data);
    
    const savedPipePrices = localStorage.getItem('pipe_prices');
    if (savedPipePrices) {
      setPipePrices(JSON.parse(savedPipePrices));
    }
  };

  const applyRecommendedPrices = () => {
    if (type === 'canopy') {
      const newPrices = { ...prices };
      newPrices.frame = recommendedCanopyPrices.frame;
      newPrices.pillar = recommendedCanopyPrices.pillar;
      newPrices.painting = recommendedCanopyPrices.painting;
      newPrices.foundation = recommendedCanopyPrices.foundation;
      newPrices.screws = recommendedCanopyPrices.screws;
      newPrices.roofMaterial = recommendedCanopyPrices.roofMaterial;
      setPrices(newPrices);
      alert('✅ Применены рыночные цены для навеса 6x6м');
    } else {
      alert('Рекомендованные цены доступны только для типа "Навес"');
    }
  };

  const applyMarketPipePrices = () => {
    const newPipePrices = pipePrices.map(pipe => ({
      ...pipe,
      pricePerMeter: marketPipePrices[pipe.size] || pipe.pricePerMeter
    }));
    setPipePrices(newPipePrices);
    alert('✅ Применены рыночные цены на профильные трубы');
  };

  const handlePipePriceChange = (index: number, value: number) => {
    const newPipePrices = [...pipePrices];
    newPipePrices[index].pricePerMeter = value;
    setPipePrices(newPipePrices);
  };

  const savePipePrices = () => {
    localStorage.setItem('pipe_prices', JSON.stringify(pipePrices));
  };

  const handleUpdate = (path: string, value: any) => {
    const newPrices = { ...prices };
    const keys = path.split('.');
    let current = newPrices;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) current[keys[i]] = {};
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    setPrices(newPrices);
  };

  const handleSave = async () => {
    await savePrices(type, prices);
    savePipePrices();
    alert('✅ Все цены сохранены!');
  };

  const resetToDefault = async () => {
    let defaultPrices;
    if (type === 'gazebo') defaultPrices = defaultGazeboPrices;
    else if (type === 'canopy') defaultPrices = defaultCanopyPrices;
    else defaultPrices = defaultGreenhousePrices;
    setPrices(defaultPrices);
    setPipePrices(defaultPipeSizes);
    alert('🔄 Цены сброшены до заводских настроек');
  };

  if (!prices) return <Container>Загрузка...</Container>;

  const renderPriceSection = (data: any, parentPath: string = '', level: number = 0): React.ReactNode => {
    if (!data || typeof data !== 'object') return null;

    const isMaterialWorkNode = data.material !== undefined && data.work !== undefined;
    
    if (isMaterialWorkNode) {
      if (activeTab === 'materials' && !isMerged) {
        return (
          <InputGroup key={parentPath}>
            <Label>{getLabelFromPath(parentPath)}</Label>
            <Input
              type="number"
              value={data.material}
              onChange={(e) => handleUpdate(`${parentPath}.material`, parseFloat(e.target.value))}
              step="10"
            />
            <UnitHint>₽</UnitHint>
          </InputGroup>
        );
      }
      if (activeTab === 'works' && !isMerged) {
        return (
          <InputGroup key={parentPath}>
            <Label>{getLabelFromPath(parentPath)}</Label>
            <Input
              type="number"
              value={data.work}
              onChange={(e) => handleUpdate(`${parentPath}.work`, parseFloat(e.target.value))}
              step="10"
            />
            <UnitHint>₽</UnitHint>
          </InputGroup>
        );
      }
      if (isMerged) {
        return (
          <InputGroup key={parentPath}>
            <Label>{getLabelFromPath(parentPath)}</Label>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '12px', color: '#666' }}>Материал:</span>
                <Input
                  type="number"
                  value={data.material}
                  onChange={(e) => handleUpdate(`${parentPath}.material`, parseFloat(e.target.value))}
                  step="10"
                  style={{ width: '120px' }}
                />
              </div>
              <div>
                <span style={{ fontSize: '12px', color: '#666' }}>Работа:</span>
                <Input
                  type="number"
                  value={data.work}
                  onChange={(e) => handleUpdate(`${parentPath}.work`, parseFloat(e.target.value))}
                  step="10"
                  style={{ width: '120px' }}
                />
              </div>
            </div>
          </InputGroup>
        );
      }
      return null;
    }

    const keys = Object.keys(data);
    if (keys.length === 0) return null;

    return (
      <Section key={parentPath} style={{ marginLeft: level * 20 }}>
        <SectionHeader>
          <SectionTitle>{getLabelFromPath(parentPath)}</SectionTitle>
        </SectionHeader>
        {keys.map((key) => {
          const childData = data[key];
          const childPath = parentPath ? `${parentPath}.${key}` : key;
          return renderPriceSection(childData, childPath, level + 1);
        })}
      </Section>
    );
  };

  const getLabelFromPath = (path: string): string => {
    const parts = path.split('.');
    const lastKey = parts[parts.length - 1];
    const labels: Record<string, string> = {
      wood: 'Дерево',
      metal: 'Металл',
      combined: 'Комбинированный',
      tile: 'Плитка',
      concrete: 'Бетон',
      none: 'Без покрытия',
      foundation: 'Фундамент',
      furniture: 'Мебель',
      roofing: 'Кровля',
      bench: 'Скамейка',
      table: 'Стол',
      small: 'Маленький',
      medium: 'Средний',
      large: 'Большой',
      shingles: 'Гибкая черепица',
      polycarbonate: 'Поликарбонат',
      glass: 'Стекло',
      film: 'Пленка',
      work: 'Работа',
      material: 'Материал',
      roofMaterial: 'Материал кровли',
      frame: 'Каркас (за м.п.)',
      pillar: 'Стойка (за шт)',
      truss: 'Ферма',
      lathing: 'Обрешетка',
      painting: 'Покраска (за м²)',
      screws: 'Крепеж (за шт)',
      cover: 'Покрытие',
      additional: 'Дополнительно',
      ventilation: 'Вентиляция',
      doors: 'Двери',
      partition: 'Перегородка',
      shelving: 'Стеллажи',
      pvc: 'ПВХ',
      pillars: 'Отдельные тумбы',
      slab: 'Монолитная плита',
      surface: 'Поверхностный',
    };
    return labels[lastKey] || lastKey;
  };

  const UnitHint = styled.span`
    font-size: 12px;
    color: #64748b;
    margin-left: 5px;
  `;

  // Расчёт примерной стоимости навеса 6x6м
  const calculateEstimatedPrice = () => {
    if (type !== 'canopy') return null;
    
    const framePerMeter = prices.frame?.material || 180;
    const pillarPerUnit = prices.pillar?.material || 1200;
    const roofPerM2 = prices.roofMaterial?.polycarbonate?.material || 600;
    
    // Примерный расчёт для навеса 6x6м
    const frameLength = 120; // м.п.
    const pillarCount = 8;
    const roofArea = 36;
    
    const frameCost = frameLength * framePerMeter;
    const pillarCost = pillarCount * pillarPerUnit;
    const roofCost = roofArea * roofPerM2;
    
    return frameCost + pillarCost + roofCost;
  };

  const estimatedPrice = calculateEstimatedPrice();

  return (
    <Container>
      <Header>
        <Title>✏️ Редактор цен</Title>
        <BackButton onClick={() => navigate('/dashboard')}>← В личный кабинет</BackButton>
      </Header>

      <TypeSelector value={type} onChange={(e) => setType(e.target.value as any)}>
        <option value="canopy">🏠 Навес</option>
        <option value="gazebo">🏡 Беседка</option>
        <option value="greenhouse">🌿 Теплица</option>
      </TypeSelector>

      {type === 'canopy' && (
        <MarketAlert>
          <div>
            <strong>📊 Рыночный анализ</strong>
            <p>Средняя цена навеса 6x6м в РФ: 140 000 - 180 000 ₽</p>
            <p>💰 Примерная стоимость по вашим ценам: ~{estimatedPrice?.toLocaleString('ru-RU')} ₽ (только материалы)</p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <ResetButton onClick={applyRecommendedPrices}>🎯 Применить рыночные цены</ResetButton>
            <ResetButton onClick={resetToDefault}>🔄 Сбросить</ResetButton>
          </div>
        </MarketAlert>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
        <TabsContainer>
          <Tab $active={activeTab === 'materials' && !isMerged} onClick={() => { setActiveTab('materials'); setIsMerged(false); }}>
            🧱 Материалы
          </Tab>
          <Tab $active={activeTab === 'works' && !isMerged} onClick={() => { setActiveTab('works'); setIsMerged(false); }}>
            🔧 Работы
          </Tab>
        </TabsContainer>
        
        <MergeButton $merged={isMerged} onClick={() => setIsMerged(!isMerged)}>
          {isMerged ? '🔀 Разъединить' : '🔗 Объединить'}
        </MergeButton>
      </div>

      {/* Секция профильных труб */}
      <Section>
        <SectionHeader>
          <SectionTitle>📏 Профильные трубы (цена за метр погонный)</SectionTitle>
          <ResetButton onClick={applyMarketPipePrices}>🎯 Применить рыночные цены</ResetButton>
        </SectionHeader>
        <TwoColumnGrid>
          {pipePrices.map((pipe, idx) => (
            <InputGroup key={pipe.size}>
              <Label style={{ minWidth: '100px' }}>{pipe.size}</Label>
              <SubInput
                type="number"
                value={pipe.pricePerMeter}
                onChange={(e) => handlePipePriceChange(idx, parseFloat(e.target.value))}
                step="10"
              />
              <UnitHint>₽/м.п.</UnitHint>
              {pipe.marketPrice && pipe.pricePerMeter > pipe.marketPrice * 1.2 && (
                <PriceHint>⚠️ Выше рынка</PriceHint>
              )}
            </InputGroup>
          ))}
        </TwoColumnGrid>
      </Section>

      {/* Основные цены */}
      {renderPriceSection(prices, '')}

      <SaveButton onClick={handleSave}>
        💾 Сохранить все цены
      </SaveButton>
    </Container>
  );
};

export default PriceEditor;