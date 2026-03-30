# Как собрать APK файл

## Вариант 1: Через Android Studio (рекомендуется)

1. **Откройте Android Studio:**
   ```bash
   npx cap open android
   ```

2. **Дождитесь синхронизации Gradle** (внизу будет прогресс бар)

3. **Соберите APK:**
   - В меню: `Build` → `Build Bundle(s) / APK(s)` → `Build APK(s)`
   - Или нажмите `Ctrl+Shift+A`, введите "Build APK"

4. **Найдите APK файл:**
   - После сборки появится уведомление
   - Нажмите `locate` чтобы открыть папку
   - Путь: `android\app\build\outputs\apk\debug\app-debug.apk`

5. **Установите на телефон:**
   - Скопируйте APK на телефон
   - Откройте и установите (разрешите установку из неизвестных источников)

---

## Вариант 2: Через командную строку (если установлен Android SDK)

```bash
cd android
gradlew assembleDebug
```

APK будет в: `android\app\build\outputs\apk\debug\app-debug.apk`

---

## Вариант 3: Release APK (для публикации)

1. В Android Studio: `Build` → `Generate Signed Bundle / APK`
2. Выберите `APK`
3. Создайте новый ключ (keystore) или используйте существующий
4. Выберите `release` сборку
5. Подпишите APK

---

## Настройки приложения

- **Название:** Giga Конструктор
- **Package ID:** com.giga.frameconstructor
- **Версия:** 1.0.0

---

## Иконки

Для замены иконки приложения:
1. Положите файлы иконок в `android\app\src\main\res\`
2. Или используйте Android Studio: `File` → `New` → `Image Asset`

---

## Отладка на устройстве

1. Включите **USB Debugging** на телефоне:
   - Настройки → О телефоне → 7 раз нажмите "Номер сборки"
   - Настройки → Для разработчиков → Отладка по USB

2. Подключите телефон к ПК

3. В Android Studio: `Run` → `Run 'app'` или нажмите Shift+F10

---

## Решение проблем

### Ошибка: SDK not found
Установите Android Studio: https://developer.android.com/studio

### Ошибка: Gradle build failed
- Откройте Android Studio
- `File` → `Invalidate Caches / Restart`

### Приложение вылетает
- Проверьте логи в Android Studio (`Logcat`)
- Убедитесь что `webDir: 'build'` в capacitor.config.ts
- Запустите `npm run build` перед `cap sync`
