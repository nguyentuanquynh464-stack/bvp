const fs = require('fs');

// Write manifest.json
fs.writeFileSync('dist/manifest.json', JSON.stringify({
  name: "BVP Solver",
  short_name: "BVPSolver",
  description: "Boundary Value Problem Solver",
  start_url: "/",
  display: "standalone",
  background_color: "#ffffff",
  theme_color: "#003DA5",
  orientation: "portrait",
  icons: [
    { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any maskable" },
    { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" }
  ]
}, null, 2));

// Patch index.html with PWA tags
let html = fs.readFileSync('dist/index.html', 'utf8');
if (!html.includes('manifest.json')) {
  html = html.replace(
    '<link rel="icon" href="/favicon.ico" />',
    `<meta name="theme-color" content="#003DA5">
  <link rel="manifest" href="/manifest.json" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="default" />
  <meta name="apple-mobile-web-app-title" content="BVPSolver" />
  <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
  <link rel="icon" href="/favicon.ico" />`
  );
  fs.writeFileSync('dist/index.html', html);
}
console.log('PWA patch applied!');
