HTMLCanvasElement.prototype.getContext = () => {
  const canvas = this;

  return {
    canvas,
    // TODO test that these mocks are called
    scale() {},
    clearRect() {},
    fillRect() {},
    save() {},
    translate() {},
    rotate() {},
    fillText() {},
    restore() {},
  };
};

export const container = document.createElement('div');
export const textInput = document.createElement('div');
export const textCanvas = document.createElement('canvas');
export const cursorCanvas = document.createElement('canvas');
export const textCtx = textCanvas.getContext('2d', { alpha: true });
export const cursorCtx = cursorCanvas.getContext('2d');
