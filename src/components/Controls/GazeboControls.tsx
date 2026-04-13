/**
 * Copyright (c) 2026 Giga-NT (Григорьев Константин Владимирович)
 * Все права защищены.
 * 
 * License: Proprietary
 * См. LICENSE файл в корне проекта.
 */

import React, { useState } from 'react';
import { GazeboParams } from '../../types/gazeboTypes';
import { HexColorPicker } from 'react-colorful';
import {
  Container,
  Title,
  ControlSection,
  SectionTitle,
  InputGroup,
  Label,
  Input,
  Select,
  ColorPickerWrapper,
  ColorPickerButton,
  ColorPickerPopup,
  CheckboxContainer,
  CheckboxItem,
  StyledCheckbox,
  RangeInput,
  RangeSlider
} from './GazeboStyles';

import TubeControls from './TubeControls2';
import AppearanceControls from './AppearanceControls2';
import ConstructionControls from './GazeboConstructionControls';

interface GazeboControlsProps {
  params: GazeboParams;
  onChange: (name: keyof GazeboParams, value: any) => void;
}

const GazeboControls: React.FC<GazeboControlsProps> = ({ params, onChange }) => {
  const [activeColorPicker, setActiveColorPicker] = useState<string | null>(null);

  const toggleColorPicker = (pickerName: string) => {
    setActiveColorPicker(activeColorPicker === pickerName ? null : pickerName);
  };

  return (
    <Container>
      <Title>Конструктор беседки</Title>

      {/* Основные параметры */}
      <ControlSection>
        <SectionTitle>Основные параметры</SectionTitle>
        
        <div style={{ marginBottom: '16px' }}>
          <Label>Длина (м): {params.length.toFixed(1)}</Label>
          <input
            type="range"
            min="2"
            max="10"
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
            max="10"
            step="0.1"
            value={params.width}
            onChange={(e) => onChange('width', parseFloat(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <Label>Высота (м): {params.height.toFixed(1)}</Label>
          <input
            type="range"
            min="1.5"
            max="4"
            step="0.1"
            value={params.height}
            onChange={(e) => onChange('height', parseFloat(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>

        <InputGroup>
          <Label>Тип крыши</Label>
          <Select
            value={params.roofType}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onChange('roofType', e.target.value)}
          >
            <option value="gable">Двухскатная</option>
            <option value="arched">Арочная</option>
            <option value="single">Односкатная</option>
          </Select>
        </InputGroup>

        {(params.roofType === 'gable' || params.roofType === 'single' || params.roofType === 'arched') && (
          <div style={{ marginBottom: '16px' }}>
            <Label>Высота крыши (м): {params.roofHeight.toFixed(1)}</Label>
            <input
              type="range"
              min="0.3"
              max="3"
              step="0.1"
              value={params.roofHeight}
              onChange={(e) => onChange('roofHeight', parseFloat(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>
        )}

        <div style={{ marginBottom: '16px' }}>
          <Label>Свес кровли (м): {params.overhang.toFixed(2)}</Label>
          <input
            type="range"
            min="0"
            max="0.5"
            step="0.05"
            value={params.overhang}
            onChange={(e) => onChange('overhang', parseFloat(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>

        <CheckboxContainer>
          <CheckboxItem onClick={() => onChange('showRoofCover', !params.showRoofCover)}>
            <StyledCheckbox
              checked={params.showRoofCover || false}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange('showRoofCover', e.target.checked)}
            />
            <Label>Показать поликарбонатное покрытие</Label>
          </CheckboxItem>
        </CheckboxContainer>
      </ControlSection>

      {/* Конструкция */}
      <ControlSection>
        <SectionTitle>Конструкция</SectionTitle>
        <ConstructionControls params={params} onChange={onChange} />
      </ControlSection>

      {/* Размеры труб */}
      <ControlSection>
        <SectionTitle>Размеры труб</SectionTitle>
        <TubeControls params={params} onChange={onChange} />
      </ControlSection>

      {/* Внешний вид */}
      <ControlSection>
        <SectionTitle>Внешний вид</SectionTitle>
        <AppearanceControls params={params} onChange={onChange} />
      </ControlSection>

      {/* Фундамент и пол */}
      <ControlSection>
        <SectionTitle>Фундамент и пол</SectionTitle>
        <InputGroup>
          <Label>Тип фундамента</Label>
          <Select
            value={params.foundationType}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onChange('foundationType', e.target.value)}
          >
            <option value="wood">Деревянный</option>
            <option value="concrete">Бетонный</option>
            <option value="piles">Свайный</option>
            <option value="none">Без фундамента</option>
          </Select>
        </InputGroup>
        <InputGroup>
          <Label>Покрытие пола</Label>
          <Select
            value={params.floorType}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onChange('floorType', e.target.value)}
          >
            <option value="wood">Дерево</option>
            <option value="tile">Плитка</option>
            <option value="concrete">Бетон</option>
            <option value="none">Без пола</option>
          </Select>
        </InputGroup>
        <InputGroup>
          <Label>Цвет пола</Label>
          <ColorPickerWrapper>
            <ColorPickerButton
              color={params.floorColor}
              onClick={() => toggleColorPicker('floor')}
            />
            {activeColorPicker === 'floor' && (
              <ColorPickerPopup>
                <HexColorPicker
                  color={params.floorColor}
                  onChange={(color) => {
                    onChange('floorColor', color);
                    setActiveColorPicker(null);
                  }}
                />
              </ColorPickerPopup>
            )}
          </ColorPickerWrapper>
        </InputGroup>
      </ControlSection>

      {/* Мебель */}
      <ControlSection>
        <SectionTitle>Мебель</SectionTitle>
        <CheckboxContainer>
          <CheckboxItem onClick={() => onChange('hasFurniture', !params.hasFurniture)}>
            <StyledCheckbox
              checked={params.hasFurniture || false}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange('hasFurniture', e.target.checked)}
            />
            <Label>Добавить мебель</Label>
          </CheckboxItem>
        </CheckboxContainer>
        {params.hasFurniture && (
          <>
            <div style={{ marginBottom: '16px' }}>
              <Label>Количество скамеек: {params.benchCount}</Label>
              <input
                type="range"
                min="1"
                max="8"
                step="1"
                value={params.benchCount}
                onChange={(e) => onChange('benchCount', parseInt(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>

            <SectionTitle style={{ fontSize: '1rem', marginTop: '16px' }}>Параметры скамеек (опционально)</SectionTitle>
            <div style={{ marginBottom: '16px' }}>
              <Label>Длина скамейки (м): {(params.benchLength ?? (params.width || 3)).toFixed(1)}</Label>
              <input
                type="range"
                step="0.1"
                min="0.5"
                max={Math.max(params.width, params.length)}
                value={params.benchLength ?? (params.width || 3)}
                onChange={(e) => onChange('benchLength', parseFloat(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <Label>Ширина сиденья (м): {(params.benchSeatWidth ?? 0.4).toFixed(2)}</Label>
              <input
                type="range"
                step="0.05"
                min="0.2"
                max="0.8"
                value={params.benchSeatWidth ?? 0.4}
                onChange={(e) => onChange('benchSeatWidth', parseFloat(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <Label>Высота скамейки (м): {(params.benchHeight ?? 0.45).toFixed(2)}</Label>
              <input
                type="range"
                step="0.05"
                min="0.2"
                max="0.8"
                value={params.benchHeight ?? 0.45}
                onChange={(e) => onChange('benchHeight', parseFloat(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <Label>Количество столов: {params.tableCount ?? 1}</Label>
              <input
                type="range"
                min="1"
                max="6"
                step="1"
                value={params.tableCount ?? 1}
                onChange={(e) => onChange('tableCount', parseInt(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>

            <InputGroup>
              <Label>Ориентация стола</Label>
              <Select
                value={params.tableRotation ?? 0}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onChange('tableRotation', parseInt(e.target.value) as 0 | 90)}
              >
                <option value={0}>Вдоль ширины (стандартно)</option>
                <option value={90}>Вдоль длины (повёрнутый)</option>
              </Select>
            </InputGroup>

            <SectionTitle style={{ fontSize: '1rem', marginTop: '16px' }}>Размер стола</SectionTitle>
            <InputGroup>
              <Label>Предустановка</Label>
              <Select
                value={params.tableSize}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onChange('tableSize', e.target.value)}
              >
                <option value="small">Маленький (0.6×0.6×0.75)</option>
                <option value="medium">Средний (0.8×0.8×0.75)</option>
                <option value="large">Большой (1.0×1.0×0.75)</option>
              </Select>
            </InputGroup>

            <SectionTitle style={{ fontSize: '1rem', marginTop: '16px' }}>Цвета стола</SectionTitle>
            <InputGroup>
              <Label>Цвет столешницы</Label>
              <ColorPickerWrapper>
                <ColorPickerButton
                  color={params.tableTopColor || '#D2B48C'}
                  onClick={() => toggleColorPicker('tableTop')}
                />
                {activeColorPicker === 'tableTop' && (
                  <ColorPickerPopup>
                    <HexColorPicker
                      color={params.tableTopColor || '#D2B48C'}
                      onChange={(color) => {
                        onChange('tableTopColor', color);
                        setActiveColorPicker(null);
                      }}
                    />
                  </ColorPickerPopup>
                )}
              </ColorPickerWrapper>
            </InputGroup>
            <InputGroup>
              <Label>Цвет ножек стола</Label>
              <ColorPickerWrapper>
                <ColorPickerButton
                  color={params.tableLegsColor || '#8B4513'}
                  onClick={() => toggleColorPicker('tableLegs')}
                />
                {activeColorPicker === 'tableLegs' && (
                  <ColorPickerPopup>
                    <HexColorPicker
                      color={params.tableLegsColor || '#8B4513'}
                      onChange={(color) => {
                        onChange('tableLegsColor', color);
                        setActiveColorPicker(null);
                      }}
                    />
                  </ColorPickerPopup>
                )}
              </ColorPickerWrapper>
            </InputGroup>

            <SectionTitle style={{ fontSize: '0.95rem', color: '#555', marginTop: '8px' }}>Ручные размеры (заполните для переопределения)</SectionTitle>
            <div style={{ marginBottom: '16px' }}>
              <Label>Ширина стола (м): {(params.tableWidth ?? (params.tableSize === 'small' ? 0.6 : params.tableSize === 'medium' ? 0.8 : 1.0)).toFixed(2)}</Label>
              <input
                type="range"
                step="0.1"
                min="0.4"
                max={params.width}
                value={params.tableWidth ?? (params.tableSize === 'small' ? 0.6 : params.tableSize === 'medium' ? 0.8 : 1.0)}
                onChange={(e) => onChange('tableWidth', parseFloat(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <Label>Глубина стола (м): {(params.tableDepth ?? (params.tableSize === 'small' ? 0.6 : params.tableSize === 'medium' ? 0.8 : 1.0)).toFixed(2)}</Label>
              <input
                type="range"
                step="0.1"
                min="0.4"
                max={params.length}
                value={params.tableDepth ?? (params.tableSize === 'small' ? 0.6 : params.tableSize === 'medium' ? 0.8 : 1.0)}
                onChange={(e) => onChange('tableDepth', parseFloat(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <Label>Высота стола (м): {(params.tableHeight ?? 0.75).toFixed(2)}</Label>
              <input
                type="range"
                step="0.05"
                min="0.5"
                max="1.2"
                value={params.tableHeight ?? 0.75}
                onChange={(e) => onChange('tableHeight', parseFloat(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>
          </>
        )}
      </ControlSection>

      {/* Окружение */}
      <ControlSection>
        <SectionTitle>Окружение</SectionTitle>
        <InputGroup>
          <Label>Покрытие земли</Label>
          <Select
            value={params.groundType}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onChange('groundType', e.target.value)}
          >
            <option value="grass">Трава</option>
            <option value="wood">Дерево</option>
            <option value="concrete">Бетон</option>
          </Select>
        </InputGroup>
        <CheckboxContainer>
          <CheckboxItem onClick={() => onChange('showBackground', !params.showBackground)}>
            <StyledCheckbox
              checked={params.showBackground || false}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange('showBackground', e.target.checked)}
            />
            <Label>Показать окружение</Label>
          </CheckboxItem>
        </CheckboxContainer>
      </ControlSection>
    </Container>
  );
};

export default GazeboControls;