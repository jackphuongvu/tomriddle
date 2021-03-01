import lzString from 'lz-string';
import * as Storage from './Storage';

jest.mock('lz-string', () => ({
  default: {
    compress: jest.fn((str: string) => str),
    decompress: jest.fn((str: string) => str),
  },
}));

describe('Storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('gets storage info', () => {
    const info = Storage.getInfo();

    expect(info.numCreated).toBe(0);
    expect(info.data).toHaveLength(0);
  });

  it('can set info', () => {
    const info: ReturnType<typeof Storage.getInfo> = {
      data: [
        {
          date: 123,
          name: 'Undefined',
          key: 'tws-4',
        },
      ],
      numCreated: 2,
    };

    Storage.setInfo(info);

    const newInfo = Storage.getInfo();

    expect(newInfo).toEqual(expect.objectContaining(info));
  });

  it('compresses new data before saving', () => {
    const str = '[JSON data]';
    Storage.create(str);

    expect(lzString.compress).toHaveBeenCalledTimes(1);
    expect(lzString.compress).toHaveBeenCalledWith(str);
  });

  it('can create new entry', () => {
    const str = '[JSON data]';
    Storage.create(str);

    const info = Storage.getInfo();

    expect(info.data).toHaveLength(1);
    expect(info.numCreated).toBe(1);
    expect(Number(info.data[0].date)).not.toBeNaN();
    expect(info.data[0].name).toBe('Writing #1');
    expect(info.data[0].key).toBe('tws-1');
  });

  it('can get saved data', () => {
    const str = '[JSON data]';
    Storage.create(str);

    const data = Storage.get('tws-1');

    expect(data).toBe(str);
  });

  it('can update name of saved data', () => {
    const str = '[JSON data]';
    Storage.create(str);

    Storage.update('tws-1', { name: 'Wow' });

    const info = Storage.getInfo();

    expect(info.data[0].name).toBe('Wow');
  });

  it('can delete saved data', () => {
    jest.spyOn(localStorage, 'removeItem');

    const str = '[JSON data]';
    Storage.create(str);

    expect(localStorage.getItem('tws-1')).toBeTruthy();

    Storage.deleteById('tws-1');

    const info = Storage.getInfo();

    // clears info
    expect(info.data).toHaveLength(0);
    expect(info.numCreated).toBe(1);
    // clears saved item
    expect(localStorage.getItem('tws-1')).not.toBeTruthy();
  });
});
