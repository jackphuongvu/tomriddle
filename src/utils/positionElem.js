/* eslint-disable no-param-reassign */
const positionElem = (elem, { x, y }) => {
  // avoid Cumulative Layout Shift: https://web.dev/cls/
  elem.style.transform = `translate(${x}px, ${y}px)`;
};

export default positionElem;
