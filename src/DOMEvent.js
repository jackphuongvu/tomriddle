const stampKey = 'tws_stamp';
const eventsKey = 'tws_event';

const stamp = (function getStamp() {
  let i = 0;
  return function _stamp(obj) {
    if (!obj[stampKey]) {
      i += 1;
      // eslint-disable-next-line no-param-reassign
      obj[stampKey] = i;
    }
    return obj[stampKey];
  };
})();

/**
 * Inspired by LeafletJS
 */
function DOMEvent() {
  this.getId = function getId(_obj, type, fn, context) {
    return type + stamp(fn) + (context ? `_${stamp(context)}` : '');
  };

  this.on = function on(obj, type, fn, context) {
    const id = this.getId(obj, type, fn, context);
    const handler = function handler(e) {
      return fn.call(context || obj, e || window.event);
    };

    if (!obj) return;

    if ('addEventListener' in obj) {
      obj.addEventListener(type, handler);
    } else if ('attachEvent' in obj) {
      obj.attachEvent(`on${type}`, handler);
    }

    // eslint-disable-next-line no-param-reassign
    obj[eventsKey] = obj[eventsKey] || {};
    // eslint-disable-next-line no-param-reassign
    obj[eventsKey][id] = handler;
  };

  this.off = function off(obj, type, fn, context) {
    const id = this.getId.apply(this, [obj, type, fn, context]);
    const handler = obj[eventsKey] && obj[eventsKey][id];

    if (!obj) return;

    if ('removeEventListener' in obj) {
      obj.removeEventListener(type, handler);
    } else if ('detachEvent' in obj) {
      obj.detachEvent(`on${type}`, handler);
    }

    // eslint-disable-next-line no-param-reassign
    obj[eventsKey][id] = null;
  };
}

export default new DOMEvent();
