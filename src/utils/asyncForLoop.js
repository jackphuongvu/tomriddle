function asyncForLoop(arr, processFn, cb) {
  // Copyright 2009 Nicholas C. Zakas. All rights reserved.
  // MIT Licensed
  // http://www.nczonline.net/blog/2009/08/11/timed-array-processing-in-javascript/

  let i = 0;
  const len = arr.length;
  const loopFinished = cb || function callback() {};

  if (!len) {
    loopFinished();
    return;
  }

  window.setTimeout(function timeout() {
    const start = +new Date();
    do {
      processFn.call(this, arr[i], i);
      // eslint-disable-next-line no-plusplus
    } while (++i < len && +new Date() - start < 50);

    if (i < len) {
      // call next item
      // eslint-disable-next-line no-restricted-properties, no-caller
      window.setTimeout(arguments.callee, 25);
    } else {
      loopFinished();
    }
  }, 25);
}

export default asyncForLoop;
