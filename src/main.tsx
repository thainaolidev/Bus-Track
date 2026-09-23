import { createRoot } from 'react-dom/client';
import App from './App';
import { PreferencesProvider } from './preferences/PreferencesContext';
import { TransportProvider } from './services/TransportContext';
import { IncidentProvider } from './services/IncidentContext';
import 'leaflet/dist/leaflet.css';
import './style.css';
import './map.css';

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  let refreshing = false;
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      const announceUpdate = () => {
        if (registration.waiting && navigator.serviceWorker.controller) window.dispatchEvent(new Event('bus-track-update-ready'));
      };
      announceUpdate();
      registration.addEventListener('updatefound', () => {
        registration.installing?.addEventListener('statechange', event => {
          if ((event.target as ServiceWorker).state === 'installed') announceUpdate();
        });
      });
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') void registration.update();
      });
      window.setInterval(() => void registration.update(), 60 * 60 * 1000);
      window.addEventListener('bus-track-apply-update', () => registration.waiting?.postMessage({ type: 'SKIP_WAITING' }));
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (refreshing) return;
        refreshing = true;
        window.location.reload();
      });
    } catch (error) {
      console.error('Não foi possível registar a aplicação offline.', error);
    }
  });
}

createRoot(document.getElementById('root')!).render(<IncidentProvider><TransportProvider><PreferencesProvider><App /></PreferencesProvider></TransportProvider></IncidentProvider>);
