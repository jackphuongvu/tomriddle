import App from './App';

jest.mock('./helpers/getElements');

jest.useFakeTimers();

describe('Character', () => {
  it('can initialize', () => {
    expect(new App().typewriter).toBeTruthy();
  });
});
