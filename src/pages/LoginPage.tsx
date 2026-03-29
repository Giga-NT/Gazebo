import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { DemoScene } from '../components/DemoScene/DemoScene';  // ← исправлено
import './LoginPage.css';

// Импорт логотипа
import logoImage from '../assets/images/logo.svg';

interface LoginForm {
  email: string;
  password: string;
  rememberMe: boolean;
}

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState<LoginForm>({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (err) {
      setError('Неверный email или пароль. Проверьте данные и попробуйте снова.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  return (
    <div className="login-page">
      {/* Header */}
      <header className="login-header">
        <div className="container">
          <div className="login-header__inner">
            <div className="login-header__logo">
              <img src={logoImage} alt="Giga-NT" className="login-header__logo-image" />
              <div className="login-header__logo-text">
                <span className="login-header__company">Giga-NT</span>
                <span className="login-header__tagline">Конструктор металлоконструкций</span>
              </div>
            </div>
            <div className="login-header__contact">
              <a href="tel:+79021565256" className="login-header__phone">
                +7 (902) 156-52-56
              </a>
              <a href="mailto:info@giga-nt.ru" className="login-header__email">
                info@giga-nt.ru
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="login-main">
        <div className="container">
          <div className="login-content">
            {/* Login Form Card */}
            <div className="login-card">
              <div className="login-card__header">
                <h1 className="login-card__title">Вход в личный кабинет</h1>
                <p className="login-card__subtitle">
                  Введите данные для доступа к конфигуратору
                </p>
              </div>

              {error && (
                <div className="login-card__error" role="alert">
                  <span className="login-card__error-icon">⚠️</span>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="login-card__form">
                <div className="form-group">
                  <label htmlFor="email" className="form-label">
                    Email
                    <span className="form-label__required">*</span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    className="form-input"
                    placeholder="name@company.ru"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    autoComplete="email"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="password" className="form-label">
                    Пароль
                    <span className="form-label__required">*</span>
                  </label>
                  <div className="password-input-wrapper">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      className="form-input"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      autoComplete="current-password"
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                    >
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>

                <div className="form-group form-group--inline">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="rememberMe"
                      checked={formData.rememberMe}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                    />
                    <span className="checkbox-text">Запомнить меня</span>
                  </label>
                  <Link to="/forgot-password" className="forgot-password-link">
                    Забыли пароль?
                  </Link>
                </div>

                <button
                  type="submit"
                  className="btn btn--primary btn--full-width"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="btn-loading">
                      <span className="spinner"></span>
                      Вход...
                    </span>
                  ) : (
                    'Войти'
                  )}
                </button>
              </form>

              <div className="login-card__footer">
                <p className="login-card__text">
                  Нет аккаунта?{' '}
                  <Link to="/register" className="login-link">
                    Зарегистрироваться
                  </Link>
                </p>
              </div>

              <div className="login-card__divider">
                <span>или</span>
              </div>

              <div className="login-card__benefits">
                <p className="login-card__benefits-title">
                  После регистрации вы получите:
                </p>
                <ul className="benefits-list">
                  <li className="benefits-list__item">
                    <span className="benefits-list__icon">✓</span>
                    Доступ к 3D-конфигуратору
                  </li>
                  <li className="benefits-list__item">
                    <span className="benefits-list__icon">✓</span>
                    Расчёт стоимости онлайн
                  </li>
                  <li className="benefits-list__item">
                    <span className="benefits-list__icon">✓</span>
                    Сохранение неограниченного числа проектов
                  </li>
                </ul>
              </div>
            </div>

            {/* 3D Demo Scene */}
            <div className="demo-panel">
              <DemoScene />
              <div className="demo-panel__content">
                <h2 className="demo-panel__title">
                  Создавайте проекты любой сложности
                </h2>
                <p className="demo-panel__subtitle">
                  Наш конфигуратор позволяет визуализировать и рассчитать стоимость навесов, беседок и теплиц в реальном времени
                </p>
                <div className="demo-panel__features">
                  <div className="demo-feature">
                    <span className="demo-feature__icon">📐</span>
                    <span>Точные размеры</span>
                  </div>
                  <div className="demo-feature">
                    <span className="demo-feature__icon">💰</span>
                    <span>Расчёт стоимости</span>
                  </div>
                  <div className="demo-feature">
                    <span className="demo-feature__icon">🎨</span>
                    <span>Выбор материалов</span>
                  </div>
                  <div className="demo-feature">
                    <span className="demo-feature__icon">📄</span>
                    <span>Экспорт в PDF</span>
                  </div>
                </div>
                <div className="demo-panel__cta">
                  <Link to="/register" className="btn btn--primary">
                    Попробовать конфигуратор
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="login-footer">
        <div className="container">
          <div className="login-footer__inner">
            <div className="login-footer__info">
              <p className="login-footer__company">ООО "Гига-НТ"</p>
              <p className="login-footer__address">
                г. Нижний Тагил, ул. Республиканская, 13
              </p>
            </div>
            <div className="login-footer__links">
              <a href="/privacy" className="login-footer__link">
                Политика конфиденциальности
              </a>
              <a href="/terms" className="login-footer__link">
                Условия использования
              </a>
            </div>
            <div className="login-footer__copyright">
              © {new Date().getFullYear()} Giga-NT. Все права защищены.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
