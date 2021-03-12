import lzString from 'lz-string';

export interface SavedItem {
  name: string;
  created: number;
  lastModified: number;
  key: string;
}

interface SavedInfo {
  numCreated: number;
  data: SavedItem[];
}

const KEY = 'tws-info';
const defaultInfo = JSON.stringify({ numCreated: 0, data: [] });

export const getInfo = (): SavedInfo =>
  JSON.parse(localStorage.getItem(KEY) || defaultInfo);

export const setInfo = (info: SavedInfo) => {
  localStorage.setItem(KEY, JSON.stringify(info));
};

export const updateWriting = (key: string, str: string) => {
  // save data (might need try/catch)
  localStorage.setItem(key, lzString.compress(str));
};

export const create = (str: string): string => {
  const info = getInfo();
  const numCreated = info.numCreated + 1;
  const key = `tws-${numCreated}`;

  updateWriting(key, str);

  // update info
  info.numCreated = numCreated;

  info.data.push({
    key,
    created: Date.now(),
    lastModified: Date.now(),
    name: `Writing #${numCreated}`,
  });

  setInfo(info);

  return key;
};

/** Gets details about a saved piece */
export const getDataById = (key: string): [SavedItem | null, number] => {
  const info = getInfo();

  for (let i = 0, len = info.data.length; i < len; i += 1) {
    const data = info.data[i];
    if (data.key === key) {
      return [data, i];
    }
  }

  return [null, -1];
};

/** Gets saved writing */
export const get = (key: string): string | null => {
  // TODO: test when get returns null
  const [data] = getDataById(key);

  if (data) {
    try {
      const stored = localStorage.getItem(data.key) || '';
      const uncompressed = lzString.decompress(stored);

      return uncompressed;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    }
  }

  return null;
};

/** update details */
export const update = (key: string, updated: Pick<SavedItem, 'name'>): void => {
  const [data, index] = getDataById(key);
  if (data) {
    data.name = updated.name;

    const info = getInfo();

    info.data[index] = data;

    setInfo(info);
  }
};

export const deleteById = (key: string): void => {
  const [, index] = getDataById(key);

  if (index > -1) {
    const info = getInfo();
    const { key: _key } = info.data[index];

    // remove saved item
    localStorage.removeItem(_key);

    info.data.splice(index, 1);
    setInfo(info);
  }
};
