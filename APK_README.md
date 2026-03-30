# 📱 Giga Конструктор - Android APK

## ✅ Всё готово для сборки APK!

---

## 🚀 Быстрая сборка (через Android Studio)

### 1. Откройте Android Studio
```bash
npx cap open android
```

### 2. Дождитесь синхронизации Gradle
(прогресс бар внизу справа)

### 3. Соберите APK
- Меню: **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
- Или: **Ctrl+Shift+A** → введите "Build APK"

### 4. Найдите APK файл
- Путь: `android\app\build\outputs\apk\debug\app-debug.apk`
- После сборки нажмите **locate** в уведомлении

### 5. Установите на телефон
- Скопируйте APK на телефон
- Откройте файл
- Разрешите установку из неизвестных источников
- Готово! 🎉

---

## 📝 Параметры приложения

- **Название:** Giga Конструктор
- **Package:** com.giga.frameconstructor
- **Версия:** 1.0.0
- **Мин. Android:** 7.0 (API 24)

---

## 🔧 Если нужны изменения

### Изменить название
Откройте: `android\app\src\main\res\values\strings.xml`

### Изменить иконку
1. Android Studio: **File** → **New** → **Image Asset**
2. Или замените файлы в: `android\app\src\main\res\mipmap-*/`

### Изменить версию
Откройте: `android\app\build.gradle`
```gradle
versionCode 1
versionName "1.0"
```

---

## 📦 Release APK (для публикации)

1. **Build** → **Generate Signed Bundle / APK**
2. Выберите **APK**
3. Создайте новый ключ (keystore)
4. Выберите **release** сборку
5. Подпишите и получите готовый APK

---

## 🐛 Решение проблем

### Ошибка: SDK not found
Установите Android Studio: https://developer.android.com/studio

### Ошибка: Gradle build failed
- Android Studio: **File** → **Invalidate Caches / Restart**

### Приложение вылетает
- Проверьте логи в Android Studio (**Logcat**)
- Убедитесь что сделан `npm run build`
- Запустите `npx cap sync android`

---

## 📞 Контакты

Вопросы? Создайте issue в репозитории.
