import Vector from './Vector';

/* eslint-disable no-param-reassign */
const positionElem = (
  elem: HTMLElement,
  { x, y }: Pick<Vector, 'x' | 'y'>
): void => {
  // avoid Cumulative Layout Shift: https://web.dev/cls/
  elem.style.transform = `translate(${x}px, ${y}px)`;
};

export default positionElem;
