import React, { useEffect } from 'react';
import { ControlProps } from '../../types/types';

const AppearanceControls: React.FC<ControlProps> = ({ params, onChange }) => {
  
  // Эффект для принудительного переключения материала при смене типа крыши
  useEffect(() => {
    if (params.roofType === 'arch' && params.roofMaterial === 'tile') {
      // Если выбрана арка, а материал черепица -> переключаем на металл
      onChange('roofMaterial', 'metal');
    }
  }, [params.roofType, params.roofMaterial, onChange]);

  // Описание материалов для подсказки
  const getMaterialDescription = () => {
    switch (params.roofMaterial) {
      case 'metal':
        return 'Металл/профнастил - металлический блеск';
      case 'tile':
        return 'Черепица - матовая поверхность (недоступна для арочных крыш)';
      case 'polycarbonate':
        return 'Поликарбонат - прозрачный, полупрозрачный';
      default:
        return '';
    }
  };

  const isArch = params.roofType === 'arch';

  return (
    <div style={{ marginBottom: '20px', borderBottom: '1px solid #ddd', paddingBottom: '15px' }}>
      <h3>Внешний вид</h3>
      
      <div style={{ marginBottom: '15px' }}>
        <label>Материал кровли: </label>
        <select 
          value={isArch ? 'metal' : params.roofMaterial} 
          onChange={(e) => onChange('roofMaterial', e.target.value)}
          disabled={isArch && params.roofMaterial === 'tile'} // Блокируем, если вдруг рассинхрон
          style={{ 
            width: '100%', 
            padding: '8px', 
            borderRadius: '4px', 
            border: '1px solid #ccc',
            backgroundColor: isArch ? '#f9f9f9' : 'white',
            color: isArch ? '#666' : 'black'
          }}
        >
          <option value="metal">Металл / Профнастил</option>
          <option value="polycarbonate">Поликарбонат (прозрачный)</option>
          {/* Показываем черепицу только если крыша НЕ арочная */}
          {!isArch && <option value="tile">Черепица</option>}
        </select>
        
        {isArch && (
          <small style={{ color: '#d9534f', display: 'block', marginTop: '5px', fontWeight: 'bold' }}>
            Внимание: Для арочных крыш черепица недоступна (выбран металл)
          </small>
        )}
        
        {!isArch && (
          <small style={{ color: '#666', display: 'block', marginTop: '5px' }}>
            {getMaterialDescription()}
          </small>
        )}
      </div>
      
      <div style={{ marginBottom: '15px' }}>
        <label>Цвет каркаса: </label>
        <input
          type="color"
          value={params.frameColor}
          onChange={(e) => onChange('frameColor', e.target.value)}
          style={{ width: '100%', height: '40px' }}
        />
      </div>
      
      <div style={{ marginBottom: '15px' }}>
        <label>Цвет фундамента: </label>
        <input
          type="color"
          value={params.foundationColor}
          onChange={(e) => onChange('foundationColor', e.target.value)}
          style={{ width: '100%', height: '40px' }}
        />
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label>Цвет кровли: </label>
        <input
          type="color"
          value={params.roofColor || '#4682B4'}
          onChange={(e) => onChange('roofColor', e.target.value)}
          style={{ width: '100%', height: '40px' }}
        />
        <small style={{ color: '#666', display: 'block', marginTop: '5px' }}>
          Для металла/черепицы - цвет покрытия, для поликарбоната - оттенок
        </small>
      </div>
    </div>
  );
};

export default AppearanceControls;