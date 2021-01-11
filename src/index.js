/**
 *
 * Inspired by a girl, Ms. Jayme Bergman
 *
 */
import DOMEvent from './DOMEvent';
import App from './App';
import './analytics';
import './sentry';

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
