import lzString from 'lz-string';
import * as Storage from './Storage';

jest.mock('lz-string', () => ({
  default: {
    // fake compress
    compress: jest.fn((str: string) => `_____${str}`),
    // fake decompress
    decompress: jest.fn((str: string) => str.substr(5)),
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
          created: 123,
          lastModified: 123,
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
    expect(Number(info.data[0].created)).not.toBeNaN();
    expect(Number(info.data[0].lastModified)).not.toBeNaN();
    expect(info.data[0].name).toBe('Writing #1');
    expect(info.data[0].key).toBe('tws-1');
  });

  it('can get info for created item by id', () => {
    const str = '[JSON data]';
    const id = Storage.create(str);
    const [item, index] = Storage.getDataById(id);

    expect(item).not.toBeNull();
    expect(index).toBe(0);
    expect(item?.name).toBe(`Writing #1`);
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

  it('returns id from create method', () => {
    const str = '[JSON data]';
    const id = Storage.create(str);

    expect(id).toBe('tws-1');
  });
});
