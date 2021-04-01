/**
 *
 * Inspired by a girl, Ms. Jayme Bergman
 *
 */
import App from './App';
import isDebugMode from './helpers/isDebugMode';
import './tracking/analytics';
import './tracking/sentry';

const splash = document.getElementById('splash')!;

const startApp = (e: KeyboardEvent | MouseEvent | TouchEvent): void => {
  if (e.altKey || e.ctrlKey || e.metaKey) {
    // user might be trying to do something else
    return;
  }

  splash.classList.add('hide');

  splash.removeEventListener('click', startApp);
  splash.removeEventListener('keydown', startApp);

  const app = new App();

  app.start();

  // should be able to focus on ios so long as this
  // is called from within a click handler
  app.focusText();
};

const onload = (): void => {
  if (window.location.hash) {
    window.location.hash = '';
  }

  splash.addEventListener('click', startApp);
  splash.addEventListener('keydown', startApp);

  window.removeEventListener('load', onload);
};

/**
 * basic app handlers
 */
window.addEventListener('load', onload);

// Register service worker to control making site work offline
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  navigator.serviceWorker
    .register('/sw.js')
    .then((reg) => {
      if (reg.installing) {
        // eslint-disable-next-line no-console
        console.log('Service worker installing');
      } else if (reg.waiting) {
        // eslint-disable-next-line no-console
        console.log('Service worker installed');
      } else if (reg.active) {
        // eslint-disable-next-line no-console
        console.log('Service worker active');
      }
    })
    .catch((e): void => {
      // eslint-disable-next-line no-console
      console.error('Service Worker failed');
      // eslint-disable-next-line no-console
      console.error(e);
    });
}

if (isDebugMode()) {
  document.body.classList.add('debug');
}
