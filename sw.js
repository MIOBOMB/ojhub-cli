self.addEventListener('push', e => {
  const data = e.data ? e.data.json() : {};
  const title = data.title || 'Object Hub';
  const options = {
    body: data.body || '',
    icon: data.icon || '/imgs/icon-192.png',
    badge: '/imgs/badge.png',
    data: { url: data.url || '/' }
  };
  e.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.openWindow(e.notification.data.url));
});
