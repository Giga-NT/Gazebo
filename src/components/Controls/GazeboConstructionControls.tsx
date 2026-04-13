import React from 'react';
import { GazeboParams } from '../../types/gazeboTypes';
import { InputGroup, Label, Select } from './GazeboStyles';

interface GazeboConstructionControlsProps {
  params: GazeboParams;
  onChange: (name: keyof GazeboParams, value: any) => void;
}

const GazeboConstructionControls: React.FC<GazeboConstructionControlsProps> = ({ params, onChange }) => {
  return (
    <>
      <InputGroup>
        <Label>Тип стоек</Label>
        <Select
          value={params.pillarType}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onChange('pillarType', e.target.value)}
        >
          <option value="straight">Прямые</option>
          <option value="curved">Гнутые</option>
        </Select>
      </InputGroup>

      <InputGroup>
        <Label>Направление изгиба стоек</Label>
        <Select
          value={params.pillarBendDirection}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onChange('pillarBendDirection', e.target.value)}
        >
          <option value="outward">Наружу</option>
          <option value="inward">Внутрь</option>
        </Select>
      </InputGroup>

      <div style={{ marginBottom: '16px' }}>
        <Label>Шаг стоек (м): {params.pillarSpacing.toFixed(1)}</Label>
        <input
          type="range"
          min="0.5"
          max="3"
          step="0.1"
          value={params.pillarSpacing}
          onChange={(e) => onChange('pillarSpacing', parseFloat(e.target.value))}
          style={{ width: '100%' }}
        />
      </div>

      <div style={{ marginBottom: '16px' }}>
        <Label>Количество ферм (стропил): {params.trussCount}</Label>
        <input
          type="range"
          min="2"
          max="10"
          step="1"
          value={params.trussCount}
          onChange={(e) => onChange('trussCount', parseInt(e.target.value))}
          style={{ width: '100%' }}
        />
      </div>

      <InputGroup>
        <Label>Тип фермы</Label>
        <Select
          value={params.trussType}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onChange('trussType', e.target.value)}
        >
          <option value="simple">Простая</option>
          <option value="reinforced">Усиленная</option>
          <option value="lattice">Решётчатая</option>
        </Select>
      </InputGroup>

      <div style={{ marginBottom: '16px' }}>
        <Label>Шаг обрешётки (м): {params.lathingStep.toFixed(1)}</Label>
        <input
          type="range"
          min="0.3"
          max="1.0"
          step="0.1"
          value={params.lathingStep}
          onChange={(e) => onChange('lathingStep', parseFloat(e.target.value))}
          style={{ width: '100%' }}
        />
      </div>

      <div style={{ marginBottom: '16px' }}>
        <Label>Высота перил (м): {params.railingHeight.toFixed(1)}</Label>
        <input
          type="range"
          min="0"
          max="1.2"
          step="0.1"
          value={params.railingHeight}
          onChange={(e) => onChange('railingHeight', parseFloat(e.target.value))}
          style={{ width: '100%' }}
        />
      </div>
    </>
  );
};

export default React.memo(GazeboConstructionControls);