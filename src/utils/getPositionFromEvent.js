import Vector from './Vector';

const getPositionFromEvent = (e) => {
  const touch = (e.touches && e.touches[0]) || {};
  const _x = e.pageX || touch.pageX;
  const _y = e.pageY || touch.pageY;

  return new Vector(_x, _y);
};

export default getPositionFromEvent;
