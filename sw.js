/* ============================================================
   ASESORIA-HACIENDA-FLANDES · SERVICE WORKER (modo fresco)
   Solo el armazón (HTML, CSS, JS, íconos). NUNCA datos: ni Apps Script
   ni Firebase pasan por aquí.

   Lo publicado se ve en la PRIMERA apertura:
     · en cada navegación se pregunta version.js a la RED; si el número
       publicado no es el de este service worker, esa apertura entera sale
       de la red (cache:'reload') y no se mezcla nada viejo;
     · si coincide, el armazón sale de la caché de ESTA versión.
     · La instalación baja cada archivo con ?v=<versión> y cache:'reload'
       (nunca de la caché HTTP del navegador).
     · version.js nunca se guarda.
   Prefijo 'asehac-v': todas las apps comparten origen
   (botheart911.github.io); solo se borran las cachés de esta.
   ============================================================ */
importScripts('./version.js');

var CACHE_NAME = 'asehac-v' + APP_VERSION;
var RUTA_VERSION = new URL('./version.js', self.location.href).pathname;
var BASE = new URL('./', self.location.href).pathname;
var APP_SHELL = [
  './', './index.html', './css/web.css', './js/marca.js', './js/barrios.js', './js/web.js', './manifest.webmanifest',
  './img/icono-32.png', './img/icono-180.png', './img/icono-192.png', './img/icono-512.png', './img/icono-maskable-512.png'
];
var ESPERA_VERSION_MS = 3000;
var FRESCOS = {};   /* clientId → true: esa apertura trae versión nueva; su armazón sale de la red */

function versionDeLaRed_() {
  return new Promise(function (listo) {
    var t = setTimeout(function () { listo(''); }, ESPERA_VERSION_MS);
    fetch(RUTA_VERSION + '?sw=' + Date.now(), { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.text() : ''; })
      .then(function (txt) { clearTimeout(t); var m = /APP_VERSION\s*=\s*["']([^"']+)["']/.exec(String(txt || '')); listo(m ? m[1].trim() : ''); })
      .catch(function () { clearTimeout(t); listo(''); });
  });
}
function conV_(u, v) { return u + (String(u).indexOf('?') === -1 ? '?' : '&') + 'v=' + encodeURIComponent(v); }
function deMiCache_(req) { return caches.open(CACHE_NAME).then(function (c) { return c.match(req); }); }
function guardar_(req, res) {
  if (!res || !res.ok || res.type === 'opaque') return;
  var copia = res.clone();
  caches.open(CACHE_NAME).then(function (c) { return c.put(req, copia); }).catch(function () {});
}

self.addEventListener('install', function (event) {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then(function (cache) {
    return Promise.all(APP_SHELL.map(function (u) {
      return fetch(new Request(conV_(u, APP_VERSION), { cache: 'reload' }))
        .then(function (res) { if (res && res.ok) return cache.put(u, res); })
        .catch(function () {});
    }));
  }));
});

self.addEventListener('activate', function (event) {
  event.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k.indexOf('asehac-') === 0 && k !== CACHE_NAME; })
      .map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener('fetch', function (event) {
  var req = event.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== location.origin || url.pathname.indexOf(BASE) !== 0) return;   /* Apps Script, Firebase, fuentes: no se tocan */

  if (url.pathname === RUTA_VERSION) {
    event.respondWith(fetch(req, { cache: 'no-store' }).catch(function () { return new Response('var APP_VERSION = "' + APP_VERSION + '";', { headers: { 'Content-Type': 'text/javascript' } }); }));
    return;
  }

  if (req.mode === 'navigate') {
    event.respondWith(versionDeLaRed_().then(function (red) {
      var fresca = !!red && red !== String(APP_VERSION);
      if (event.resultingClientId) FRESCOS[event.resultingClientId] = fresca;
      return fetch(req, { cache: fresca ? 'reload' : 'no-cache' })
        .then(function (res) { if (!fresca) guardar_(new Request('./index.html'), res); return res; })
        .catch(function () { return deMiCache_('./index.html').then(function (h) { return h || deMiCache_('./'); }); });
    }));
    return;
  }

  /* armazón: de la caché de ESTA versión; si falta, de la red revalidada */
  if (FRESCOS[event.clientId]) { event.respondWith(fetch(req, { cache: 'reload' })); return; }
  event.respondWith(deMiCache_(url.origin + url.pathname).then(function (hit) {
    return hit || fetch(req, { cache: 'no-cache' });
  }).catch(function () { return fetch(req); }));
});
