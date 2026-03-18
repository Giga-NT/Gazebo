const { injectManifest } = require('workbox-build');

injectManifest({
  swSrc: './src/service-worker.js',
  swDest: './build/service-worker.js',
  globDirectory: './build',
  maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
}).then(({ count, size }) => {
  console.log(`✅ Service Worker создан! Кэшировано ${count} файлов, общий размер ${size} байт`);
}).catch((err) => {
  console.error('❌ Ошибка при создании Service Worker:', err);
});