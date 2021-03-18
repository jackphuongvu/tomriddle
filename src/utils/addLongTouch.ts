/**
 * Add mobile equivalent for contextmenu event.
 * User touches element for a given length of time
 */
const addLongTouch = (
  elem: HTMLElement,
  callback: (event: TouchEvent) => void,
  delay = 600
): (() => void) => {
  let timeout: number;

  const clear = () => {
    window.clearTimeout(timeout);
    timeout = 0;
  };

  const onTouchStart = (e: TouchEvent) => {
    if (e.touches.length === 1) {
      timeout = window.setTimeout(() => callback(e), delay);
    } else if (timeout) {
      // clear on multiple touches
      clear();
    }
  };

  elem.addEventListener('touchstart', onTouchStart);
  elem.addEventListener('touchmove', clear);
  elem.addEventListener('touchend', clear);

  return () => {
    elem.removeEventListener('touchstart', onTouchStart);
    elem.removeEventListener('touchmove', clear);
    elem.removeEventListener('touchend', clear);
  };
};

export default addLongTouch;
