/**
 *
 * Inspired by a girl, Ms. Jayme Bergman
 *
 */
import DOMEvent from './utils/DOMEvent';
import App from './App';
import './tracking/analytics';
import './tracking/sentry';

const splashAnimTime = 1500;

/**
 * basic app handlers
 */
DOMEvent.on(window, 'load', () => {
  if (window.location.hash) {
    window.location.hash = '';
  }

  // wait for splash transition
  setTimeout(App.start.bind(App), splashAnimTime);
});
