// MobileMenuWithAccordion.tsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

// ===== СТИЛИ =====
const MenuButton = styled.button<{ $isOpen: boolean }>`
  position: fixed;
  top: 16px;
  right: 16px;
  z-index: 1001;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: ${props => props.$isOpen ? '#fff' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
  border: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 6px;
  transition: all 0.3s ease;
  
  &:active {
    transform: scale(0.95);
  }
  
  @media (min-width: 768px) {
    display: none;
  }
`;

const MenuLine = styled.div<{ $isOpen: boolean; $index: number }>`
  width: 24px;
  height: 2px;
  background: ${props => props.$isOpen ? '#333' : 'white'};
  border-radius: 2px;
  transition: all 0.3s ease;
  transform: ${props => {
    if (!props.$isOpen) return 'none';
    if (props.$index === 0) return 'rotate(45deg) translate(5px, 6px)';
    if (props.$index === 1) return 'none';
    if (props.$index === 2) return 'rotate(-45deg) translate(5px, -6px)';
    return 'none';
  }};
  opacity: ${props => props.$isOpen && props.$index === 1 ? 0 : 1};
`;

const Overlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  opacity: ${props => props.$isOpen ? 1 : 0};
  visibility: ${props => props.$isOpen ? 'visible' : 'hidden'};
  transition: all 0.3s ease;
  backdrop-filter: blur(4px);
`;

const MenuPanel = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 85%;
  max-width: 400px;
  background: #f5f7fa;
  z-index: 1000;
  transform: ${props => props.$isOpen ? 'translateX(0)' : 'translateX(100%)'};
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const MenuHeader = styled.div`
  padding: 20px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  position: relative;
  
  h2 {
    margin: 0;
    font-size: 1.4rem;
    font-weight: 700;
  }
  
  p {
    margin: 8px 0 0;
    font-size: 0.8rem;
    opacity: 0.9;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease;
  
  &:active {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const MenuContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  
  /* Стилизация скроллбара */
  &::-webkit-scrollbar {
    width: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: #e2e8f0;
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #667eea;
    border-radius: 4px;
  }
`;

// ===== СТИЛИ ДЛЯ АККОРДЕОНА =====
const AccordionSection = styled.div`
  border-bottom: 1px solid #e2e8f0;
  background: white;
  border-radius: 12px;
  margin-bottom: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
`;

const AccordionHeader = styled.div<{ $isOpen: boolean }>`
  padding: 14px 16px;
  background: ${props => props.$isOpen ? '#f8fafc' : 'white'};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.3s ease;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  
  &:active {
    background: #f1f5f9;
    transform: scale(0.99);
  }
`;

const AccordionTitle = styled.h4`
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const AccordionIcon = styled.span<{ $isOpen: boolean }>`
  font-size: 16px;
  transform: rotate(${props => props.$isOpen ? '180deg' : '0deg'});
  transition: transform 0.3s ease;
  color: #64748b;
`;

const AccordionContent = styled.div<{ $isOpen: boolean }>`
  max-height: ${props => props.$isOpen ? '2000px' : '0'};
  overflow: hidden;
  transition: max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1);
`;

const AccordionInner = styled.div`
  padding: 16px;
  background: white;
  border-top: 1px solid #eef2f6;
`;

// ===== КОМПОНЕНТ АККОРДЕОНА =====
interface AccordionItemProps {
  title: string;
  icon?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

const AccordionItem: React.FC<AccordionItemProps> = ({ 
  title, 
  icon = '📐', 
  defaultOpen = false,
  children 
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <AccordionSection>
      <AccordionHeader $isOpen={isOpen} onClick={() => setIsOpen(!isOpen)}>
        <AccordionTitle>
          <span>{icon}</span> {title}
        </AccordionTitle>
        <AccordionIcon $isOpen={isOpen}>▼</AccordionIcon>
      </AccordionHeader>
      <AccordionContent $isOpen={isOpen}>
        <AccordionInner>
          {children}
        </AccordionInner>
      </AccordionContent>
    </AccordionSection>
  );
};

// ===== ОСНОВНОЙ КОМПОНЕНТ =====
interface MobileMenuWithAccordionProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export const MobileMenuWithAccordion: React.FC<MobileMenuWithAccordionProps> = ({ 
  children, 
  title = "⚙️ Управление",
  subtitle = "Настройте параметры конструкции"
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Закрываем меню при изменении размера экрана (если стало десктопом)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen]);

  // Блокируем скролл тела при открытом меню
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <>
      {/* Кнопка-бургер */}
      <MenuButton $isOpen={isOpen} onClick={toggleMenu}>
        <MenuLine $isOpen={isOpen} $index={0} />
        <MenuLine $isOpen={isOpen} $index={1} />
        <MenuLine $isOpen={isOpen} $index={2} />
      </MenuButton>

      {/* Оверлей */}
      <Overlay $isOpen={isOpen} onClick={closeMenu} />

      {/* Панель меню */}
      <MenuPanel $isOpen={isOpen}>
        <MenuHeader>
          <h2>{title}</h2>
          <p>{subtitle}</p>
          <CloseButton onClick={closeMenu}>✕</CloseButton>
        </MenuHeader>
        <MenuContent>
          {children}
        </MenuContent>
      </MenuPanel>
    </>
  );
};

// Экспортируем также аккордеон-элемент для использования внутри
export { AccordionItem };