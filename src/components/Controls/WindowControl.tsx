/**
 * Copyright (c) 2026 Giga-NT (Григорьев Константин Владимирович)
 * Все права защищены.
 */

import React from 'react';

interface WindowControlProps {
  isOpen: boolean;
  onToggle: () => void;
}

const WindowControl: React.FC<WindowControlProps> = ({ isOpen, onToggle }) => {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: '30px',
        right: '30px',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}
    >
      <button
        onClick={onToggle}
        style={{
          padding: '14px 28px',
          fontSize: '16px',
          fontWeight: 'bold',
          borderRadius: '12px',
          border: 'none',
          cursor: 'pointer',
          backgroundColor: isOpen ? '#ff6b6b' : '#4caf50',
          color: 'white',
          boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
          transition: 'all 0.3s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        <span style={{ fontSize: '24px' }}>
          {isOpen ? '🚪' : '🪟'}
        </span>
        {isOpen ? 'Закрыть окно' : 'Открыть окно'}
      </button>
      
      <div
        style={{
          backgroundColor: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(8px)',
          padding: '8px 16px',
          borderRadius: '20px',
          fontSize: '12px',
          color: '#ccc',
          textAlign: 'center'
        }}
      >
        {isOpen ? '✨ Окно открыто • Свежий воздух' : '🔒 Окно закрыто'}
      </div>
    </div>
  );
};

export default WindowControl;