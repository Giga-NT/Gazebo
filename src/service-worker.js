/* eslint-disable no-restricted-globals */
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';

// Предварительное кэширование всех ресурсов сборки
precacheAndRoute(self.__WB_MANIFEST);

// Очистка старых кэшей
cleanupOutdatedCaches();

// Базовая обработка установки и активации
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});