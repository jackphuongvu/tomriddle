import Vector from './Vector';

const ALPHA_MARGIN = 0.06;
const ROTATE_MARGIN = 0.05;
const TRANSLATE_MARGIN = 0.2;
const GLOBAL_ALPHA = 0.72;
const textCanvas = document.getElementById('text-canvas');
const textCtx = textCanvas.getContext('2d', { alpha: true });

export class Character extends Vector {
  /**
   * @param {import('./Typewriter').TypeWriter} typewriter
   * @param {string} charStr
   * @param {number} _x
   * @param {number} _y
   */
  constructor(typewriter, charStr, _x, _y) {
    /* eslint-disable no-use-before-define */
    const x = randMargin(_x, TRANSLATE_MARGIN);
    const y = randMargin(_y, TRANSLATE_MARGIN);

    // save vector position
    super(x, y);

    this.str = charStr;
    this.rotate = randMargin(0, ROTATE_MARGIN);
    this.alpha = randMargin(GLOBAL_ALPHA, ALPHA_MARGIN);
    this.typewriter = typewriter;

    // save inverse of current typewriter offsets
    // useful for applying future changing offsets
    // in redraw functions
    this._subtract(typewriter.canvasOffset);

    this.draw();
  }

  draw = () => {
    // apply current typewriter offsets
    const vec = this.add(this.typewriter.canvasOffset);

    textCtx.save();
    textCtx.translate(vec.x, vec.y);
    textCtx.rotate(this.rotate);
    textCtx.globalAlpha = this.alpha;
    textCtx.fillText(this.str, 0, 0);
    textCtx.restore();
  };
}

function randMargin(num, margin) {
  const min = num - margin;
  const max = num + margin;
  const value = Math.random() * (max - min) + min;
  return value;
}
