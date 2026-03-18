/* eslint-disable no-restricted-globals */
import { precacheAndRoute } from 'workbox-precaching';

// Это единственная обязательная строка для базовой работы
precacheAndRoute(self.__WB_MANIFEST);