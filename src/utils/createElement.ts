const createElement = (
  tagname = 'div',
  params: Partial<Record<WritableKeys<HTMLElement>, any>>
): HTMLElement => {
  const elem = document.createElement(tagname);

  // eslint-disable-next-line guard-for-in
  for (const key in params) {
    const typedKey = key as WritableKeys<HTMLElement>;
    (elem as any)[typedKey] = params[typedKey];
  }

  return elem;
};

export default createElement;
