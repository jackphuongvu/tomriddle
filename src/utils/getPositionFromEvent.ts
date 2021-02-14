import Vector from './Vector';

const getPositionFromEvent = (e: TouchEvent | MouseEvent): Vector => {
  if ('touches' in e) {
    const touch = e.touches[0] || {};

    return new Vector(touch.pageX, touch.pageY);
  }

  return new Vector(e.pageX, e.pageY);
};

export default getPositionFromEvent;
