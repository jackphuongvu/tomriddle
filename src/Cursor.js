import Vector from './Vector';

const FONT_SIZE = 26;
const containerScale = 1;
const GLOBAL_ALPHA = 0.72;
const cursorCanvas = document.getElementById('cursor-canvas');
const textInput = document.getElementById('text-input');
const cursorCtx = cursorCanvas.getContext('2d');
const letterSize = parseInt(Math.min(FONT_SIZE, window.innerWidth / 17), 10);
const letterWidth = (letterSize * 12) / 20;
const lineHeight = letterSize + 8;
const cursorWidth = letterWidth;
const cursorHeight = lineHeight - 6;
const paddingVec = (function getPaddingVec() {
  const _x = Math.min(100, window.innerWidth / 8);
  const _y = Math.min(_x, window.innerHeight / 8);
  return new Vector(_x, _y);
}());

// top-left
const initialPosVec = paddingVec;

export class Cursor {
  _cursorTimeout;

  _raf;

  _time;

  _opacity;

  position = initialPosVec;

  /**
   * @param {import('./Typewriter').TypeWriter} typewriter
   */
  constructor(typewriter) {
    this.typewriter = typewriter;
    this.reset();
  }

  reset = () => {
    this.position = initialPosVec;
  }

  clear = () => {
    const _pos = this.position.subtract(1).divideBy(containerScale);

    // rect appears to have a border on the bottom-right
    cursorCtx.clearRect(_pos.x, _pos.y, cursorWidth + 2, cursorHeight + 2);
  };

  update = (vec) => {
    this.clear();

    this.position = vec;

    setTimeout(() => {
      textInput.style.left = `${Math.min(vec.x, window.innerWidth)}px`;
      textInput.style.top = `${Math.min(vec.y, window.innerHeight)}px`;
    }, 0);
    this.draw();
  };

  _draw = () => {
    const _pos = this.position.divideBy(containerScale);

    cursorCtx.fillRect(_pos.x, _pos.y, cursorWidth, cursorHeight);
  }

  draw = () => {
    this._draw();

    window.clearTimeout(this._cursorTimeout);
    if (this._raf) {
      window.cancelAnimationFrame(this._raf);
    }
    this._opacity = GLOBAL_ALPHA;
    this._cursorTimeout = window.setTimeout(this.fadeOut.bind(this), 2200);
  }

  nudge = (vec) => {
    this.update(this.position.add(vec.multiplyBy(containerScale)));
  };

  moveleft = () => {
    this.nudge(new Vector(-letterWidth, 0));
  };

  moveright = () => {
    this.nudge(new Vector(letterWidth, 0));
  };

  moveup = () => {
    this.nudge(new Vector(0, -lineHeight));
  };

  movedown = () => {
    this.nudge(new Vector(0, lineHeight));
  };

  addtab = () => {
    this.nudge(new Vector(letterWidth * 4, 0));
  };

  newline = function newline() {
    this.update(new Vector(paddingVec.x, this.position.y + lineHeight));
  };

  fadeOut = function fadeOut() {
    this._time = new Date();
    this._raf = window.requestAnimationFrame(this._fadeanim.bind(this));
  };

  _fadeanim = function _fadeanim() {
    const dt = new Date() - this._time;
    const newOpacity = this._opacity - (0.1 * dt) / 300;

    if (newOpacity <= 0) {
      this.clear();
    } else {
      cursorCtx.save();
      this.clear();
      this._opacity = newOpacity;
      cursorCtx.globalAlpha = this._opacity;
      this._draw();
      cursorCtx.restore();
      this._raf = window.requestAnimationFrame(this._fadeanim.bind(this));
    }
  };

  /** mapping for keys that move cursor */
  navButtons = {
    8: this.moveleft.bind(this),
    9: this.addtab.bind(this),
    37: this.moveleft.bind(this),
    38: this.moveup.bind(this),
    39: this.moveright.bind(this),
    40: this.movedown.bind(this),
    13: this.newline.bind(this),
  }
}
