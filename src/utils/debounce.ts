const debounce = <T extends (...args: any[]) => void>(
  fn: T,
  delay = 100
): ((this: ThisParameterType<T>, ...args: Parameters<T>) => void) => {
  let timeOutId: number;

  return (...args) => {
    if (timeOutId) {
      clearTimeout(timeOutId);
    }
    timeOutId = window.setTimeout(() => {
      fn(...args);
    }, delay);
  };
};

export default debounce;
