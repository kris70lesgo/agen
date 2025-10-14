// Placeholder service worker file to satisfy libraries expecting /mockServiceWorker.js.
// Update or replace with a real worker as needed.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));
