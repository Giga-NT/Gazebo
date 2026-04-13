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
  InputGroup,
  Label,
  Select,
  ColorPickerWrapper,
  ColorPickerButton,
  ColorPickerPopup
} from './GazeboStyles';

interface AppearanceControlsProps {
  params: GazeboParams;
  onChange: (name: keyof GazeboParams, value: any) => void;
}

const AppearanceControls: React.FC<AppearanceControlsProps> = ({ params, onChange }) => {
  const [activeColorPicker, setActiveColorPicker] = useState<string | null>(null);

  const toggleColorPicker = (pickerName: string) => {
    setActiveColorPicker(activeColorPicker === pickerName ? null : pickerName);
  };

  const closeColorPicker = () => {
    setActiveColorPicker(null);
  };

  return (
    <>
      <InputGroup>
        <Label>Основной материал</Label>
        <Select
          value={params.materialType}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onChange('materialType', e.target.value)}
        >
          <option value="wood">Дерево</option>
          <option value="metal">Металл</option>
          <option value="combined">Комбинированный</option>
        </Select>
      </InputGroup>

      <InputGroup>
        <Label>Цвет конструкции</Label>
        <ColorPickerWrapper>
          <ColorPickerButton
            color={params.color}
            onClick={() => toggleColorPicker('main')}
            title={params.color}
          />
          <span style={{ marginLeft: '10px', fontSize: '14px', color: '#666', fontFamily: 'monospace' }}>
            {params.color}
          </span>
          {activeColorPicker === 'main' && (
            <ColorPickerPopup>
              <div style={{ position: 'relative' }}>
                <button
                  onClick={closeColorPicker}
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    background: '#ff4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    lineHeight: '1',
                    zIndex: 10
                  }}
                >
                  ×
                </button>
                <HexColorPicker
                  color={params.color}
                  onChange={(color) => onChange('color', color)}
                />
              </div>
            </ColorPickerPopup>
          )}
        </ColorPickerWrapper>
      </InputGroup>

      <InputGroup>
        <Label>Цвет крыши</Label>
        <ColorPickerWrapper>
          <ColorPickerButton
            color={params.roofColor}
            onClick={() => toggleColorPicker('roof')}
            title={params.roofColor}
          />
          <span style={{ marginLeft: '10px', fontSize: '14px', color: '#666', fontFamily: 'monospace' }}>
            {params.roofColor}
          </span>
          {activeColorPicker === 'roof' && (
            <ColorPickerPopup>
              <div style={{ position: 'relative' }}>
                <button
                  onClick={closeColorPicker}
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    background: '#ff4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    lineHeight: '1',
                    zIndex: 10
                  }}
                >
                  ×
                </button>
                <HexColorPicker
                  color={params.roofColor}
                  onChange={(color) => onChange('roofColor', color)}
                />
              </div>
            </ColorPickerPopup>
          )}
        </ColorPickerWrapper>
      </InputGroup>

      <InputGroup>
        <Label>Цвет пола</Label>
        <ColorPickerWrapper>
          <ColorPickerButton
            color={params.floorColor}
            onClick={() => toggleColorPicker('floor')}
            title={params.floorColor}
          />
          <span style={{ marginLeft: '10px', fontSize: '14px', color: '#666', fontFamily: 'monospace' }}>
            {params.floorColor}
          </span>
          {activeColorPicker === 'floor' && (
            <ColorPickerPopup>
              <div style={{ position: 'relative' }}>
                <button
                  onClick={closeColorPicker}
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    background: '#ff4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    lineHeight: '1',
                    zIndex: 10
                  }}
                >
                  ×
                </button>
                <HexColorPicker
                  color={params.floorColor}
                  onChange={(color) => onChange('floorColor', color)}
                />
              </div>
            </ColorPickerPopup>
          )}
        </ColorPickerWrapper>
      </InputGroup>
    </>
  );
};

export default React.memo(AppearanceControls);