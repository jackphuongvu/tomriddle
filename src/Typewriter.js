import Vector from './Vector';
import DOMEvent from './DOMEvent';
import asyncForLoop from './asyncForLoop';
import { Cursor } from './Cursor';
import { Character } from './Character';

const FONT_SIZE = 26;
const container = document.getElementById('container');
const textCanvas = document.getElementById('text-canvas');
const textCtx = textCanvas.getContext('2d', { alpha: true });
const cursorCanvas = document.getElementById('cursor-canvas');
const cursorCtx = cursorCanvas.getContext('2d');
const textInput = document.getElementById('text-input');
const DEVICE_PIXEL_RATIO = window.devicePixelRatio || 1;
const TEXT_COLOR = '#150904';
const CURSOR_COLOR = '#4787ea';
const GLOBAL_ALPHA = 0.72;
const letterSize = parseInt(Math.min(FONT_SIZE, window.innerWidth / 17), 10);

export class TypeWriter {
  /** @type {TypeWriter} */
  static _instance;

  canvasOffset = new Vector(0, 0);

  containerScale = 1;

  chars = [];

  constructor() {
    if (TypeWriter._instance) {
      return TypeWriter._instance;
    }

    TypeWriter._instance = this;

    this.cursor = new Cursor(this);
  }

  addCharacter = (_chars, _x, _y) => {
    if (_x && _y) {
      this.cursor.update(new Vector(_x, _y));
    }
    for (let i = 0, len = _chars.length; i < len; i += 1) {
      const { position: { x, y } } = this.cursor;
      const char = _chars[i];

      this.chars.push(new Character(this, char, x, y));
      this.cursor.moveright();
    }
  }

  redraw = () => {
    function processFn(char) {
      char.draw();
    }

    asyncForLoop(this.chars, processFn);
  }

  resetCanvases = () => {
    [textCtx, cursorCtx].forEach((ctx) => {
      const { canvas } = ctx;

      ctx.setTransform(1, 0, 0, 1, 0, 0);

      canvas.width = window.innerWidth * DEVICE_PIXEL_RATIO;
      canvas.height = window.innerHeight * DEVICE_PIXEL_RATIO;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;

      ctx.scale(DEVICE_PIXEL_RATIO, DEVICE_PIXEL_RATIO);

      ctx.globalAlpha = GLOBAL_ALPHA;
    });

    // reset contexts, because resizing wipes them
    textCtx.font = `${letterSize}px Special Elite, serif`;
    textCtx.textBaseline = 'top';
    textCtx.fillStyle = TEXT_COLOR;

    cursorCtx.fillStyle = CURSOR_COLOR;
    cursorCtx.scale(this.containerScale, this.containerScale);
  }

  /**
   * offset characters for given x/y
   * useful for moving/dragging
   * useful for redrawing (b/c needs resetting)
   */
  reposition = (vec) => {
    this.canvasOffset._add(vec || new Vector(0, 0));

    container.style.left = '0px';
    container.style.top = '0px';

    this.resetCanvases();
    this.redraw();
  };

  /**
   * back to original blank canvas
   */
  reset = () => {
    this.chars = [];
    this.cursor.reset();
    this.canvasOffset = new Vector(0, 0);
    this.containerScale = 1;
    container.setAttribute('style', '');

    this.reposition();
    this.cursor.draw();
    // eslint-disable-next-line no-use-before-define
    this.focusText();
  };

  /** iphone can't focus properly */
  focusText = () => {
    textInput.innerHTML = '';
    textInput.focus();
    // const p = textInput;
    // const s = window.getSelection();
    // const r = document.createRange();
    // r.setStart(p, p.childElementCount);
    // r.setEnd(p, p.childElementCount);
    // s.removeAllRanges();
    // s.addRange(r);
  }
}

DOMEvent.on(window, 'resize', () => {
  TypeWriter.reposition();
});
