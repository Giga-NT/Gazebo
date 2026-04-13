import React, { useState } from 'react';
import { GreenhouseParams } from '../../types/GreenhouseTypes';
import { HexColorPicker } from 'react-colorful';
import styled from 'styled-components';

// Стилизованные компоненты
const Container = styled.div`
  padding: 24px;
  background: #f5f7fa;
  font-family: 'Segoe UI', sans-serif;
  border-radius: 12px;
  max-width: 500px;
  margin: 0 auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
`;

const Title = styled.h2`
  margin: 0 0 24px;
  color: #2c3e50;
  font-size: 1.8rem;
  font-weight: 700;
  text-align: center;
`;

// Аккордеон секции
const Section = styled.div`
  border-bottom: 1px solid #e2e8f0;
`;

const SectionHeader = styled.div<{ $isOpen: boolean }>`
  padding: 18px 24px;
  background: ${props => props.$isOpen ? '#f8fafc' : 'white'};
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
  margin: 0;
  color: #2c3e50;
  font-size: 1.2rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const SectionIcon = styled.span<{ $isOpen: boolean }>`
  font-size: 20px;
  transform: rotate(${props => props.$isOpen ? '180deg' : '0deg'});
  transition: transform 0.3s ease;
`;

const SectionContent = styled.div<{ $isOpen: boolean }>`
  max-height: ${props => props.$isOpen ? '2000px' : '0'};
  overflow: hidden;
  transition: max-height 0.5s ease;
  background: white;
`;

const ContentInner = styled.div`
  padding: 20px 24px 24px;
`;

const InputGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 6px;
  font-size: 0.9rem;
  color: #34495e;
  font-weight: 500;
`;

const Select = styled.select`
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 0.95rem;
  background: #fff;
  transition: border 0.3s ease;

  &:focus {
    border-color: #3498db;
    outline: none;
    box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
  }
`;

const ColorPickerWrapper = styled.div`
  position: relative;
  display: inline-block;
`;

const ColorPickerButton = styled.button<{ color: string }>`
  width: 40px;
  height: 28px;
  background: ${props => props.color};
  border: 1px solid #ccc;
  border-radius: 6px;
  cursor: pointer;
  margin-top: 6px;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.05);
  }
`;

const ColorPickerPopup = styled.div`
  position: absolute;
  z-index: 100;
  top: 100%;
  left: 0;
  margin-top: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-radius: 8px;
  background: #fff;
  padding: 12px;
`;

const CheckboxContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 10px;
`;

const CheckboxItem = styled.div`
  display: flex;
  align-items: center;
`;

const StyledCheckbox = styled.input.attrs({ type: 'checkbox' })`
  margin-right: 8px;
  width: 16px;
  height: 16px;
  cursor: pointer;
`;

interface GreenhouseControlsProps {
  params: GreenhouseParams;
  onChange: (name: keyof GreenhouseParams, value: any) => void;
  ventsOpen: boolean;
  setVentsOpen: (open: boolean) => void;
}

const GreenhouseControls: React.FC<GreenhouseControlsProps> = ({
  params,
  onChange,
  ventsOpen,
  setVentsOpen
}) => {
  const [activeColorPicker, setActiveColorPicker] = useState<string | null>(null);
  const [openSections, setOpenSections] = useState({
    basic: true,
    materials: false,
    roof: false,
    doors: false
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const toggleColorPicker = (pickerName: string) => {
    setActiveColorPicker(activeColorPicker === pickerName ? null : pickerName);
  };

  const handleVentChange = (field: string, value: any) => {
    onChange('vent', {
      ...params.vent,
      [field]: value
    });
  };

  const handleVentSideToggle = (side: string) => {
    const currentSides = params.vent?.side?.split(',') || [];
    const newSides = currentSides.includes(side)
      ? currentSides.filter(s => s !== side)
      : [...currentSides, side];

    handleVentChange('side', newSides.join(','));
  };

  const isSideSelected = (side: string) => {
    return params.vent?.side?.includes(side) || false;
  };

  const ventSides = [
    { value: 'front', label: 'Спереди' },
    { value: 'back', label: 'Сзади' },
    { value: 'left', label: 'Слева' },
    { value: 'right', label: 'Справа' }
  ];

  return (
    <Container>
      <Title>🌱 Конструктор теплицы</Title>

      {/* Основные параметры */}
      <Section>
        <SectionHeader $isOpen={openSections.basic} onClick={() => toggleSection('basic')}>
          <SectionTitle>
            <span>📐</span> Основные параметры
          </SectionTitle>
          <SectionIcon $isOpen={openSections.basic}>▼</SectionIcon>
        </SectionHeader>
        <SectionContent $isOpen={openSections.basic}>
          <ContentInner>
            <div style={{ marginBottom: '16px' }}>
              <Label>Длина (м): {params.length.toFixed(1)}</Label>
              <input
                type="range"
                min="2"
                max="24"
                step="0.1"
                value={params.length}
                onChange={(e) => onChange('length', parseFloat(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <Label>Ширина (м): {params.width.toFixed(1)}</Label>
              <input
                type="range"
                min="2"
                max="12"
                step="0.1"
                value={params.width}
                onChange={(e) => onChange('width', parseFloat(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <Label>Высота стен (м): {params.wallHeight.toFixed(1)}</Label>
              <input
                type="range"
                min="2"
                max="4"
                step="0.1"
                value={params.wallHeight}
                onChange={(e) => onChange('wallHeight', parseFloat(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>

            <InputGroup>
              <Label>Тип теплицы</Label>
              <Select
                value={params.type}
                onChange={(e) => onChange('type', e.target.value)}
              >
                <option value="arched">Арочная</option>
                <option value="gable">Двускатная</option>
              </Select>
            </InputGroup>
          </ContentInner>
        </SectionContent>
      </Section>

      {/* Материалы */}
      <Section>
        <SectionHeader $isOpen={openSections.materials} onClick={() => toggleSection('materials')}>
          <SectionTitle>
            <span>🔧</span> Материалы
          </SectionTitle>
          <SectionIcon $isOpen={openSections.materials}>▼</SectionIcon>
        </SectionHeader>
        <SectionContent $isOpen={openSections.materials}>
          <ContentInner>
            <InputGroup>
              <Label>Каркас</Label>
              <Select
                value={params.frameMaterial}
                onChange={(e) => onChange('frameMaterial', e.target.value)}
              >
                <option value="metal">Металл</option>
                <option value="pvc">ПВХ</option>
                <option value="wood">Дерево</option>
              </Select>
            </InputGroup>

            <InputGroup>
              <Label>Цвет каркаса</Label>
              <ColorPickerWrapper>
                <ColorPickerButton
                  color={params.frameColor}
                  onClick={() => toggleColorPicker('frame')}
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

      {/* Крыша */}
      <Section>
        <SectionHeader $isOpen={openSections.roof} onClick={() => toggleSection('roof')}>
          <SectionTitle>
            <span>🏠</span> Крыша
          </SectionTitle>
          <SectionIcon $isOpen={openSections.roof}>▼</SectionIcon>
        </SectionHeader>
        <SectionContent $isOpen={openSections.roof}>
          <ContentInner>
            {params.type === 'arched' && (
              <div style={{ marginBottom: '16px' }}>
                <Label>Высота арки (м): {params.archHeight.toFixed(1)}</Label>
                <input
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.1"
                  value={params.archHeight}
                  onChange={(e) => onChange('archHeight', parseFloat(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>
            )}

            {params.type === 'gable' && (
              <div style={{ marginBottom: '16px' }}>
                <Label>Угол наклона (°): {params.roofAngle}</Label>
                <input
                  type="range"
                  min="5"
                  max="20"
                  step="1"
                  value={params.roofAngle}
                  onChange={(e) => onChange('roofAngle', parseInt(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>
            )}

            <InputGroup>
              <Label>Покрытие</Label>
              <Select
                value={params.coverMaterial}
                onChange={(e) => onChange('coverMaterial', e.target.value)}
              >
                <option value="polycarbonate">Поликарбонат</option>
                <option value="glass">Стекло</option>
                <option value="film">Пленка</option>
              </Select>
            </InputGroup>

            <InputGroup>
              <Label>Цвет покрытия</Label>
              <ColorPickerWrapper>
                <ColorPickerButton
                  color={params.coverColor}
                  onClick={() => toggleColorPicker('cover')}
                />
                {activeColorPicker === 'cover' && (
                  <ColorPickerPopup>
                    <HexColorPicker
                      color={params.coverColor}
                      onChange={(color) => {
                        onChange('coverColor', color);
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

      {/* Двери */}
      <Section>
        <SectionHeader $isOpen={openSections.doors} onClick={() => toggleSection('doors')}>
          <SectionTitle>
            <span>🚪</span> Двери
          </SectionTitle>
          <SectionIcon $isOpen={openSections.doors}>▼</SectionIcon>
        </SectionHeader>
        <SectionContent $isOpen={openSections.doors}>
          <ContentInner>
            <CheckboxContainer>
              <CheckboxItem onClick={() => onChange('hasDoors', !params.hasDoors)}>
                <StyledCheckbox
                  checked={params.hasDoors || false}
                  onChange={(e) => onChange('hasDoors', e.target.checked)}
                />
                <Label>Двери</Label>
              </CheckboxItem>
            </CheckboxContainer>

            {params.hasDoors && (
              <InputGroup>
                <Label>Сторона дверей</Label>
                <Select
                  value={params.doorSide}
                  onChange={(e) => onChange('doorSide', e.target.value)}
                >
                  <option value="front">Только спереди</option>
                  <option value="back">Только сзади</option>
                  <option value="both">С обеих сторон</option>
                </Select>
              </InputGroup>
            )}
          </ContentInner>
        </SectionContent>
      </Section>
    </Container>
  );
};

export default GreenhouseControls;