import { TypeWriter } from './Typewriter';

jest.mock('./helpers/getElements');

jest.useFakeTimers();

describe('Typewriter', () => {
  const initialXY = [100, 96];
  let typewriter: TypeWriter;

  beforeEach(() => {
    typewriter = new TypeWriter();
  });

  it('can initialize', () => {
    expect(typewriter).toBeTruthy();
  });

  it('can add characters', () => {
    const { cursor } = typewriter;
    // eslint-disable-next-line prefer-const
    let [x, y] = initialXY;
    const cursorWidth = 15.6;

    expect(cursor.position).toEqual({
      x,
      y,
    });

    typewriter.addCharacter('A');

    // TODO: expect moveright to have been called
    x += cursorWidth;
    expect(cursor.position).toEqual({
      x,
      y,
    });

    typewriter.addCharacter('B');
    typewriter.addCharacter('C');

    x += cursorWidth * 2;

    expect(typewriter.chars).toHaveLength(3);
    expect(cursor.position).toEqual({
      x,
      y,
    });
  });
});
