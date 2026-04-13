import React, { useState } from 'react';
import { WarehouseParams } from '../../types/warehouseTypes';
import { HexColorPicker } from 'react-colorful';
import styled from 'styled-components';

// Стилизованные компоненты
const Container = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  padding: 24px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
`;

const ControlsCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  max-width: 500px;
  margin: 0 auto;
`;

const Title = styled.h2`
  font-size: 28px;
  font-weight: 700;
  text-align: center;
  color: white;
  margin: 0 0 24px 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  letter-spacing: -0.5px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  padding: 20px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
`;

const Button = styled.button<{ active?: boolean }>`
  flex: 1;
  padding: 14px 20px;
  border: none;
  border-radius: 16px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${props => props.active ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'white'};
  color: ${props => props.active ? 'white' : '#4a5568'};
  box-shadow: ${props => props.active ? '0 8px 16px rgba(102, 126, 234, 0.3)' : '0 2px 8px rgba(0,0,0,0.05)'};
  border: 1px solid ${props => props.active ? 'transparent' : '#e2e8f0'};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 24px rgba(102, 126, 234, 0.25);
  }
`;

// Аккордеон секции
const Section = styled.div`
  border-bottom: 1px solid #e2e8f0;
`;

const SectionHeader = styled.div<{ isOpen: boolean }>`
  padding: 18px 24px;
  background: ${props => props.isOpen ? '#f8fafc' : 'white'};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: background 0.3s ease;
  
  &:hover {
    background: #f1f5f9;
  }
`;

const SectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #1a2639;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const SectionIcon = styled.span<{ isOpen: boolean }>`
  font-size: 20px;
  transform: rotate(${props => props.isOpen ? '180deg' : '0deg'});
  transition: transform 0.3s ease;
`;

const SectionContent = styled.div<{ isOpen: boolean }>`
  max-height: ${props => props.isOpen ? '2000px' : '0'};
  overflow: hidden;
  transition: max-height 0.5s ease;
  background: white;
`;

const ContentInner = styled.div`
  padding: 20px 24px 24px;
`;

// Стили для полей ввода
const InputGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  color: #4a5568;
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const Input = styled.input`
  width: 100%;
  padding: 14px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 16px;
  font-size: 15px;
  transition: all 0.3s ease;
  background: #f8fafc;
  
  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
  }
  
  &:hover {
    border-color: #cbd5e1;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 14px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 16px;
  font-size: 15px;
  background: #f8fafc;
  cursor: pointer;
  transition: all 0.3s ease;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%234a5568' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  
  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
  }
`;

// Цветовой пикер
const ColorPickerWrapper = styled.div`
  position: relative;
`;

const ColorPickerButton = styled.div<{ color: string }>`
  width: 100%;
  height: 50px;
  background: ${props => props.color};
  border: 2px solid #e2e8f0;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  
  &:hover {
    transform: scale(1.02);
    border-color: #667eea;
    box-shadow: 0 8px 16px rgba(102, 126, 234, 0.2);
  }
`;

const ColorPickerPopup = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 1000;
  margin-top: 8px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  padding: 16px;
`;

// Чекбоксы
const CheckboxContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
`;

const CheckboxItem = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
`;

const HiddenCheckbox = styled.input.attrs({ type: 'checkbox' })`
  position: absolute;
  opacity: 0;
  height: 0;
  width: 0;
`;

const StyledCheckbox = styled.div<{ checked: boolean }>`
  width: 24px;
  height: 24px;
  background: ${props => props.checked ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#f8fafc'};
  border: 2px solid ${props => props.checked ? 'transparent' : '#e2e8f0'};
  border-radius: 8px;
  margin-right: 12px;
  transition: all 0.2s ease;
  position: relative;
  
  &:after {
    content: '✓';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: white;
    font-size: 14px;
    display: ${props => props.checked ? 'block' : 'none'};
  }
`;

const CheckboxLabel = styled.span`
  font-size: 15px;
  color: #4a5568;
  font-weight: 500;
`;

// Подсказки
const HelpText = styled.div`
  font-size: 13px;
  color: #718096;
  background: #f7fafc;
  padding: 12px 16px;
  border-radius: 12px;
  margin-top: 8px;
  line-height: 1.5;
  border-left: 3px solid #667eea;
`;

// Цена
const PricePreview = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  padding: 24px;
  margin-top: 24px;
  color: white;
  
  h3 {
    font-size: 20px;
    font-weight: 700;
    margin: 0 0 16px 0;
  }
  
  div {
    font-size: 15px;
    margin: 8px 0;
    display: flex;
    justify-content: space-between;
  }
  
  h4 {
    font-size: 22px;
    font-weight: 700;
    margin: 16px 0 0 0;
    padding-top: 16px;
    border-top: 2px solid rgba(255, 255, 255, 0.2);
    display: flex;
    justify-content: space-between;
  }
`;

// Интерфейс
interface WarehouseControlsProps {
  params: WarehouseParams;
  onChange: (name: keyof WarehouseParams, value: any) => void;
  costData?: any;
  gatesOpen: boolean;
  doorsOpen: boolean;
  onToggleGates: () => void;
  onToggleDoors: () => void;
}

const WarehouseControls: React.FC<WarehouseControlsProps> = ({ 
  params, 
  onChange, 
  costData,
  gatesOpen,
  doorsOpen,
  onToggleGates,
  onToggleDoors 
}) => {
  const [activeColorPicker, setActiveColorPicker] = useState<string | null>(null);
  
  // Состояния для аккордеона
  const [openSections, setOpenSections] = useState({
    dimensions: true,
    frame: false,
    gates: false,
    walls: false,
    windows: false,
    paving: false
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <Container>
      <Title>🏗️ Конструктор склада</Title>
      
      <ControlsCard>
        {/* Кнопки управления */}
        <ButtonGroup>
          <Button active={gatesOpen} onClick={onToggleGates}>
            {gatesOpen ? '🚪 Закрыть ворота' : '🚪 Открыть ворота'}
          </Button>
          <Button active={doorsOpen} onClick={onToggleDoors}>
            {doorsOpen ? '🚪 Закрыть двери' : '🚪 Открыть двери'}
          </Button>
        </ButtonGroup>

        {/* Габариты */}
        <Section>
          <SectionHeader isOpen={openSections.dimensions} onClick={() => toggleSection('dimensions')}>
            <SectionTitle>
              <span>📐</span> Габариты
            </SectionTitle>
            <SectionIcon isOpen={openSections.dimensions}>▼</SectionIcon>
          </SectionHeader>
          <SectionContent isOpen={openSections.dimensions}>
            <ContentInner>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
                  Длина (м): {params.length.toFixed(1)}
                </label>
                <input
                  type="range"
                  min="5"
                  max="50"
                  step="0.5"
                  value={params.length}
                  onChange={(e) => onChange('length', parseFloat(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
                  Ширина (м): {params.width.toFixed(1)}
                </label>
                <input
                  type="range"
                  min="3"
                  max="24"
                  step="0.5"
                  value={params.width}
                  onChange={(e) => onChange('width', parseFloat(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
                  Высота стен (м): {params.wallHeight.toFixed(1)}
                </label>
                <input
                  type="range"
                  min="3"
                  max="12"
                  step="0.5"
                  value={params.wallHeight}
                  onChange={(e) => onChange('wallHeight', parseFloat(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>

              <InputGroup>
                <Label>Толщина стеновых панелей (мм)</Label>
                <Select
                  value={params.wallPanelThickness}
                  onChange={(e) => onChange('wallPanelThickness', parseInt(e.target.value))}
                >
                  <option value="50">50 мм</option>
                  <option value="100">100 мм</option>
                  <option value="150">150 мм</option>
                  <option value="200">200 мм</option>
                </Select>
              </InputGroup>

              <InputGroup>
                <Label>Толщина кровельных панелей (мм)</Label>
                <Select
                  value={params.roofPanelThickness}
                  onChange={(e) => onChange('roofPanelThickness', parseInt(e.target.value))}
                >
                  <option value="50">50 мм</option>
                  <option value="100">100 мм</option>
                  <option value="150">150 мм</option>
                  <option value="200">200 мм</option>
                </Select>
              </InputGroup>

              <InputGroup>
                <Label>Тип кровли</Label>
                <Select value={params.roofType} onChange={(e) => onChange('roofType', e.target.value)}>
                  <option value="gable">Двухскатная</option>
                  <option value="single">Односкатная</option>
                  <option value="flat">Плоская</option>
                </Select>
              </InputGroup>
              
              {params.roofType !== 'flat' && (
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
                    Высота кровли (м): {params.roofHeight.toFixed(1)}
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="5"
                    step="0.1"
                    value={params.roofHeight}
                    onChange={(e) => onChange('roofHeight', parseFloat(e.target.value))}
                    style={{ width: '100%' }}
                  />
                </div>
              )}
            </ContentInner>
          </SectionContent>
        </Section>

        {/* Каркас */}
        <Section>
          <SectionHeader isOpen={openSections.frame} onClick={() => toggleSection('frame')}>
            <SectionTitle>
              <span>🔧</span> Каркас
            </SectionTitle>
            <SectionIcon isOpen={openSections.frame}>▼</SectionIcon>
          </SectionHeader>
          <SectionContent isOpen={openSections.frame}>
            <ContentInner>
              <InputGroup>
                <Label>Материал каркаса</Label>
                <Select
                  value={params.frameMaterial}
                  onChange={(e) => onChange('frameMaterial', e.target.value)}
                >
                  <option value="metal">Металл</option>
                  <option value="wood">Дерево</option>
                  <option value="combined">Комбинированный</option>
                </Select>
              </InputGroup>
              
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
                  Шаг колонн (м): {params.columnSpacing.toFixed(1)}
                </label>
                <input
                  type="range"
                  min="1"
                  max="6"
                  step="0.5"
                  value={params.columnSpacing}
                  onChange={(e) => onChange('columnSpacing', parseFloat(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>
              
              <InputGroup>
                <Label>Сечение колонн</Label>
                <Select
                  value={params.columnSize}
                  onChange={(e) => onChange('columnSize', e.target.value)}
                >
                  <option value="200x200">200×200 мм</option>
                  <option value="250x250">250×250 мм</option>
                  <option value="300x300">300×300 мм</option>
                </Select>
              </InputGroup>
              
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
                  Количество ферм: {params.trussCount}
                </label>
                <input
                  type="range"
                  min="2"
                  max="20"
                  step="1"
                  value={params.trussCount}
                  onChange={(e) => onChange('trussCount', parseInt(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>
              
              <InputGroup>
                <Label>Тип ферм</Label>
                <Select
                  value={params.trussType}
                  onChange={(e) => onChange('trussType', e.target.value)}
                >
                  <option value="simple">Простая</option>
                  <option value="reinforced">Усиленная</option>
                  <option value="lattice">Решётчатая</option>
                  <option value="pratt">Pratt</option>
                  <option value="howe">Howe</option>
                  <option value="warren">Warren</option>
                  <option value="fink">Fink</option>
                </Select>
              </InputGroup>
              
              <InputGroup>
                <Label>Сечение ферм (мм)</Label>
                <Select
                  value={params.trussSection}
                  onChange={(e) => onChange('trussSection', e.target.value)}
                >
                  <option value="40x40">40×40 мм</option>
                  <option value="50x50">50×50 мм</option>
                  <option value="60x60">60×60 мм</option>
                  <option value="80x80">80×80 мм</option>
                  <option value="100x100">100×100 мм</option>
                  <option value="120x120">120×120 мм</option>
                </Select>
              </InputGroup>
              
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
                  Шаг прогонов (м): {params.purlinSpacing.toFixed(1)}
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={params.purlinSpacing}
                  onChange={(e) => onChange('purlinSpacing', parseFloat(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>

              <InputGroup>
                <Label>Тип связей</Label>
                <Select
                  value={params.bracingType}
                  onChange={(e) => onChange('bracingType', e.target.value)}
                >
                  <option value="none">Нет</option>
                  <option value="cross">Крестовые</option>
                  <option value="portal">Портальные</option>
                  <option value="horizontal">Горизонтальные</option>
                  <option value="vertical">Вертикальные</option>
                  <option value="spacer">Распорки</option>
                  <option value="fachwerk">Фахверк</option>
                  <option value="combined">Комбинированные</option>
                </Select>
              </InputGroup>

              {params.bracingType === 'combined' && (
                <HelpText>
                  Комбинированные связи включают: крестовые по стенам, 
                  горизонтальные по верху, порталы в каждом третьем пролете,
                  распорки и фахверк на торцах.
                </HelpText>
              )}

              <InputGroup>
                <Label>Цвет каркаса</Label>
                <ColorPickerWrapper>
                  <ColorPickerButton
                    color={params.frameColor}
                    onClick={() => setActiveColorPicker('frame')}
                  />
                  {activeColorPicker === 'frame' && (
                    <ColorPickerPopup>
                      <HexColorPicker
                        color={params.frameColor}
                        onChange={(color) => {
                          onChange('frameColor', color);
                          setActiveColorPicker(null);
                        }}
                      />
                    </ColorPickerPopup>
                  )}
                </ColorPickerWrapper>
              </InputGroup>
            </ContentInner>
          </SectionContent>
        </Section>

        {/* Ворота */}
        <Section>
          <SectionHeader isOpen={openSections.gates} onClick={() => toggleSection('gates')}>
            <SectionTitle>
              <span>🚚</span> Ворота
            </SectionTitle>
            <SectionIcon isOpen={openSections.gates}>▼</SectionIcon>
          </SectionHeader>
          <SectionContent isOpen={openSections.gates}>
            <ContentInner>
              <InputGroup>
                <Label>Тип ворот</Label>
                <Select
                  value={params.gateType}
                  onChange={(e) => onChange('gateType', e.target.value)}
                >
                  <option value="none">Нет</option>
                  <option value="sectional">Секционные</option>
                  <option value="swing">Распашные</option>
                  <option value="sliding">Откатные</option>
                  <option value="roller">Рольставни</option>
                </Select>
              </InputGroup>
              
              {params.gateType !== 'none' && (
                <>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
                      Ширина ворот (м): {params.gateWidth.toFixed(1)}
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="6"
                      step="0.1"
                      value={params.gateWidth}
                      onChange={(e) => onChange('gateWidth', parseFloat(e.target.value))}
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
                      Высота ворот (м): {params.gateHeight.toFixed(1)}
                    </label>
                    <input
                      type="range"
                      min="2"
                      max="5"
                      step="0.1"
                      value={params.gateHeight}
                      onChange={(e) => onChange('gateHeight', parseFloat(e.target.value))}
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
                      Количество ворот: {params.gateCount}
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="4"
                      step="1"
                      value={params.gateCount}
                      onChange={(e) => onChange('gateCount', parseInt(e.target.value))}
                      style={{ width: '100%' }}
                    />
                  </div>
                  
                  <InputGroup>
                    <Label>Расположение</Label>
                    <Select
                      value={params.gatePosition}
                      onChange={(e) => onChange('gatePosition', e.target.value)}
                    >
                      <option value="front">Спереди</option>
                      <option value="back">Сзади</option>
                      <option value="both">Спереди и сзади</option>
                      <option value="side">Сбоку</option>
                    </Select>
                  </InputGroup>

                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
                      Смещение от центра (м): {(params.gateOffset || 0).toFixed(1)}
                    </label>
                    <input
                      type="range"
                      min={-params.width / 2 + params.gateWidth / 2 + 1}
                      max={params.width / 2 - params.gateWidth / 2 - 1}
                      step="0.5"
                      value={params.gateOffset || 0}
                      onChange={(e) => onChange('gateOffset', parseFloat(e.target.value) || 0)}
                      style={{ width: '100%' }}
                    />
                    <HelpText>
                      Отрицательное значение — смещение влево/назад,
                      положительное — вправо/вперёд.
                    </HelpText>
                  </div>

                  {params.gatePosition === 'side' && (
                    <InputGroup>
                      <Label>Сторона</Label>
                      <Select
                        value={params.gateSide || 'left'}
                        onChange={(e) => onChange('gateSide', e.target.value)}
                      >
                        <option value="left">Слева</option>
                        <option value="right">Справа</option>
                        <option value="both_sides">С обеих сторон</option>
                      </Select>
                    </InputGroup>
                  )}
                </>
              )}
            </ContentInner>
          </SectionContent>
        </Section>

        {/* Стены и кровля */}
        <Section>
          <SectionHeader isOpen={openSections.walls} onClick={() => toggleSection('walls')}>
            <SectionTitle>
              <span>🧱</span> Стены и кровля
            </SectionTitle>
            <SectionIcon isOpen={openSections.walls}>▼</SectionIcon>
          </SectionHeader>
          <SectionContent isOpen={openSections.walls}>
            <ContentInner>
              <InputGroup>
                <Label>Материал стен</Label>
                <Select
                  value={params.wallMaterial}
                  onChange={(e) => onChange('wallMaterial', e.target.value)}
                >
                  <option value="none">Открытый каркас</option>
                  <option value="profile">Профнастил</option>
                  <option value="sandwich">Сэндвич-панели</option>
                </Select>
              </InputGroup>
              
              {params.wallMaterial !== 'none' && (
                <InputGroup>
                  <Label>Цвет стен</Label>
                  <ColorPickerWrapper>
                    <ColorPickerButton
                      color={params.wallColor}
                      onClick={() => setActiveColorPicker('wall')}
                    />
                    {activeColorPicker === 'wall' && (
                      <ColorPickerPopup>
                        <HexColorPicker
                          color={params.wallColor}
                          onChange={(color) => {
                            onChange('wallColor', color);
                            setActiveColorPicker(null);
                          }}
                        />
                      </ColorPickerPopup>
                    )}
                  </ColorPickerWrapper>
                </InputGroup>
              )}
              
              <InputGroup>
                <Label>Материал кровли</Label>
                <Select
                  value={params.roofMaterial}
                  onChange={(e) => onChange('roofMaterial', e.target.value)}
                >
                  <option value="profile">Профнастил</option>
                  <option value="sandwich">Сэндвич-панели</option>
                </Select>
              </InputGroup>
              
              <InputGroup>
                <Label>Цвет кровли</Label>
                <ColorPickerWrapper>
                  <ColorPickerButton
                    color={params.roofColor}
                    onClick={() => setActiveColorPicker('roof')}
                  />
                  {activeColorPicker === 'roof' && (
                    <ColorPickerPopup>
                      <HexColorPicker
                        color={params.roofColor}
                        onChange={(color) => {
                          onChange('roofColor', color);
                          setActiveColorPicker(null);
                        }}
                      />
                    </ColorPickerPopup>
                  )}
                </ColorPickerWrapper>
              </InputGroup>
              
              <CheckboxContainer>
                <CheckboxItem onClick={() => onChange('insulation', !params.insulation)}>
                  <HiddenCheckbox
                    checked={params.insulation}
                    onChange={(e) => onChange('insulation', e.target.checked)}
                  />
                  <StyledCheckbox checked={params.insulation} />
                  <CheckboxLabel>Утепление</CheckboxLabel>
                </CheckboxItem>
              </CheckboxContainer>
            </ContentInner>
          </SectionContent>
        </Section>

        {/* Окна и двери */}
        <Section>
          <SectionHeader isOpen={openSections.windows} onClick={() => toggleSection('windows')}>
            <SectionTitle>
              <span>🪟</span> Окна и двери
            </SectionTitle>
            <SectionIcon isOpen={openSections.windows}>▼</SectionIcon>
          </SectionHeader>
          <SectionContent isOpen={openSections.windows}>
            <ContentInner>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
                  Количество окон: {params.windowCount}
                </label>
                <input
                  type="range"
                  min="0"
                  max="20"
                  step="1"
                  value={params.windowCount}
                  onChange={(e) => onChange('windowCount', parseInt(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
                  Количество дверей: {params.doorCount}
                </label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="1"
                  value={params.doorCount}
                  onChange={(e) => onChange('doorCount', parseInt(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>
            </ContentInner>
          </SectionContent>
        </Section>

        {/* Покрытие */}
        <Section>
          <SectionHeader isOpen={openSections.paving} onClick={() => toggleSection('paving')}>
            <SectionTitle>
              <span>🛣️</span> Покрытие
            </SectionTitle>
            <SectionIcon isOpen={openSections.paving}>▼</SectionIcon>
          </SectionHeader>
          <SectionContent isOpen={openSections.paving}>
            <ContentInner>
              <InputGroup>
                <Label>Тип пола внутри здания</Label>
                <Select
                  value={params.floorType || 'concrete'}
                  onChange={(e) => onChange('floorType', e.target.value as any)}
                >
                  <option value="concrete">Бетонный пол</option>
                  <option value="paving">Плитка</option>
                  <option value="self-leveling">Наливной пол</option>
                </Select>
              </InputGroup>
              
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
                  Ширина отмостки/асфальта (м): {(params.asphaltWidth || 10).toFixed(1)}
                </label>
                <input
                  type="range"
                  min="1"
                  max="30"
                  step="0.5"
                  value={params.asphaltWidth || 10}
                  onChange={(e) => onChange('asphaltWidth', parseFloat(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>
            </ContentInner>
          </SectionContent>
        </Section>



      </ControlsCard>
    </Container>
  );
};

export default WarehouseControls;