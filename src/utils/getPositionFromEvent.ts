import Vector from './Vector';

const getPositionFromEvent = (e: TouchEvent | MouseEvent): Vector => {
  if ('touches' in e) {
    const touch = e.type === 'touchend' ? e.changedTouches[0] : e.touches[0];

    return new Vector(touch.pageX, touch.pageY);
  }

  return new Vector(e.pageX, e.pageY);
};

export default getPositionFromEvent;
