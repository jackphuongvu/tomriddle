import { Character } from './Character';
import Vector from './utils/Vector';

jest.mock('./helpers/getElements');

jest.useFakeTimers();

describe('Character', () => {
  const mockTypewriter = {
    canvasOffset: new Vector(0, 0),
  };

  it('has a position, but is not exact', () => {
    const x = 100;
    const y = 100;
    const char = new Character(mockTypewriter, 'A', x, y);

    expect(char.x).not.toBe(x);
    expect(char.y).not.toBe(y);

    expect(char.x).toBeCloseTo(x, 0);
    expect(char.y).toBeCloseTo(y, 0);
  });
});
