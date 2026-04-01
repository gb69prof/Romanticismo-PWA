
(() => {
  const showUpdate = (registration) => {
    const banner = document.getElementById('updateBanner');
    const reloadBtn = document.getElementById('reloadAppBtn');
    const dismissBtn = document.getElementById('dismissUpdateBtn');
    if (!banner || !registration?.waiting) return;
    banner.classList.add('show');
    reloadBtn?.addEventListener('click', () => {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }, { once:true });
    dismissBtn?.addEventListener('click', () => banner.classList.remove('show'), { once:true });
  };

  if (!('serviceWorker' in navigator)) return;

  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('./service-worker.js');
      if (registration.waiting) showUpdate(registration);

      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (!newWorker) return;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            showUpdate(registration);
          }
        });
      });

      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (window.__swReloading) return;
        window.__swReloading = true;
        window.location.reload();
      });
    } catch (err) {
      console.warn('PWA registration skipped:', err);
    }
  });
})();
