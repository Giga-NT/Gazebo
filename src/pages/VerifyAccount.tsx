import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import styled from 'styled-components';

// Стили в том же стиле, что и RegisterForm
const Container = styled.div`
  max-width: 450px;
  margin: 40px auto;
  padding: 30px;
  background: var(--bg-primary, #f8f9fa);
  border-radius: 8px;
  box-shadow: 0 4px 12px var(--shadow, rgba(0,0,0,0.1));
`;

const Title = styled.h2`
  text-align: center;
  color: var(--text-primary, #2c3e50);
  margin-bottom: 20px;
  font-size: 1.8rem;
  position: relative;
  padding-bottom: 10px;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 3px;
    background: var(--accent, #3498db);
  }
`;

const Description = styled.p`
  text-align: center;
  color: var(--text-secondary, #6c757d);
  margin-bottom: 30px;
  font-size: 1rem;
  line-height: 1.5;
`;

const EmailHighlight = styled.span`
  font-weight: 600;
  color: var(--accent, #3498db);
  background: rgba(52, 152, 219, 0.1);
  padding: 2px 8px;
  border-radius: 4px;
  display: inline-block;
  margin: 5px 0;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const CodeContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 12px;
  margin: 20px 0;
`;

const CodeInput = styled.input`
  width: 70px;
  height: 80px;
  text-align: center;
  font-size: 2.5rem;
  font-weight: 600;
  border: 2px solid var(--border-light, #ddd);
  border-radius: 8px;
  background: var(--bg-secondary, white);
  color: var(--text-primary, #2c3e50);
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: var(--accent, #3498db);
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
  }
  
  &::placeholder {
    font-size: 1.5rem;
    color: var(--text-secondary, #aaa);
  }
`;

const Button = styled.button`
  padding: 14px;
  background: var(--accent, #3498db);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1.1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  
  &:hover {
    background: var(--accent-secondary, #2980b9);
  }
  
  &:disabled {
    background: var(--border-light, #95a5a6);
    cursor: not-allowed;
  }
`;

const ResendButton = styled.button`
  background: none;
  border: none;
  color: var(--accent, #3498db);
  font-size: 0.9rem;
  text-decoration: underline;
  cursor: pointer;
  margin-top: 15px;
  transition: color 0.2s;
  
  &:hover {
    color: var(--accent-secondary, #2980b9);
  }
  
  &:disabled {
    color: var(--text-secondary, #6c757d);
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: #e74c3c;
  font-size: 0.9rem;
  text-align: center;
  padding: 10px;
  background: rgba(231, 76, 60, 0.1);
  border-radius: 4px;
  margin: 10px 0;
`;

const SuccessMessage = styled.div`
  color: #2ecc71;
  font-size: 0.9rem;
  text-align: center;
  padding: 10px;
  background: rgba(46, 204, 113, 0.1);
  border-radius: 4px;
  margin: 10px 0;
`;

const Timer = styled.div`
  text-align: center;
  color: var(--text-secondary, #6c757d);
  font-size: 0.9rem;
  margin-top: 10px;
`;

export const VerifyAccount = () => {
  const [code, setCode] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [timer, setTimer] = useState(60);
  
  // Исправляем тип для refs
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  const { verifyAccount } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const email = location.state?.email;

  // Инициализация refs
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, 4);
  }, []);

  const handleCodeChange = (index: number, value: string) => {
    // Только цифры
    if (value && !/^\d+$/.test(value)) return;
    
    const newCode = [...code];
    newCode[index] = value.slice(-1); // Берем только последний символ
    setCode(newCode);

    // Автоматически переходим к следующему полю
    if (value && index < 3 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Переход к предыдущему полю при нажатии Backspace
    if (e.key === 'Backspace' && !code[index] && index > 0 && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const fullCode = code.join('');
    if (fullCode.length !== 4) {
      setError('Введите полный код подтверждения');
      return;
    }
    
    if (!email) {
      setError('Email не найден');
      return;
    }
    
    try {
      setIsLoading(true);
      setError('');
      
      await verifyAccount(email, fullCode);
      setSuccess('Аккаунт успешно подтвержден!');
      
      // Перенаправляем на страницу входа через 2 секунды
      setTimeout(() => {
        navigate('/login', { 
          state: { message: 'Аккаунт успешно подтвержден! Теперь вы можете войти.' } 
        });
      }, 2000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка подтверждения');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResendDisabled(true);
    setTimer(60);
    
    // Таймер обратного отсчета
    const countdown = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(countdown);
          setResendDisabled(false);
          return 60;
        }
        return prev - 1;
      });
    }, 1000);
    
    try {
      // Здесь запрос на повторную отправку кода
      const response = await fetch('/api/resend-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      if (response.ok) {
        setSuccess('Код повторно отправлен на ваш email');
        // Очищаем поля ввода
        setCode(['', '', '', '']);
        if (inputRefs.current[0]) {
          inputRefs.current[0].focus();
        }
      } else {
        setError('Ошибка при повторной отправке');
      }
    } catch (err) {
      setError('Ошибка сети');
    }
  };

  // Функция для установки ref
  const setInputRef = (index: number) => (el: HTMLInputElement | null) => {
    inputRefs.current[index] = el;
  };

  if (!email) {
    return (
      <Container>
        <Title>Ошибка</Title>
        <Description>
          Email не найден. Пожалуйста, <a href="/register">завершите регистрацию</a>.
        </Description>
      </Container>
    );
  }

  return (
    <Container>
      <Title>Подтверждение</Title>
      
      <Description>
        Мы показывали Вам код
        Введите его ниже для подтверждения аккаунта
      </Description>

      <Form onSubmit={handleSubmit}>
        <CodeContainer>
          {[0, 1, 2, 3].map((index) => (
            <CodeInput
              key={index}
              ref={setInputRef(index)}
              type="text"
              maxLength={1}
              value={code[index]}
              onChange={(e) => handleCodeChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              placeholder="0"
              autoFocus={index === 0}
            />
          ))}
        </CodeContainer>

        {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && <SuccessMessage>{success}</SuccessMessage>}

        <Button type="submit" disabled={isLoading || code.join('').length !== 4}>
          {isLoading ? 'Проверка...' : 'Подтвердить'}
        </Button>
      </Form>

      <ResendButton 
        onClick={handleResendCode} 
        disabled={resendDisabled}
      >
        {resendDisabled ? `Отправить повторно через ${timer}с` : 'Отправить код повторно'}
      </ResendButton>

      {resendDisabled && (
        <Timer>
          Запросить новый код можно через {timer} секунд
        </Timer>
      )}
    </Container>
  );
};