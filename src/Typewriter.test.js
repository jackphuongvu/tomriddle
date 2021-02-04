/* eslint-disable prefer-const */
import { TypeWriter } from './Typewriter';

jest.mock('./helpers/getElements');

jest.useFakeTimers();

describe('Typewriter', () => {
  const initialXY = [100, 96];
  /** @type {TypeWriter} */
  let typewriter;

  beforeEach(() => {
    typewriter = new TypeWriter();
  });

  it('can initialize', () => {
    expect(typewriter).toBeTruthy();
  });

  it('can add characters', () => {
    const { cursor } = typewriter;
    let [x, y] = initialXY;
    const cursorWidth = 15.6;

    expect(cursor.position).toEqual({
      x,
      y,
    });

    typewriter.addCharacter('A', cursor.position.x, cursor.position.y);

    // TODO: expect moveright to have been called
    x += cursorWidth;
    expect(cursor.position).toEqual({
      x,
      y,
    });

    typewriter.addCharacter('B', cursor.position.x, cursor.position.y);
    typewriter.addCharacter('C', cursor.position.x, cursor.position.y);

    x += cursorWidth * 2;

    expect(typewriter.chars).toHaveLength(3);
    expect(cursor.position).toEqual({
      x,
      y,
    });
  });
});
