const { generateSW } = require('workbox-build');

generateSW({
  globDirectory: 'build',
  globPatterns: [
    '**/*.{html,js,css,png,ico,svg,jpg,jpeg,json,woff,woff2}'
  ],
  swDest: 'build/service-worker.js',
  maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
}).then(({ count, size }) => {
  console.log(`✅ Service Worker создан! Кэшировано ${count} файлов, общий размер ${size} байт`);
}).catch(console.error);