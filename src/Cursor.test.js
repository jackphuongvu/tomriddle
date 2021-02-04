import { Cursor } from './Cursor';

jest.mock('./helpers/getElements');

jest.useFakeTimers();

describe('Cursor', () => {
  const cursorWidth = 15.6;
  const cursorHeight = 28;
  const initialXY = [100, 96];
  /** @type {Cursor} */
  let cursor;

  beforeEach(() => {
    cursor = new Cursor();
  });

  it('has a default position', () => {
    const [x, y] = initialXY;

    expect(cursor.position).toEqual({
      x,
      y,
    });
  });

  it('moves right by the cursor width', () => {
    cursor.moveright();
    const [x, y] = initialXY;
    expect(cursor.position).toEqual({
      x: x + cursorWidth,
      y,
    });
  });

  it('moves left by the cursor width', () => {
    cursor.moveleft();
    const [x, y] = initialXY;
    expect(cursor.position).toEqual({
      x: x - cursorWidth,
      y,
    });
  });

  it('moves up by the cursor height', () => {
    cursor.moveup();
    const [x, y] = initialXY;
    expect(cursor.position).toEqual({
      x,
      y: y - cursorHeight,
    });
  });

  it('moves down by the cursor height', () => {
    cursor.movedown();
    const [x, y] = initialXY;
    expect(cursor.position).toEqual({
      x,
      y: y + cursorHeight,
    });
  });
});
