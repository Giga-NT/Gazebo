import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ReactComponent as Logo } from '../assets/images/logo.svg';
import './LoginPage.css';

// Импорт изображений
import work1Image from '../assets/images/works/work1.jpg';
import work2Image from '../assets/images/works/work2.jpg';
import work3Image from '../assets/images/works/work3.jpg';
import canopyImage from '../assets/images/canopy.jpeg';
import gazeboImage from '../assets/images/gazebo.jpg';
import greenhouseImage from '../assets/images/greenhouse.jpeg';
import gipsImage from '../assets/images/gips.png';
import userIcon from '../assets/icons/user.svg';
import checkIcon from '../assets/icons/check.svg';

// Типизация данных
interface Service {
  id: number;
  title: string;
  description: string;
  image: string;
  icon: string;
}

interface PortfolioItem {
  id: number;
  title: string;
  location: string;
  image: string;
}

interface Review {
  id: number;
  name: string;
  city: string;
  text: string;
}

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [callbackForm, setCallbackForm] = useState({ name: '', phone: '', message: '' });
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'login' | 'callback'>('login');
  const [menuOpen, setMenuOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [darkMode, setDarkMode] = useState(true); // По умолчанию — тёмная тема
  
  
  // Инициализация AOS
useEffect(() => {
  const savedMode = localStorage.getItem('darkMode');
  if (savedMode !== null) {
    setDarkMode(JSON.parse(savedMode));
  }

  import('aos').then(AOS => AOS.init({ duration: 800 }));
}, []);

useEffect(() => {
  localStorage.setItem('darkMode', JSON.stringify(darkMode));
  if (darkMode) {
    document.body.classList.add('dark-mode');
    document.body.classList.remove('light-mode');
  } else {
    document.body.classList.add('light-mode');
    document.body.classList.remove('dark-mode');
  }
}, [darkMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await login(formData.email, formData.password);
      navigate('/model');
    } catch (err) {
      setError('Неверный логин или пароль');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCallbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Здесь будет запрос к вашему API
      const response = await fetch('https://ваш-сервер.ru/api/callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(callbackForm),
      });

      if (response.ok) {
        setSubmitSuccess(true);
        setCallbackForm({ name: '', phone: '', message: '' });
        setTimeout(() => {
          setSubmitSuccess(false);
          setModalOpen(false);
        }, 3000);
      } else {
        setError('Ошибка при отправке формы. Попробуйте позже.');
      }
    } catch (err) {
      setError('Ошибка сети. Проверьте соединение.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  const services: Service[] = [
    {
      id: 1,
      title: 'Навесы',
      description: 'Автомобильные, хозяйственные, уличные навесы любой сложности',
      image: canopyImage,
      icon: checkIcon,
    },
    {
      id: 2,
      title: 'Беседки',
      description: 'Металлические каркасы для беседок под любой материал',
      image: gazeboImage,
      icon: checkIcon,
    },
    {
      id: 3,
      title: 'Теплицы',
      description: 'Прочные каркасы для теплиц из проыильной трубы',
      image: greenhouseImage,
      icon: checkIcon,
    },
    {
      id: 4,
      title: 'Заборы',
      description: 'Современные ограждения с гарантией долговечности',
      image: gipsImage,
      icon: checkIcon,
    },
	
  ];

  const portfolioItems: PortfolioItem[] = [
    { id: 1, title: 'Навес для авто', location: 'Нижний Тагил', image: work1Image },
    { id: 2, title: 'Летняя беседка', location: 'Екатеринбург', image: work2Image },
    { id: 3, title: 'Промышленная теплица', location: 'Свердловская обл.', image: work3Image },
  ];

  const reviews: Review[] = [
    {
      id: 1,
      name: 'Алексей Петров',
      city: 'Нижний Тагил',
      text: 'Остались очень довольны работой! Сделали навес за 7 дней, всё аккуратно и надёжно.',
    },
    {
      id: 2,
      name: 'Марина Кузнецова',
      city: 'Екатеринбург',
      text: 'Делали каркас теплицы — теперь растём без проблем даже зимой!',
    },
    {
      id: 3,
      name: 'Иван Смирнов',
      city: 'Свердловская обл.',
      text: 'Отличный сервис, бесплатный замер и консультация. Рекомендую!',
    },
  ];

  return (
    <div className="landing-page">
      {/* Header */}
      <header className="header">
        <div className="container">
          <div className="header__inner">
            <div className="header__logo-container">
              <div className="header__logo-circle">
                <span className="header__logo-text">Giga-NT</span>
                <span className="header__logo-subtext">INNOVATE</span>
              </div>
            </div>
            <button 
              className={`header__burger ${menuOpen ? 'active' : ''}`}
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <span></span>
            </button>
            <nav className={`header__nav ${menuOpen ? 'active' : ''}`}>
              <button onClick={() => scrollToSection('hero')}>Главная</button>
              <button onClick={() => scrollToSection('services')}>Услуги</button>
              <button onClick={() => scrollToSection('portfolio')}>Наши работы</button>
              <button onClick={() => scrollToSection('reviews')}>Отзывы</button>
              <button onClick={() => scrollToSection('contacts')}>Контакты</button>
            </nav>
			<div className="header__contacts">
			  <a href="tel:+79021565256" className="header__phone">
				+7 (902) 156-52-56
			  </a>
			  <button 
				onClick={() => setModalOpen(true)}
				className="btn btn--primary"
			  >
				Личный кабинет
			  </button>
			  {/* Кнопка переключения темы */}
			  <button 
				className="theme-toggle"
				onClick={() => setDarkMode(prev => !prev)}
				aria-label="Переключить тему"
			  >
				{darkMode ? '☀️' : '🌙'}
			  </button>
			</div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="hero" className="hero" data-aos="fade-up">
        <div className="hero__image" style={{ backgroundImage: `url(${gazeboImage})` }}></div>
        <div className="container">
          <div className="hero__content">
            <h1 className="hero__title">
              Производство металлоконструкций <br />
              <span>с установкой в Нижнем Тагиле и Свердловской области</span>
            </h1>
            <p className="hero__subtitle">
              Навесы, беседки, теплицы и другие конструкции под ключ с гарантией
            </p>
            <ul className="hero__features">
              <li>✔️ Гарантия до 5 лет</li>
              <li>✔️ Бесплатный выезд специалиста</li>
              <li>✔️ Изготовление до 14 дней</li>
              <li>✔️ После регистрации — доступ к 3D-визуализатору</li>
              <li>✔️ Онлайн-калькулятор стоимости с мгновенным расчетом</li>
            </ul>

            <div className="hero__buttons">
              <button 
                onClick={() => setModalOpen(true)}
                className="btn btn--large btn--accent"
              >
                Заказать проект
              </button>
              <button 
                onClick={() => scrollToSection('portfolio')}
                className="btn btn--large btn--outline-white"
              >
                Наши работы
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="services" data-aos="fade-up">
        <div className="container">
          <h2 className="section-title">Наши услуги</h2>
          <div className="services__grid">
            {services.map(service => (
              <div key={service.id} className="service-card" data-aos="zoom-in">
                <div 
                  className="service-card__image"
                  style={{ backgroundImage: `url(${service.image})` }}
                ></div>
                <img src={service.icon} alt="icon" className="service-card__icon" />
                <h3 className="service-card__title">{service.title}</h3>
                <p className="service-card__description">{service.description}</p>
                <button 
                  onClick={() => setModalOpen(true)}
                  className="btn btn--outline"
                >
                  Заказать
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio Section */}
      <section id="portfolio" className="portfolio" data-aos="fade-up">
        <div className="container">
          <h2 className="section-title">Наши работы</h2>
          <div className="portfolio__grid">
            {portfolioItems.map(item => (
              <div key={item.id} className="portfolio-item" data-aos="zoom-in">
                <div className="portfolio-item__image-container">
                  <img 
                    src={item.image} 
                    alt={item.title}
                    className="portfolio-item__image" 
                    loading="lazy"
                  />
                </div>
                <div className="portfolio-item__overlay">
                  <h3>{item.title}</h3>
                  <p>{item.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section id="reviews" className="reviews" data-aos="fade-up">
        <div className="container">
          <h2 className="section-title">Отзывы клиентов</h2>
          <div className="reviews__grid">
            {reviews.map(review => (
              <div key={review.id} className="review-card" data-aos="flip-up">
                <img src={userIcon} alt="User" className="review-card__avatar" />
                <p className="review-card__text">"{review.text}"</p>
                <h4 className="review-card__name">{review.name}, {review.city}</h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contacts Section */}
      <section id="contacts" className="contacts" data-aos="fade-up">
        <div className="container">
          <h2 className="section-title">Контакты</h2>
          <div className="contacts__content">
            <div className="contacts__info">
              <h3 className="contacts__subtitle">ООО "Гига-НТ"</h3>
              <address>
                <p>г. Нижний Тагил, ул. Республиканская, 13</p>
                <p className="contacts__phones">
                  <a href="tel:+79021565256">+7 (902) 156-52-56</a><br />
                  <a href="tel:+73434567890">+7 (343) 456-78-90</a>
                </p>
                <p>
                  <strong>Режим работы:</strong><br />
                  Пн-Пт: 9:00 - 18:00<br />
                  Сб: 10:00 - 15:00
                </p>
              </address>
            </div>
            <div className="contacts__map">
              <iframe 
                src="https://yandex.ru/map-widget/v1/?um=constructor%3Aa44b7eafa4087751917314a42f7b161ca05c57730ae5041d02ffa8935f8b0530&amp;source=constructor" 
                width="100%" 
                height="400" 
                style={{ border: 'none' }}
                title="Карта расположения компании"
                loading="lazy"
              ></iframe>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer" data-aos="fade-up">
        <div className="container">
          <div className="footer__inner">
            <div className="footer__logo-container">
              <div className="footer__logo-circle">
                <span className="footer__logo-text">Giga-NT</span>
                <span className="footer__logo-subtext">INNOVATE</span>
              </div>
              <p className="footer__company-info">
                Производство металлоконструкций в Свердловской области
              </p>
            </div>

            <div className="footer__links">
              <h4>Меню</h4>
              <button onClick={() => scrollToSection('services')}>Услуги</button>
              <button onClick={() => scrollToSection('portfolio')}>Портфолио</button>
              <button onClick={() => scrollToSection('reviews')}>Отзывы</button>
              <button onClick={() => scrollToSection('contacts')}>Контакты</button>
            </div>

            <div className="footer__contacts">
              <h4>Контакты</h4>
              <a href="tel:+79021565256">+7 (902) 156-52-56</a>
              <a href="mailto:info@giga-nt.ru">info@giga-nt.ru</a>
            </div>
          </div>

          <div className="footer__bottom">
            <p>© ООО "Гига-НТ", {new Date().getFullYear()}</p>
          </div>
        </div>
      </footer>

      {/* Unified Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button 
              className="modal__close"
              onClick={() => {
                setModalOpen(false);
                setActiveTab('login');
                setError('');
                setSubmitSuccess(false);
              }}
            >
              &times;
            </button>

            <div className="modal__tabs">
              <button
                className={`modal__tab ${activeTab === 'login' ? 'active' : ''}`}
                onClick={() => setActiveTab('login')}
              >
                Вход
              </button>
              <button
                className={`modal__tab ${activeTab === 'callback' ? 'active' : ''}`}
                onClick={() => setActiveTab('callback')}
              >
                Обратный звонок
              </button>
            </div>

            {submitSuccess ? (
              <div className="modal__success">
                <h3 className="modal__title">Спасибо!</h3>
                <p>Мы скоро с вами свяжемся.</p>
              </div>
            ) : (
              <>
                {activeTab === 'login' ? (
                  <>
                    <h3 className="modal__title">Вход в личный кабинет</h3>
                    {error && <p className="modal__error">{error}</p>}
                    <form onSubmit={handleSubmit} className="modal__form">
                      <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                          id="email"
                          type="email"
                          placeholder="Ваш email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="password">Пароль</label>
                        <input
                          id="password"
                          type="password"
                          placeholder="Ваш пароль"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          required
                        />
                      </div>
                      <button 
                        type="submit" 
                        className="btn btn--primary btn--block"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Вход...' : 'Войти'}
                      </button>
                    </form>
                    <div className="modal__links">
                      <a href="/register" className="modal__link">Регистрация</a>
                      <a href="/forgot-password" className="modal__link">Забыли пароль?</a>
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="modal__title">Заказать обратный звонок</h3>
                    {error && <p className="modal__error">{error}</p>}
                    <form onSubmit={handleCallbackSubmit} className="modal__form">
                      <div className="form-group">
                        <label htmlFor="name">Ваше имя</label>
                        <input
                          id="name"
                          type="text"
                          placeholder="Как к вам обращаться?"
                          value={callbackForm.name}
                          onChange={(e) => setCallbackForm({ ...callbackForm, name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="phone">Телефон</label>
                        <input
                          id="phone"
                          type="tel"
                          placeholder="+7 (___) ___-__-__"
                          value={callbackForm.phone}
                          onChange={(e) => setCallbackForm({ ...callbackForm, phone: e.target.value })}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="message">Комментарий (необязательно)</label>
                        <textarea
                          id="message"
                          placeholder="Опишите ваш вопрос или проект"
                          value={callbackForm.message}
                          onChange={(e) => setCallbackForm({ ...callbackForm, message: e.target.value })}
                          rows={3}
                        />
                      </div>
                      <button 
                        type="submit" 
                        className="btn btn--primary btn--block"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Отправка...' : 'Заказать звонок'}
                      </button>
                    </form>
                    <p className="modal__note">
                      Наш менеджер свяжется с вами в течение 15 минут
                    </p>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};