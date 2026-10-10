// Post-process the Expo web export (dist/) so it works as an iPhone home-screen app on GitHub Pages.
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const dist = path.join(root, 'dist');
const base = '/Sales-Settu-Mobile-App';

// 1. GitHub Pages: disable Jekyll so the "_expo" folder is served
fs.writeFileSync(path.join(dist, '.nojekyll'), '');

// 2. Home-screen icon + web manifest
fs.copyFileSync(path.join(root, 'assets', 'icon.png'), path.join(dist, 'apple-touch-icon.png'));
fs.copyFileSync(path.join(root, 'assets', 'icon.png'), path.join(dist, 'icon-512.png'));
fs.writeFileSync(path.join(dist, 'manifest.json'), JSON.stringify({
  name: 'SalesSetu', short_name: 'SalesSetu', start_url: base + '/', scope: base + '/', display: 'standalone',
  orientation: 'portrait', background_color: '#F4F5FB', theme_color: '#5B4CF0',
  icons: [{ src: base + '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }],
}, null, 2));

// 3. iOS meta tags (full-screen when opened from the home screen)
const file = path.join(dist, 'index.html');
let html = fs.readFileSync(file, 'utf8');
html = html.replace('width=device-width, initial-scale=1, shrink-to-fit=no', 'width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover');
const tags = [
  '<meta name="apple-mobile-web-app-capable" content="yes">',
  '<meta name="mobile-web-app-capable" content="yes">',
  '<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">',
  '<meta name="apple-mobile-web-app-title" content="SalesSetu">',
  `<link rel="apple-touch-icon" href="${base}/apple-touch-icon.png">`,
  `<link rel="manifest" href="${base}/manifest.json">`,
  '<style>body{background:#F4F5FB;-webkit-tap-highlight-color:transparent}</style>',
].join('\n  ');
if (!html.includes('apple-mobile-web-app-capable')) html = html.replace('</head>', '  ' + tags + '\n</head>');
fs.writeFileSync(file, html);
console.log('web post-processing done');
