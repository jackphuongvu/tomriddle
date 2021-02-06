/**
 *
 * Inspired by a girl, Ms. Jayme Bergman
 *
 */
import App from './App';
import './tracking/analytics';
import './tracking/sentry';

const app = new App();

const startApp = (e) => {
  // wait for splash transition
  const splash = document.getElementById('splash');

  if (e.altKey || e.ctrlKey || e.metaKey) {
    // user might be trying to do something else
    return;
  }

  splash.classList.add('hide');

  document.body.removeEventListener('click', startApp);
  document.body.removeEventListener('keydown', startApp);

  app.start();

  // should be able to focus on ios so long as this
  // is called from within a click handler
  app.focus();
};

const onload = () => {
  if (window.location.hash) {
    window.location.hash = '';
  }

  document.body.addEventListener('click', startApp);
  document.body.addEventListener('keydown', startApp);

  window.removeEventListener('load', onload);
};

/**
 * basic app handlers
 */
window.addEventListener('load', onload);

// Register service worker to control making site work offline

if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/sw.js')
    .then(() => {
      // eslint-disable-next-line no-console
      console.log('Service Worker Registered');
    })
    .catch((e) => {
      // eslint-disable-next-line no-console
      console.error('Service Worker failed');
      // eslint-disable-next-line no-console
      console.error(e);
    });
}
