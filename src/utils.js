/* eslint-disable import/prefer-default-export */
export function randMargin(num, margin) {
  const min = num - margin;
  const max = num + margin;
  const value = Math.random() * (max - min) + min;
  return value;
}
