// El nombre de nuestra caché. Es buena idea incluir una versión.
// Si en el futuro haces cambios grandes en los archivos, puedes cambiar a 'v2'
// para forzar una actualización de la caché en los dispositivos de los usuarios.
const CACHE_NAME = 'palacio-de-la-memoria-cache-v1';

// Lista de los archivos que queremos guardar en la caché la primera vez que el usuario visita la página.
// Esto asegura que la "cáscara" de la aplicación siempre esté disponible, incluso sin conexión.
const urlsToCache = [
  '/',
  '/manifest.json',
  '/images/icons/icon-192x192.png',
  '/images/icons/icon-512x512.png'
  // NOTA: Si tu aplicación principal en Cloud Run carga archivos CSS o JS específicos
  // que son esenciales, deberías añadirlos a esta lista.
  // Ejemplo: '/css/estilo-principal.css', '/js/app-principal.js'
];

// Evento 'install': Se ejecuta cuando el service worker se instala por primera vez.
self.addEventListener('install', event => {
  console.log('Service Worker: Instalando...');
  // waitUntil espera a que la promesa que le pasamos se resuelva antes de dar por terminada la instalación.
  event.waitUntil(
    // Abrimos la caché con el nombre que definimos.
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Guardando archivos en caché');
        // Agregamos todos los archivos de nuestra lista a la caché.
        return cache.addAll(urlsToCache);
      })
  );
});

// Evento 'fetch': Se ejecuta cada vez que la página hace una petición a la red
// (pedir una imagen, un script, datos de una API, etc.).
self.addEventListener('fetch', event => {
  // respondWith nos permite interceptar la petición y responder con lo que queramos.
  event.respondWith(
    // Buscamos si la petición ya existe en nuestra caché.
    caches.match(event.request)
      .then(response => {
        // Si encontramos una respuesta en la caché...
        if (response) {
          // ...la devolvemos directamente, sin ir a la red. ¡Esto es lo que hace que funcione sin conexión!
          console.log('Service Worker: Sirviendo desde caché:', event.request.url);
          return response;
        }

        // Si no encontramos la respuesta en la caché...
        console.log('Service Worker: Yendo a la red por:', event.request.url);
        // ...hacemos la petición a la red de forma normal.
        return fetch(event.request);
      })
  );
});

// Evento 'activate': Se ejecuta cuando un nuevo service worker se activa.
// Es el lugar perfecto para limpiar cachés viejas.
self.addEventListener('activate', event => {
  console.log('Service Worker: Activando...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          // Si una caché no es la que estamos usando actualmente, la borramos.
          if (cache !== CACHE_NAME) {
            console.log('Service Worker: Limpiando caché vieja:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
});