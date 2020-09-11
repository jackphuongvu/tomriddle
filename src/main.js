/**
 *
 * Inspired by a girl, Ms. Jayme Bergman
 *
 */
import Vector from './Vector';
import MultiAudio from './MultiAudio';
import DOMEvent from './DOMEvent';
import asyncForLoop from './asyncForLoop';
import NO_AUDIO from './NO_AUDIO';

const options = {
  play_audio: true,
  font_size: 26,
  line_height: null,
};

const container = document.getElementById('container');
let containerScale = 1;
const containerOffset = new Vector(0, 0);
let canvasOffset = new Vector(0, 0);
const textCanvas = document.getElementById('text-canvas');
const textCtx = textCanvas.getContext('2d', { alpha: true });
const cursorCanvas = document.getElementById('cursor-canvas');
const cursorCtx = cursorCanvas.getContext('2d');
const cursorInput = document.getElementById('cursor-input');
const keypressAudio = window.keypress_audio || new MultiAudio('/static/audio/keypress.mp3', 5);
const newlineAudio = window.newline_audio || new MultiAudio('/static/audio/return.mp3', 2);
const IS_IOS = navigator.userAgent.match(/(iPad|iPhone|iPod)/g);
const DEVICE_PIXEL_RATIO = window.devicePixelRatio || 1;
const TEXT_COLOR = '#150904';
const CURSOR_COLOR = '#4787ea';
const GLOBAL_ALPHA = 0.72;
const ALPHA_MARGIN = 0.06;
const ROTATE_MARGIN = 0.05;
const TRANSLATE_MARGIN = 0.2;
let chars = [];
const letterSize = parseInt(Math.min(options.font_size, window.innerWidth / 17), 10);
const letterWidth = (letterSize * 12) / 20;
const lineHeight = options.line_height === null ? letterSize + 8 : options.line_height;

const paddingVec = (function getPaddingVec() {
  const _x = Math.min(100, window.innerWidth / 8);
  const _y = Math.min(_x, window.innerHeight / 8);
  return new Vector(_x, _y);
}());

// top-left
const initialPosVec = paddingVec;
const cursorWidth = letterWidth;
const cursorHeight = lineHeight - 6;

let posVec = initialPosVec;

const Cursor = (function getCursor() {
  /**
   * Cursor singleton for controlling cursor
   * position and visibility
   */
  function _Cursor() {
    let _cursorTimeout;
    let _raf;
    let _time;
    let _opacity;

    this.clear = function clear() {
      const _pos = posVec.subtract(1).divideBy(containerScale);

      // rect appears to have a border on the bottom-right
      cursorCtx.clearRect(_pos.x, _pos.y, cursorWidth + 2, cursorHeight + 2);
    };

    this.update = function update(vec) {
      this.clear();

      posVec = vec;
      cursorInput.style.left = `${Math.min(vec.x, window.innerWidth)}px`;
      cursorInput.style.top = `${Math.min(vec.y, window.innerHeight)}px`;
      this.draw();
    };

    this._draw = function _draw() {
      const _pos = posVec.divideBy(containerScale);

      cursorCtx.fillRect(_pos.x, _pos.y, cursorWidth, cursorHeight);
    };

    this.draw = function draw() {
      this._draw();

      window.clearTimeout(_cursorTimeout);
      if (_raf) {
        window.cancelAnimationFrame(_raf);
      }
      _opacity = GLOBAL_ALPHA;
      _cursorTimeout = window.setTimeout(this.fadeOut.bind(this), 2200);
    };

    this.nudge = function nudge(vec) {
      this.update(posVec.add(vec.multiplyBy(containerScale)));
    };

    this.moveleft = function moveleft() {
      this.nudge(new Vector(-letterWidth, 0));
    };
    this.moveright = function moveright() {
      this.nudge(new Vector(letterWidth, 0));
    };
    this.moveup = function moveup() {
      this.nudge(new Vector(0, -lineHeight));
    };
    this.movedown = function movedown() {
      this.nudge(new Vector(0, lineHeight));
    };
    this.addtab = function addtab() {
      this.nudge(new Vector(letterWidth * 4, 0));
    };

    this.newline = function newline() {
      this.update(new Vector(paddingVec.x, posVec.y + lineHeight));
    };

    this.fadeOut = function fadeOut() {
      _time = new Date();
      _raf = window.requestAnimationFrame(this._fadeanim.bind(this));
    };

    this._fadeanim = function _fadeanim() {
      const dt = new Date() - _time;
      const newOpacity = _opacity - (0.1 * dt) / 300;

      if (newOpacity <= 0) {
        this.clear();
      } else {
        cursorCtx.save();
        this.clear();
        _opacity = newOpacity;
        cursorCtx.globalAlpha = _opacity;
        this._draw();
        cursorCtx.restore();
        _raf = window.requestAnimationFrame(this._fadeanim.bind(this));
      }
    };
  }

  return new _Cursor();
}());

// mapping for keys that move cursor
const NAV_BUTTONS = {
  8: Cursor.moveleft.bind(Cursor),
  9: Cursor.addtab.bind(Cursor),
  37: Cursor.moveleft.bind(Cursor),
  38: Cursor.moveup.bind(Cursor),
  39: Cursor.moveright.bind(Cursor),
  40: Cursor.movedown.bind(Cursor),
  13: Cursor.newline.bind(Cursor),
};

const ENTER = 13;

const TypeWriter = (function getTypeWriter() {
  function _TypeWriter() {
    /**
       * TypeWriter singleton for handling characters
       * and global positioning system (GPS, ya know)
       */
    this.addCharacter = function addCharacter(charStr, _x, _y) {
      if (_x && _y) {
        Cursor.update(new Vector(_x, _y));
      }
      for (let i = 0, len = charStr.length; i < len; i += 1) {
        const char = charStr[i];

        // eslint-disable-next-line no-use-before-define
        chars.push(new Character(char));
        Cursor.moveright();
      }
    };

    /**
     * pure redraw (no resetting/clearing)
     */
    this.redraw = function redraw() {
      function processFn(char) {
        char.draw();
      }

      asyncForLoop(chars, processFn);
    };

    this.resetCanvases = function resetCanvases() {
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
      cursorCtx.scale(containerScale, containerScale);
    };

    /**
     * offset characters for given x/y
     * useful for moving/dragging
     * useful for redrawing (b/c needs resetting)
     */
    this.reposition = function reposition(vec) {
      canvasOffset._add(vec || new Vector(0, 0));

      container.style.left = '0px';
      container.style.top = '0px';

      this.resetCanvases();
      this.redraw();
    };

    /**
     * back to original blank canvas
     */
    this.reset = function reset() {
      chars = [];
      posVec = initialPosVec;
      canvasOffset = new Vector(0, 0);
      containerScale = 1;
      container.setAttribute('style', '');

      this.reposition();
      Cursor.draw();
      cursorInput.focus();
    };
  }

  return new _TypeWriter();
}());

const App = (function getApp() {
  function _App() {
    let mouseuptimeout;
    let mousemovedelay;
    let mousedowntime;
    let clickdelay;
    let originalPos;

    this.running = false;

    this.reset = function reset() {
      mouseuptimeout = 0;
      mousemovedelay = 150;
      mousedowntime = 0;
      clickdelay = 150;
      originalPos = 0;
    };

    this.start = function start() {
      if (this.running) return;

      this.running = true;
      this.reset();
      TypeWriter.reset();
      this.events('on');
      cursorInput.focus();
      // eslint-disable-next-line no-use-before-define
      forceSpace.call(cursorInput);
      Cursor.draw();
    };

    this.stop = function stop() {
      this.splash();
      if (!this.running) return;
      this.running = false;

      // kill events
      this.events('off');
      // eslint-disable-next-line no-use-before-define
      removeMoveEvent();
    };

    this.splash_events = [];

    this.splash = function splash() {
      // some functions below
      // should push to this array
      // to describe tear down events
      for (let i = 0, len = this.splash_events.length; i < len; i += 1) {
        const fnc = this.splash_events[i];
        fnc();
      }
    };

    this.events = function events(_onoff) {
      const onoff = _onoff || 'on';
      /* eslint-disable no-use-before-define */
      const documentEvents = {
        mouseup,
        touchend,
        mousedown,
        touchstart,
      };
      const cursorEvents = {
        keydown,
        keyup,
        focus,
      };
      /* eslint-enable  no-use-before-define */
      let key;
      let fnc;

      // eslint-disable-next-line no-restricted-syntax, guard-for-in
      for (key in documentEvents) {
        fnc = documentEvents[key];
        DOMEvent[onoff](document, key, fnc);
      }

      // eslint-disable-next-line no-restricted-syntax, guard-for-in
      for (key in cursorEvents) {
        fnc = cursorEvents[key];
        DOMEvent[onoff](cursorInput, key, fnc);
      }

      if (IS_IOS) {
        // eslint-disable-next-line no-use-before-define
        DOMEvent[onoff](document, 'touchstart', iosTouchStart);
      }
    };

    /** keydown handles audio */
    function keydown(e) {
      const noAudio = NO_AUDIO[e.which];

      if (!noAudio && options.play_audio) {
        if (e.which === ENTER) {
          newlineAudio.play();
        } else {
          keypressAudio.play();
        }
        return true;
      }

      if (noAudio === 'TAB') {
        // refocus
        window.setTimeout(() => {
          cursorInput.focus();
        }, 10);
        e.preventDefault();
      }

      return false;
    }

    /**
     * keyup handles character input and navigation
     */
    function keyup(e) {
      const nav = NAV_BUTTONS[e.which];
      const value = this.value.substr(1);

      if (!value && !nav) return;

      if (nav) {
        nav();
      } else {
        TypeWriter.addCharacter(value);
      }
      // eslint-disable-next-line no-use-before-define
      forceSpace.call(this);
    }

    function focus() {
      // eslint-disable-next-line no-use-before-define
      forceSpace.call(this);
    }

    function mouseup(e) {
      // eslint-disable-next-line no-use-before-define
      removeMoveEvent();

      if (originalPos) {
        // eslint-disable-next-line no-use-before-define
        const _position = getPositionFromEvent(e);

        _position._subtract(originalPos);

        TypeWriter.reposition(_position);
        originalPos = null;
      } else if (new Date() - mousedowntime <= clickdelay && !IS_IOS) {
        // eslint-disable-next-line no-use-before-define
        updateCursor(e);
      }
    }

    function touchend(e) {
      if (!e.touches.length) {
        if (e.changedTouches.length) {
          e.clientX = e.changedTouches[0].clientX;
          e.clientY = e.changedTouches[0].clientY;
        } else {
          // eslint-disable-next-line no-use-before-define
          removeMoveEvent();
          return;
        }
      }

      mouseup(e);
    }

    function mousedown(e) {
      // ignore right click
      if (e.button === 2) return;

      // single finger or mouse
      mousedowntime = new Date();

      mouseuptimeout = window.setTimeout(() => {
        /* eslint-disable no-use-before-define */
        originalPos = originalPos || getPositionFromEvent(e);

        DOMEvent.on(document, 'mousemove', mousemove);
        DOMEvent.on(document, 'touchmove', mousemove);
        DOMEvent.on(document, 'mouseup', removeMoveEvent);
        /* eslint-enable no-use-before-define */
      }, mousemovedelay);
    }

    function touchstart(e) {
      if (e.touches && e.touches.length === 2) {
        // todo: work on zooming
        e.preventDefault();
        return false;
      }
      return mousedown(e);
    }

    function iosTouchStart(e) {
      // eslint-disable-next-line no-use-before-define
      return updateCursor(e);
    }

    function mousemove(e) {
      if (!originalPos) return;
      // move holder
      // eslint-disable-next-line no-use-before-define
      const _position = getPositionFromEvent(e);

      _position._subtract(originalPos);

      container.style.left = `${_position.x}px`;
      container.style.top = `${_position.y}px`;
      Cursor.clear();
    }

    function updateCursor(e) {
      // eslint-disable-next-line no-use-before-define
      const _position = getPositionFromEvent(e);
      const letterOffset = new Vector(letterWidth / 2, lineHeight / 2);
      const _newpos = _position.subtract(letterOffset);
      Cursor.update(_newpos);
      cursorInput.focus();
    }

    function removeMoveEvent() {
      window.clearTimeout(mouseuptimeout);
      DOMEvent.off(document, 'mousemove', mousemove);
      DOMEvent.off(document, 'touchmove', mousemove);
      DOMEvent.off(document, 'mouseup', removeMoveEvent);
    }
  }

  return new _App();
}());

/**
 *
 * Character class for drawing characters on TypeWriter singleton
 *
 */
function Character(charStr, _x, _y) {
  /* eslint-disable no-use-before-define */
  const x = randMargin(_x || posVec.x, TRANSLATE_MARGIN);
  const y = randMargin(_y || posVec.y, TRANSLATE_MARGIN);

  this.str = charStr;
  this.rotate = randMargin(0, ROTATE_MARGIN);
  this.alpha = randMargin(GLOBAL_ALPHA, ALPHA_MARGIN);
  /* eslint-enable no-use-before-define */

  // save vector position
  Vector.call(this, x, y);

  // save inverse of current typewriter offsets
  // useful for applying future changing offsets
  // in redraw functions
  this._subtract(canvasOffset.multiplyBy(containerScale))._subtract(
    containerOffset,
  );

  this.draw();
}

Character.prototype = Object.create(Vector.prototype);

Character.prototype.draw = function draw() {
  // apply current typewriter offsets
  const vec = this.add(canvasOffset.divideBy(containerScale));

  textCtx.save();
  if (containerScale !== 1) {
    textCtx.translate(containerOffset.x, containerOffset.y);
    textCtx.scale(containerScale, containerScale);
  }
  textCtx.translate(vec.x, vec.y);
  textCtx.rotate(this.rotate);
  textCtx.globalAlpha = this.alpha;
  textCtx.fillText(this.str, 0, 0);
  textCtx.restore();
};

DOMEvent.on(window, 'resize', () => {
  TypeWriter.reposition();
});

/**
 *
 * mobile app listener
 *
 */
DOMEvent.on(
  document,
  'deviceready',
  () => {
    // vibrate gives option to clear typewriter
    shake.startWatch(() => {
      if (!App.running) return;

      navigator.notification.confirm(
        'Do you want to clear the canvas?',
        (button) => {
          if (button === 1) {
            TypeWriter.reset();
          }
        },
      );
    });
  },
  false,
);

/**
 * basic app handlers
 */
DOMEvent.on(window, 'load', () => {
  if (window.location.hash) {
    window.location.hash = '';
  }
  App.start();
});

/**
 *
 * some miscellaneous functions
 *
 */
// function sendEvent(...args) {
//   // send to Google
//   window.ga.apply(this, ['send', 'event', ...args]);
// }

function forceSpace() {
  // firefox allows navigation within input
  // this forces cursor to the end
  this.value = '';
  this.value = ' ';
}

function getPositionFromEvent(e) {
  const touch = (e.touches && e.touches[0]) || {};
  const _x = e.clientX || touch.clientX || posVec.x;
  const _y = e.clientY || touch.clientY || posVec.y;
  return new Vector(_x, _y);
}

/**
 *
 * helper functions
 *
 */
function randRange(min, max) {
  const value = Math.random() * (max - min) + min;
  return value;
}

function randMargin(num, margin) {
  return randRange(num - margin, num + margin);
}
