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

  it('can export characters', () => {
    typewriter.addCharacter('A');
    typewriter.addCharacter('B');

    const output = typewriter.export();

    expect(typeof output).toBe('string');
    expect(JSON.parse(output)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          s: 'A',
          x: expect.any(Number),
          y: expect.any(Number),
        }),
        expect.objectContaining({
          s: 'B',
          x: expect.any(Number),
          y: expect.any(Number),
        }),
      ])
    );
  });

  it('can load characters', () => {
    const characters = [
      {
        s: 'A',
        x: 0,
        y: 0,
      },
      {
        s: 'B',
        x: 10,
        y: 0,
      },
    ];
    typewriter.import(JSON.stringify(characters));

    expect(typewriter.chars).toHaveLength(characters.length);
    // last character position
    expect(typewriter.cursor.position).toEqual({
      x: 10,
      y: 0,
    });
  });
});
