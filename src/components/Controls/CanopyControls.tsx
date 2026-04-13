/**
 * Copyright (c) 2026 Giga-NT (Григорьев Константин Владимирович)
 * Все права защищены.
 * 
 * License: Proprietary
 * См. LICENSE файл в корне проекта.
 */

import React from 'react';

interface CanopyParams {
  width: number;
  length: number;
  height: number;
  roofHeight: number;
  overhang: number;
  frameColor: string;
  roofColor: string;
}

interface CanopyControlsProps {
  params: CanopyParams;
  onChange: (name: keyof CanopyParams, value: any) => void;
}

const CanopyControls: React.FC<CanopyControlsProps> = ({ params, onChange }) => {
  return (
    <div style={{ padding: '20px', fontFamily: 'Segoe UI, sans-serif' }}>
      <h2 style={{ margin: '0 0 20px', fontSize: '24px', fontWeight: '700', color: '#2c3e50' }}>
        🏠 Конструктор навеса
      </h2>

      {/* Габариты */}
      <div style={{ marginBottom: '20px', borderBottom: '1px solid #ddd', paddingBottom: '15px' }}>
        <h3 style={{ margin: '0 0 15px', fontSize: '18px', color: '#2c3e50' }}>📐 Габариты</h3>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#7f8c8d' }}>
            Длина (м): {params.length.toFixed(1)}
          </label>
          <input
            type="range"
            min="3"
            max="15"
            step="0.1"
            value={params.length}
            onChange={(e) => onChange('length', parseFloat(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#7f8c8d' }}>
            Ширина (м): {params.width.toFixed(1)}
          </label>
          <input
            type="range"
            min="2"
            max="15"
            step="0.1"
            value={params.width}
            onChange={(e) => onChange('width', parseFloat(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#7f8c8d' }}>
            Высота стоек (м): {params.height.toFixed(1)}
          </label>
          <input
            type="range"
            min="2"
            max="12"
            step="0.1"
            value={params.height}
            onChange={(e) => onChange('height', parseFloat(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#7f8c8d' }}>
            Высота кровли (м): {params.roofHeight.toFixed(1)}
          </label>
          <input
            type="range"
            min="0.5"
            max="3"
            step="0.1"
            value={params.roofHeight}
            onChange={(e) => onChange('roofHeight', parseFloat(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#7f8c8d' }}>
            Свес кровли (м): {params.overhang.toFixed(2)}
          </label>
          <input
            type="range"
            min="0.1"
            max="3"
            step="0.05"
            value={params.overhang}
            onChange={(e) => onChange('overhang', parseFloat(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>
      </div>
    </div>
  );
};

export default CanopyControls;
