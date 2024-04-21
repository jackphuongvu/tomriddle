'use strict';

/**
 * mapping for soundless keys
 * Don't ever allow Android's ridiculous 229 code
 */
const NO_AUDIO = {
  0: 'PRTSCR',
  8: 'BACKSPACE',
  9: 'TAB',
  16: 'SHIFT',
  17: 'CTRL',
  18: 'ALT',
  20: 'CAPSLOCK',
  27: 'ESC',
  32: 'SPACE',
  33: 'PGUP',
  34: 'PGDN',
  35: 'END',
  36: 'HOME',
  37: 'LEFT',
  38: 'UP',
  39: 'RIGHT',
  40: 'DOWN',
  45: 'INSERT',
  46: 'DEL',
  91: 'WIN',
  92: 'WIN',
  112: 'F1',
  113: 'F2',
  114: 'F3',
  115: 'F4',
  116: 'F5',
  117: 'F6',
  118: 'F7',
  119: 'F8',
  120: 'F9',
  121: 'F10',
  122: 'F11',
  123: 'F12',
  144: 'NUMLOCK',
  145: 'SCROLLLOCK',
  224: 'CMD'
};

class Vector {
  /**
   * Vector for positioning
   */
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  add(vector) {
    if (typeof vector === 'number') {
      return new Vector(this.x + vector, this.y + vector);
    }

    return new Vector(this.x + vector.x, this.y + vector.y);
  }

  _add(vector) {
    this.x += typeof vector === 'number' ? vector : vector.x;
    this.y += typeof vector === 'number' ? vector : vector.y;
    return this;
  }

  subtract(vector) {
    if (typeof vector === 'number') {
      return new Vector(this.x - vector, this.y - vector);
    }

    return new Vector(this.x - vector.x, this.y - vector.y);
  }

  _subtract(vector) {
    this.x -= typeof vector === 'number' ? vector : vector.x;
    this.y -= typeof vector === 'number' ? vector : vector.y;
    return this;
  }

  divideBy(num) {
    return new Vector(this.x / num, this.y / num);
  }

  multiplyBy(num) {
    return new Vector(this.x * num, this.y * num);
  }

}

const container = document.getElementById('container');
const textInput = document.getElementById('text-input');
const textCanvas = document.getElementById('text-canvas');
const cursorCanvas = document.getElementById('cursor-canvas');
const textCtx = textCanvas.getContext('2d', {
  alpha: true
});
const cursorCtx = cursorCanvas.getContext('2d');

/* eslint-disable no-param-reassign */
const positionElem = (elem, _ref) => {
  let {
    x,
    y
  } = _ref;
  // avoid Cumulative Layout Shift: https://web.dev/cls/
  elem.style.transform = "translate(".concat(x, "px, ").concat(y, "px)");
};

const FONT_SIZE = 26;
const containerScale = 1;
const GLOBAL_ALPHA = 0.72;
const letterSize = parseInt(String(Math.min(FONT_SIZE, window.innerWidth / 17)), 10);
const letterWidth = letterSize * 12 / 20;
const lineHeight = letterSize + 8;
const cursorWidth = letterWidth;
const cursorHeight = lineHeight - 6;

const paddingVec = function getPaddingVec() {
  const _x = Math.min(100, window.innerWidth / 8);

  const _y = Math.min(_x, window.innerHeight / 8);

  return new Vector(_x, _y);
}();

textInput.style.width = "".concat(cursorWidth, "px");
textInput.style.height = "".concat(cursorHeight, "px"); // top-left

const initialPosVec = paddingVec;
class Cursor {
  constructor() {
    this.position = initialPosVec;

    this.reset = () => {
      this.update(initialPosVec);
    };

    this.clear = () => {
      // console.log('clear');
      const _pos = this.position.subtract(1).divideBy(containerScale); // rect appears to have a border on the bottom-right


      const width = cursorWidth + 4;
      const height = cursorHeight + 4;
      cursorCtx.clearRect(_pos.x, _pos.y, width, height);
    };
    /**
     * @param {Vector} vec
     */


    this.update = vec => {
      // console.log('update');
      // move the "hidden" input
      positionElem(textInput, {
        x: Math.min(vec.x, window.innerWidth - cursorWidth),
        y: Math.min(vec.y, window.innerHeight)
      }); // clear the canvas

      this.clear(); // update the position

      this.position = vec; // draw canvas at new position

      this.draw();
    };

    this._draw = () => {
      // console.log('_draw');
      const _pos = this.position.divideBy(containerScale);

      cursorCtx.fillRect(_pos.x, _pos.y, cursorWidth, cursorHeight);
    };

    this.draw = () => {
      // console.log('draw');
      // console.log('_raf', this._raf);
      this._draw(); // console.log('this._cursorTimeout: ', this._cursorTimeout);
      // 2.2s


      window.clearTimeout(this._cursorTimeout);

      if (this._raf) {
        window.cancelAnimationFrame(this._raf);
      }

      this._opacity = GLOBAL_ALPHA; // console.log('this._opacity: ', this._opacity);

      this._cursorTimeout = window.setTimeout(this.fadeOut.bind(this), 2200);
    };

    this.nudge = vec => {
      this.update(this.position.add(vec.multiplyBy(containerScale)));
    };

    this.moveleft = () => {
      this.nudge(new Vector(-cursorWidth, 0));
    };

    this.moveright = () => {
      this.nudge(new Vector(cursorWidth, 0));
    };

    this.moveup = () => {
      this.nudge(new Vector(0, -cursorHeight));
    };

    this.movedown = () => {
      this.nudge(new Vector(0, cursorHeight));
    };
    /** centers on mouse click */


    this.moveToClick = vec => {
      this.update(vec.subtract(new Vector(cursorWidth / 2, cursorHeight / 2)));
    };

    this.addtab = () => {
      this.nudge(new Vector(letterWidth * 4, 0));
    };

    this.newline = () => {
      this.update(new Vector(paddingVec.x, this.position.y + lineHeight));
    };

    this.fadeOut = () => {
      // console.log('fadeOut');
      this._time = new Date();
      this._raf = requestAnimationFrame(this._fadeanim.bind(this));
    };

    this._fadeanim = () => {
      const dt = Date.now() - this._time.valueOf();

      const newOpacity = this._opacity - 0.1 * dt / 300;

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
    /** mapping for keys that move cursor; disallow ridiculous Android 'Process' */


    this.navButtons = {
      Backspace: this.moveleft.bind(this),
      Tab: this.addtab.bind(this),
      ArrowLeft: this.moveleft.bind(this),
      ArrowUp: this.moveup.bind(this),
      ArrowRight: this.moveright.bind(this),
      ArrowDown: this.movedown.bind(this),
      Enter: this.newline.bind(this)
    };
  }

}

const ALPHA_MARGIN = 0.06;
const ROTATE_MARGIN = 0.05;
const TRANSLATE_MARGIN = 0.2;
const GLOBAL_ALPHA$1 = 0.72;

function randMargin(num, margin) {
  const min = num - margin;
  const max = num + margin;
  const value = Math.random() * (max - min) + min;
  return value;
}

class Character extends Vector {
  constructor(typewriter, charStr, _x, _y) {
    // save vector position
    super(randMargin(_x, TRANSLATE_MARGIN), randMargin(_y, TRANSLATE_MARGIN));

    this.draw = () => {
      // console.log('draw');
      // console.log('this.s', this.s);
      // apply current typewriter offsets
      const vec = this.add(this.typewriter.canvasOffset); // console.log('vec', vec);
      //
      // console.log('textCtx', textCtx);

      if (textCtx) {
        textCtx.save();
        textCtx.translate(vec.x, vec.y);
        textCtx.rotate(this.rotate);
        textCtx.globalAlpha = this.alpha;
        textCtx.fillText(this.s, 0, 0);
        textCtx.restore();
      }
    };

    this.s = charStr;
    this.rotate = randMargin(0, ROTATE_MARGIN);
    this.alpha = randMargin(GLOBAL_ALPHA$1, ALPHA_MARGIN);
    this.typewriter = typewriter; // save inverse of current typewriter offsets
    // useful for applying future changing offsets
    // in redraw functions

    this._subtract(typewriter.canvasOffset);

    this.draw();
  }

}

const debounce = function debounce(fn) {
  let delay = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 100;
  let timeOutId;
  return function () {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    if (timeOutId) {
      clearTimeout(timeOutId);
    }

    timeOutId = window.setTimeout(() => {
      fn(...args);
    }, delay);
  };
};

const FONT_SIZE$1 = 26;
const TEXT_COLOR = '#150904';
const CURSOR_COLOR = '#4787ea';
const GLOBAL_ALPHA$2 = 0.72;
const letterSize$1 = parseInt(String(Math.min(FONT_SIZE$1, window.innerWidth / 17)), 10);
class TypeWriter {
  constructor() {
    this.canvasOffset = new Vector(0, 0);
    this.containerScale = 1;
    this.chars = [];
    this.cursor = new Cursor();

    this.addCharacter = (_chars, _x, _y) => {
      // console.log('addCharacter in TS file.');
      // console.log('_chars: ', _chars);
      // console.log('this.chars: ', this.chars);
      // console.log('_x: ', _x);
      // console.log('_y: ', _y);
      // manually set position and update cursor
      if (_x !== undefined && _y !== undefined) {
        this.chars.push(new Character(this, _chars, _x, _y));
        this.cursor.update(new Vector(_x, _y));
        return;
      } // console.log('chars: ', this.chars);
      // iterate characters and move cursor right


      for (let i = 0, len = _chars.length; i < len; i += 1) {
        const {
          position: {
            x,
            y
          }
        } = this.cursor;
        const char = _chars[i];
        this.chars.push(new Character(this, char, x, y));
        this.cursor.moveright();
      } // console.log('chars: ', this.chars);

    };

    this.redraw = () => {
      // console.log('redraw');
      // console.log('chars: ', this.chars);
      this.chars.forEach(char => char.draw());
    };

    this.resetCanvases = () => {
      [textCtx, cursorCtx].forEach(ctx => {
        const {
          canvas
        } = ctx;
        const {
          devicePixelRatio = 1,
          innerWidth,
          innerHeight
        } = window;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        canvas.width = innerWidth * devicePixelRatio;
        canvas.height = innerHeight * devicePixelRatio;
        canvas.style.width = "".concat(innerWidth, "px");
        canvas.style.height = "".concat(innerHeight, "px");
        ctx.scale(devicePixelRatio, devicePixelRatio);
        ctx.globalAlpha = GLOBAL_ALPHA$2;
      }); // reset contexts, because resizing wipes them

      textCtx.font = "".concat(letterSize$1, "px Special Elite, serif");
      textCtx.textBaseline = 'top';
      textCtx.fillStyle = TEXT_COLOR;
      cursorCtx.fillStyle = CURSOR_COLOR;
      cursorCtx.scale(this.containerScale, this.containerScale);
    };
    /**
     * offset characters for given x/y
     * useful for moving/dragging
     * useful for redrawing (b/c needs resetting)
     */


    this.reposition = vec => {
      if (vec instanceof Vector) {
        this.canvasOffset._add(vec);
      }

      positionElem(container, {
        x: 0,
        y: 0
      });
      this.resetCanvases();
      this.redraw();
    };

    this.debouncedReposition = debounce(this.reposition, 100);
    /**
     * back to original blank canvas
     */

    this.reset = () => {
      this.chars = [];
      this.cursor.reset();
      this.canvasOffset = new Vector(0, 0);
      this.containerScale = 1;
      container.setAttribute('style', '');
      this.reposition();
      this.cursor.draw();
    };

    if (TypeWriter._instance) {
      return TypeWriter._instance;
    }

    TypeWriter._instance = this; // add events

    window.addEventListener('resize', this.debouncedReposition);
  }

  export() {
    // just save x,y,str and re-instantiate classes in import
    return JSON.stringify(this.chars.map((_ref) => {
      let {
        x,
        y,
        s
      } = _ref;
      return {
        x,
        y,
        s
      };
    }));
  }

  import(str) {
    try {
      const chars = JSON.parse(str);

      if (!Array.isArray(chars)) {
        return;
      }

      this.reset();

      for (const {
        s,
        x,
        y
      } of chars) {
        this.addCharacter(s, x, y);
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('failed to import');
    }
  }

}

const getPositionFromEvent = e => {
  if ('touches' in e) {
    const touch = e.type === 'touchend' ? e.changedTouches[0] : e.touches[0];
    return new Vector(touch.pageX, touch.pageY);
  }

  return new Vector(e.pageX, e.pageY);
};

/**
 * Add mobile equivalent for contextmenu event.
 * User touches element for a given length of time
 */
const addLongTouch = function addLongTouch(elem, callback) {
  let delay = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 350;
  let timeout;

  const clear = () => {
    window.clearTimeout(timeout);
    timeout = 0;
  };

  const onTouchStart = e => {
    if (e.touches.length === 1) {
      timeout = window.setTimeout(() => callback(e), delay);
    } else if (timeout) {
      // clear on multiple touches
      clear();
    }
  };

  elem.addEventListener('touchstart', onTouchStart);
  elem.addEventListener('touchmove', clear);
  elem.addEventListener('touchend', clear);
  return () => {
    elem.removeEventListener('touchstart', onTouchStart);
    elem.removeEventListener('touchmove', clear);
    elem.removeEventListener('touchend', clear);
  };
};

function createElement(tagname, params) {
  const elem = document.createElement(tagname); // eslint-disable-next-line guard-for-in

  for (const key in params) {
    const typedKey = key;
    elem[typedKey] = params[typedKey];
  }

  return elem;
}

const isAnchorElement = a => a.tagName === 'A';

const eventTarget = cursorCanvas;

class Menu {
  constructor() {
    this.menu = createElement('div', {
      className: 'popup menu',
      id: 'menu'
    });
    this.menuBackdrop = createElement('div', {
      className: 'backdrop menu-backdrop',
      id: 'menu-backdrop'
    });

    this.handleContextMenu = e => {
      var _a;

      if (this.menu.contains(e.target)) return; // open menu at position

      const buffer = 5;
      const {
        x,
        y
      } = getPositionFromEvent(e).add(buffer);
      e.preventDefault();
      this.openMenu({
        x,
        y
      });
      (_a = window.gtag) === null || _a === void 0 ? void 0 : _a.call(window, 'event', 'menu:open', {
        event_category: 'menu'
      });
    };

    this.handleClose = (_ref) => {
      let {
        target
      } = _ref;

      if (!this.menu.contains(target)) {
        this.closeMenu();
      }
    };

    this.events('on');
    this.menu.setAttribute('role', 'list');
    this.menu.tabIndex = -1;
    this.menuBackdrop.appendChild(this.menu);
  }

  destroy() {
    var _a;

    this.events('off');
    (_a = this.menuBackdrop.parentNode) === null || _a === void 0 ? void 0 : _a.removeChild(this.menuBackdrop);
  }

  addMenuItem(innerHTML) {
    let {
      callback,
      href
    } = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    const tagname = href ? 'a' : 'div';
    const menuItem = createElement(tagname, {
      innerHTML,
      className: 'menu-item'
    });

    if (isAnchorElement(menuItem)) {
      menuItem.target = '_blank';
      menuItem.href = href;
    }

    if (callback) {
      menuItem.addEventListener('click', callback);
      menuItem.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
          callback();
        }
      });
    }

    if (callback || href) {
      menuItem.classList.add('clickable');
      menuItem.tabIndex = 0;
    }

    menuItem.setAttribute('role', 'listitem');
    this.menu.appendChild(menuItem);
  }

  addDivider() {
    const hr = createElement('hr');
    this.menu.appendChild(hr);
  }

  events() {
    let onoff = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'on';
    const method = onoff === 'on' ? 'addEventListener' : 'removeEventListener';
    const events = {
      contextmenu: this.handleContextMenu
    }; // eslint-disable-next-line guard-for-in

    for (const key in events) {
      eventTarget[method](key, events[key]);
    }
  }

  openMenu(position) {
    if (this.menuBackdrop.parentNode == null) {
      document.body.appendChild(this.menuBackdrop);
      document.body.addEventListener('click', this.handleClose);
    }

    positionElem(this.menu, position); // remove tabIndex from textInput

    textInput.tabIndex = -1;
    textInput.disabled = true;
    this.menu.focus();
  }

  closeMenu() {
    const elem = this.menuBackdrop; // re-adds tabIndex for textInput

    textInput.tabIndex = 0;
    textInput.disabled = false; // TODO: add test for this

    if (!elem || elem.parentNode == null) {
      return;
    } // don't listen for more close events


    document.body.removeEventListener('click', this.handleClose); // actually remove things after exit animation

    const onExit = e => {
      var _a;

      if (e.target !== elem) return;
      elem.removeEventListener('animationend', onExit);
      elem.classList.remove('exit');
      (_a = elem.parentNode) === null || _a === void 0 ? void 0 : _a.removeChild(elem);
    };

    elem.addEventListener('animationend', onExit); // trigger exit animation

    elem.classList.add('exit');
  }

}

function createCommonjsModule(fn) {
  var module = { exports: {} };
	return fn(module, module.exports), module.exports;
}

var lzString = createCommonjsModule(function (module) {
// Copyright (c) 2013 Pieroxy <pieroxy@pieroxy.net>
// This work is free. You can redistribute it and/or modify it
// under the terms of the WTFPL, Version 2
// For more information see LICENSE.txt or http://www.wtfpl.net/
//
// For more information, the home page:
// http://pieroxy.net/blog/pages/lz-string/testing.html
//
// LZ-based compression algorithm, version 1.4.4
var LZString = (function() {

// private property
var f = String.fromCharCode;
var keyStrBase64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
var keyStrUriSafe = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-$";
var baseReverseDic = {};

function getBaseValue(alphabet, character) {
  if (!baseReverseDic[alphabet]) {
    baseReverseDic[alphabet] = {};
    for (var i=0 ; i<alphabet.length ; i++) {
      baseReverseDic[alphabet][alphabet.charAt(i)] = i;
    }
  }
  return baseReverseDic[alphabet][character];
}

var LZString = {
  compressToBase64 : function (input) {
    if (input == null) return "";
    var res = LZString._compress(input, 6, function(a){return keyStrBase64.charAt(a);});
    switch (res.length % 4) { // To produce valid Base64
    default: // When could this happen ?
    case 0 : return res;
    case 1 : return res+"===";
    case 2 : return res+"==";
    case 3 : return res+"=";
    }
  },

  decompressFromBase64 : function (input) {
    if (input == null) return "";
    if (input == "") return null;
    return LZString._decompress(input.length, 32, function(index) { return getBaseValue(keyStrBase64, input.charAt(index)); });
  },

  compressToUTF16 : function (input) {
    if (input == null) return "";
    return LZString._compress(input, 15, function(a){return f(a+32);}) + " ";
  },

  decompressFromUTF16: function (compressed) {
    if (compressed == null) return "";
    if (compressed == "") return null;
    return LZString._decompress(compressed.length, 16384, function(index) { return compressed.charCodeAt(index) - 32; });
  },

  //compress into uint8array (UCS-2 big endian format)
  compressToUint8Array: function (uncompressed) {
    var compressed = LZString.compress(uncompressed);
    var buf=new Uint8Array(compressed.length*2); // 2 bytes per character

    for (var i=0, TotalLen=compressed.length; i<TotalLen; i++) {
      var current_value = compressed.charCodeAt(i);
      buf[i*2] = current_value >>> 8;
      buf[i*2+1] = current_value % 256;
    }
    return buf;
  },

  //decompress from uint8array (UCS-2 big endian format)
  decompressFromUint8Array:function (compressed) {
    if (compressed===null || compressed===undefined){
        return LZString.decompress(compressed);
    } else {
        var buf=new Array(compressed.length/2); // 2 bytes per character
        for (var i=0, TotalLen=buf.length; i<TotalLen; i++) {
          buf[i]=compressed[i*2]*256+compressed[i*2+1];
        }

        var result = [];
        buf.forEach(function (c) {
          result.push(f(c));
        });
        return LZString.decompress(result.join(''));

    }

  },


  //compress into a string that is already URI encoded
  compressToEncodedURIComponent: function (input) {
    if (input == null) return "";
    return LZString._compress(input, 6, function(a){return keyStrUriSafe.charAt(a);});
  },

  //decompress from an output of compressToEncodedURIComponent
  decompressFromEncodedURIComponent:function (input) {
    if (input == null) return "";
    if (input == "") return null;
    input = input.replace(/ /g, "+");
    return LZString._decompress(input.length, 32, function(index) { return getBaseValue(keyStrUriSafe, input.charAt(index)); });
  },

  compress: function (uncompressed) {
    return LZString._compress(uncompressed, 16, function(a){return f(a);});
  },
  _compress: function (uncompressed, bitsPerChar, getCharFromInt) {
    if (uncompressed == null) return "";
    var i, value,
        context_dictionary= {},
        context_dictionaryToCreate= {},
        context_c="",
        context_wc="",
        context_w="",
        context_enlargeIn= 2, // Compensate for the first entry which should not count
        context_dictSize= 3,
        context_numBits= 2,
        context_data=[],
        context_data_val=0,
        context_data_position=0,
        ii;

    for (ii = 0; ii < uncompressed.length; ii += 1) {
      context_c = uncompressed.charAt(ii);
      if (!Object.prototype.hasOwnProperty.call(context_dictionary,context_c)) {
        context_dictionary[context_c] = context_dictSize++;
        context_dictionaryToCreate[context_c] = true;
      }

      context_wc = context_w + context_c;
      if (Object.prototype.hasOwnProperty.call(context_dictionary,context_wc)) {
        context_w = context_wc;
      } else {
        if (Object.prototype.hasOwnProperty.call(context_dictionaryToCreate,context_w)) {
          if (context_w.charCodeAt(0)<256) {
            for (i=0 ; i<context_numBits ; i++) {
              context_data_val = (context_data_val << 1);
              if (context_data_position == bitsPerChar-1) {
                context_data_position = 0;
                context_data.push(getCharFromInt(context_data_val));
                context_data_val = 0;
              } else {
                context_data_position++;
              }
            }
            value = context_w.charCodeAt(0);
            for (i=0 ; i<8 ; i++) {
              context_data_val = (context_data_val << 1) | (value&1);
              if (context_data_position == bitsPerChar-1) {
                context_data_position = 0;
                context_data.push(getCharFromInt(context_data_val));
                context_data_val = 0;
              } else {
                context_data_position++;
              }
              value = value >> 1;
            }
          } else {
            value = 1;
            for (i=0 ; i<context_numBits ; i++) {
              context_data_val = (context_data_val << 1) | value;
              if (context_data_position ==bitsPerChar-1) {
                context_data_position = 0;
                context_data.push(getCharFromInt(context_data_val));
                context_data_val = 0;
              } else {
                context_data_position++;
              }
              value = 0;
            }
            value = context_w.charCodeAt(0);
            for (i=0 ; i<16 ; i++) {
              context_data_val = (context_data_val << 1) | (value&1);
              if (context_data_position == bitsPerChar-1) {
                context_data_position = 0;
                context_data.push(getCharFromInt(context_data_val));
                context_data_val = 0;
              } else {
                context_data_position++;
              }
              value = value >> 1;
            }
          }
          context_enlargeIn--;
          if (context_enlargeIn == 0) {
            context_enlargeIn = Math.pow(2, context_numBits);
            context_numBits++;
          }
          delete context_dictionaryToCreate[context_w];
        } else {
          value = context_dictionary[context_w];
          for (i=0 ; i<context_numBits ; i++) {
            context_data_val = (context_data_val << 1) | (value&1);
            if (context_data_position == bitsPerChar-1) {
              context_data_position = 0;
              context_data.push(getCharFromInt(context_data_val));
              context_data_val = 0;
            } else {
              context_data_position++;
            }
            value = value >> 1;
          }


        }
        context_enlargeIn--;
        if (context_enlargeIn == 0) {
          context_enlargeIn = Math.pow(2, context_numBits);
          context_numBits++;
        }
        // Add wc to the dictionary.
        context_dictionary[context_wc] = context_dictSize++;
        context_w = String(context_c);
      }
    }

    // Output the code for w.
    if (context_w !== "") {
      if (Object.prototype.hasOwnProperty.call(context_dictionaryToCreate,context_w)) {
        if (context_w.charCodeAt(0)<256) {
          for (i=0 ; i<context_numBits ; i++) {
            context_data_val = (context_data_val << 1);
            if (context_data_position == bitsPerChar-1) {
              context_data_position = 0;
              context_data.push(getCharFromInt(context_data_val));
              context_data_val = 0;
            } else {
              context_data_position++;
            }
          }
          value = context_w.charCodeAt(0);
          for (i=0 ; i<8 ; i++) {
            context_data_val = (context_data_val << 1) | (value&1);
            if (context_data_position == bitsPerChar-1) {
              context_data_position = 0;
              context_data.push(getCharFromInt(context_data_val));
              context_data_val = 0;
            } else {
              context_data_position++;
            }
            value = value >> 1;
          }
        } else {
          value = 1;
          for (i=0 ; i<context_numBits ; i++) {
            context_data_val = (context_data_val << 1) | value;
            if (context_data_position == bitsPerChar-1) {
              context_data_position = 0;
              context_data.push(getCharFromInt(context_data_val));
              context_data_val = 0;
            } else {
              context_data_position++;
            }
            value = 0;
          }
          value = context_w.charCodeAt(0);
          for (i=0 ; i<16 ; i++) {
            context_data_val = (context_data_val << 1) | (value&1);
            if (context_data_position == bitsPerChar-1) {
              context_data_position = 0;
              context_data.push(getCharFromInt(context_data_val));
              context_data_val = 0;
            } else {
              context_data_position++;
            }
            value = value >> 1;
          }
        }
        context_enlargeIn--;
        if (context_enlargeIn == 0) {
          context_enlargeIn = Math.pow(2, context_numBits);
          context_numBits++;
        }
        delete context_dictionaryToCreate[context_w];
      } else {
        value = context_dictionary[context_w];
        for (i=0 ; i<context_numBits ; i++) {
          context_data_val = (context_data_val << 1) | (value&1);
          if (context_data_position == bitsPerChar-1) {
            context_data_position = 0;
            context_data.push(getCharFromInt(context_data_val));
            context_data_val = 0;
          } else {
            context_data_position++;
          }
          value = value >> 1;
        }


      }
      context_enlargeIn--;
      if (context_enlargeIn == 0) {
        context_enlargeIn = Math.pow(2, context_numBits);
        context_numBits++;
      }
    }

    // Mark the end of the stream
    value = 2;
    for (i=0 ; i<context_numBits ; i++) {
      context_data_val = (context_data_val << 1) | (value&1);
      if (context_data_position == bitsPerChar-1) {
        context_data_position = 0;
        context_data.push(getCharFromInt(context_data_val));
        context_data_val = 0;
      } else {
        context_data_position++;
      }
      value = value >> 1;
    }

    // Flush the last char
    while (true) {
      context_data_val = (context_data_val << 1);
      if (context_data_position == bitsPerChar-1) {
        context_data.push(getCharFromInt(context_data_val));
        break;
      }
      else context_data_position++;
    }
    return context_data.join('');
  },

  decompress: function (compressed) {
    if (compressed == null) return "";
    if (compressed == "") return null;
    return LZString._decompress(compressed.length, 32768, function(index) { return compressed.charCodeAt(index); });
  },

  _decompress: function (length, resetValue, getNextValue) {
    var dictionary = [],
        enlargeIn = 4,
        dictSize = 4,
        numBits = 3,
        entry = "",
        result = [],
        i,
        w,
        bits, resb, maxpower, power,
        c,
        data = {val:getNextValue(0), position:resetValue, index:1};

    for (i = 0; i < 3; i += 1) {
      dictionary[i] = i;
    }

    bits = 0;
    maxpower = Math.pow(2,2);
    power=1;
    while (power!=maxpower) {
      resb = data.val & data.position;
      data.position >>= 1;
      if (data.position == 0) {
        data.position = resetValue;
        data.val = getNextValue(data.index++);
      }
      bits |= (resb>0 ? 1 : 0) * power;
      power <<= 1;
    }

    switch (bits) {
      case 0:
          bits = 0;
          maxpower = Math.pow(2,8);
          power=1;
          while (power!=maxpower) {
            resb = data.val & data.position;
            data.position >>= 1;
            if (data.position == 0) {
              data.position = resetValue;
              data.val = getNextValue(data.index++);
            }
            bits |= (resb>0 ? 1 : 0) * power;
            power <<= 1;
          }
        c = f(bits);
        break;
      case 1:
          bits = 0;
          maxpower = Math.pow(2,16);
          power=1;
          while (power!=maxpower) {
            resb = data.val & data.position;
            data.position >>= 1;
            if (data.position == 0) {
              data.position = resetValue;
              data.val = getNextValue(data.index++);
            }
            bits |= (resb>0 ? 1 : 0) * power;
            power <<= 1;
          }
        c = f(bits);
        break;
      case 2:
        return "";
    }
    dictionary[3] = c;
    w = c;
    result.push(c);
    while (true) {
      if (data.index > length) {
        return "";
      }

      bits = 0;
      maxpower = Math.pow(2,numBits);
      power=1;
      while (power!=maxpower) {
        resb = data.val & data.position;
        data.position >>= 1;
        if (data.position == 0) {
          data.position = resetValue;
          data.val = getNextValue(data.index++);
        }
        bits |= (resb>0 ? 1 : 0) * power;
        power <<= 1;
      }

      switch (c = bits) {
        case 0:
          bits = 0;
          maxpower = Math.pow(2,8);
          power=1;
          while (power!=maxpower) {
            resb = data.val & data.position;
            data.position >>= 1;
            if (data.position == 0) {
              data.position = resetValue;
              data.val = getNextValue(data.index++);
            }
            bits |= (resb>0 ? 1 : 0) * power;
            power <<= 1;
          }

          dictionary[dictSize++] = f(bits);
          c = dictSize-1;
          enlargeIn--;
          break;
        case 1:
          bits = 0;
          maxpower = Math.pow(2,16);
          power=1;
          while (power!=maxpower) {
            resb = data.val & data.position;
            data.position >>= 1;
            if (data.position == 0) {
              data.position = resetValue;
              data.val = getNextValue(data.index++);
            }
            bits |= (resb>0 ? 1 : 0) * power;
            power <<= 1;
          }
          dictionary[dictSize++] = f(bits);
          c = dictSize-1;
          enlargeIn--;
          break;
        case 2:
          return result.join('');
      }

      if (enlargeIn == 0) {
        enlargeIn = Math.pow(2, numBits);
        numBits++;
      }

      if (dictionary[c]) {
        entry = dictionary[c];
      } else {
        if (c === dictSize) {
          entry = w + w.charAt(0);
        } else {
          return null;
        }
      }
      result.push(entry);

      // Add w+entry[0] to the dictionary.
      dictionary[dictSize++] = w + entry.charAt(0);
      enlargeIn--;

      w = entry;

      if (enlargeIn == 0) {
        enlargeIn = Math.pow(2, numBits);
        numBits++;
      }

    }
  }
};
  return LZString;
})();

if(  module != null ) {
  module.exports = LZString;
}
});

const KEY = 'tws-info';
const defaultInfo = JSON.stringify({
  numCreated: 0,
  data: []
});
const getInfo = () => JSON.parse(localStorage.getItem(KEY) || defaultInfo);
const setInfo = info => {
  localStorage.setItem(KEY, JSON.stringify(info));
};
const updateWriting = (key, str) => {
  // save data (might need try/catch)
  localStorage.setItem(key, lzString.compressToUTF16(str));
};
const create = function create(str) {
  let {
    created = Date.now(),
    lastModified = Date.now(),
    name: givenName
  } = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  const info = getInfo();
  const numCreated = info.numCreated + 1;
  const key = "tws-".concat(numCreated);
  updateWriting(key, str); // update info

  info.numCreated = numCreated;
  info.data.push({
    key,
    created,
    lastModified,
    name: givenName || "Writing #".concat(numCreated)
  });
  setInfo(info);
  return key;
};
/** Gets details about a saved piece */

const getDataById = key => {
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

const get = key => {
  // TODO: test when get returns null
  const [data] = getDataById(key);

  if (data) {
    try {
      const stored = localStorage.getItem(data.key) || '';
      const uncompressed = lzString.decompressFromUTF16(stored);
      return uncompressed;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    }
  }

  return null;
};
/** update details */

const update = (key, updated) => {
  const [data, index] = getDataById(key);

  if (data) {
    data.name = updated.name;
    const info = getInfo();
    info.data[index] = data;
    setInfo(info);
  }
};
const deleteById = key => {
  const [, index] = getDataById(key);

  if (index > -1) {
    const info = getInfo();
    const {
      key: _key
    } = info.data[index]; // remove saved item

    localStorage.removeItem(_key);
    info.data.splice(index, 1);
    setInfo(info);
  }
};

let inputCount = 0; // TODO: add click on backdrop to close

class Dialog {
  constructor(title) {
    let {
      submit = 'OK',
      cancel = 'Cancel'
    } = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {
      submit: 'OK',
      cancel: 'Cancel'
    };
    this.backdrop = createElement('div', {
      className: 'backdrop dialog-backdrop'
    });
    this.dialog = createElement('div', {
      className: 'popup dialog'
    });
    this.dialogForm = createElement('form', {
      onsubmit: e => {
        e.preventDefault();
        this.handleSubmit();
      }
    });
    this.dialogFooter = createElement('div', {
      className: 'dialog-footer'
    });

    this.submitCallback = () => {};

    this.cancelCallback = () => {};

    this.closeCallback = () => {};

    this.addFormElement = (label, elem) => {
      inputCount += 1;
      elem.setAttribute('id', "dialog-input-".concat(inputCount));
      const labelElem = createElement('label', {
        htmlFor: elem.id,
        innerHTML: label
      });
      this.dialogForm.appendChild(labelElem);
      this.dialogForm.appendChild(elem);
      return this;
    };

    this.handleSubmit = () => {
      if (this.submitCallback(this.formData) !== false) {
        this.close();
      }
    };

    this.onSubmit = cb => {
      this.submitCallback = cb;
      return this;
    };

    this.onCancel = cb => {
      this.cancelCallback = cb;
      return this;
    };

    this.onClose = cb => {
      this.closeCallback = cb;
      return this;
    };

    this.dialog.setAttribute('role', 'dialog');
    this.dialog.appendChild(createElement('header', {
      className: 'dialog-header',
      innerHTML: title
    }));
    const dialogBody = createElement('div', {
      className: 'dialog-body'
    });
    dialogBody.appendChild(this.dialogForm);
    this.dialog.appendChild(dialogBody);
    this.submitButton = createElement('button', {
      className: 'button button-primary',
      type: 'button',
      innerHTML: submit,
      onclick: this.handleSubmit
    });
    this.cancelButton = createElement('button', {
      className: 'button',
      type: 'button',
      innerHTML: cancel,
      onclick: () => {
        // TODO: test this is called
        this.cancelCallback();
        this.close();
      }
    });
    this.dialogFooter.appendChild(this.cancelButton);
    this.dialogFooter.appendChild(this.submitButton);
    this.dialog.appendChild(this.dialogFooter);
    this.backdrop.appendChild(this.dialog);
  }

  get formData() {
    const inputs = Array.from(this.dialogForm.elements);
    const obj = {};

    for (const input of inputs) {
      obj[input.name] = input.value;
    }

    return obj;
  }

  addInput(label, atts) {
    const input = createElement('input', atts);
    return this.addFormElement(label, input);
  }

  addTextArea(label, atts) {
    const textarea = createElement('textarea', atts);
    return this.addFormElement(label, textarea);
  }

  open() {
    // console.log('Dialog');
    // console.log('open');
    document.body.appendChild(this.backdrop);
    const firstInput = this.dialogForm.querySelector('input, textarea');
    firstInput === null || firstInput === void 0 ? void 0 : firstInput.focus();
    firstInput === null || firstInput === void 0 ? void 0 : firstInput.select();
  }

  close() {
    var _a, _b;

    this.closeCallback();
    (_b = (_a = this.backdrop) === null || _a === void 0 ? void 0 : _a.parentNode) === null || _b === void 0 ? void 0 : _b.removeChild(this.backdrop);
  }

}

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

const prettyDate = date => new Date(date).toLocaleString(undefined, {
  day: 'numeric',
  month: 'short',
  year: 'numeric'
});

const downloadFile = (filename, data) => {
  const a = document.createElement('a');
  a.href = data;
  a.rel = 'download';
  a.download = filename;
  a.click();
};
const JSONToFileString = json => "data:text/json;charset=utf-8,".concat(encodeURIComponent(JSON.stringify(json)));

/** prompts for file and returns contents */
const getFileContents = () => new Promise((resolve, reject) => {
  const fileInput = document.createElement('input');
  fileInput.type = 'file';

  fileInput.onchange = e => {
    const target = e.target;
    const {
      files
    } = target;
    const file = files ? files[0] : null;

    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.readAsText(file, 'UTF-8');

    reader.onload = readerEvent => {
      var _a;

      const content = (_a = readerEvent === null || readerEvent === void 0 ? void 0 : readerEvent.target) === null || _a === void 0 ? void 0 : _a.result;

      if (typeof content === 'string') {
        resolve(content);
      } else {
        reject();
      }
    };

    reader.onerror = reject;
  };

  fileInput.click();
});

const exportSaved = () => {
  const output = {
    data: getInfo().data,
    writings: []
  };

  if (output.data.length === 0) {
    return;
  }

  for (const {
    key
  } of output.data) {
    const writing = get(key);

    if (writing) {
      output.writings.push(writing);
    }
  }

  const fileData = JSONToFileString(output);
  downloadFile('tws.json', fileData);
};
const importSaved = () => __awaiter(void 0, void 0, void 0, function* () {
  // file prompt
  const contents = yield getFileContents();
  const {
    writings,
    data
  } = JSON.parse(contents); // import to Storage

  writings.forEach((writing, i) => {
    create(writing, data[i]);
  });
});

// TODO: add cancel button

class SavedList {
  // TODO: might be able to extend from Dialog.ts
  constructor(title) {
    // TODO: might need to separate these backdrops into a new class
    this.backdrop = createElement('div', {
      className: 'backdrop dialog-backdrop'
    });
    this.dialog = createElement('div', {
      className: 'popup dialog saved-list'
    });
    this.dialogBody = createElement('div', {
      className: 'dialog-body'
    });
    this.dialogFooter = createElement('footer', {
      className: 'dialog-footer'
    });

    this.clickCallback = () => {};

    this.editCallback = () => {};

    this.deleteCallback = () => {};

    this.closeCallback = () => {};

    this.getSaved = () => {
      const saved = getInfo();
      return saved.data.map(this.formatSaved);
    };

    this.formatSaved = savedItem => {
      const {
        name,
        created
      } = savedItem;
      const listitem = createElement('li', {
        className: 'saved-item',
        onclick: () => {
          this.clickCallback(savedItem);
          this.close();
        }
      });
      const loadButton = createElement('span', {
        className: 'saved-title-container'
      });
      const title = createElement('span', {
        className: 'saved-title',
        innerHTML: name
      });
      const createdElem = createElement('span', {
        className: 'saved-date-created',
        innerHTML: prettyDate(created),
        title: new Date(created).toLocaleString()
      });
      loadButton.appendChild(title);
      loadButton.appendChild(createdElem);
      const edit = createElement('button', {
        className: 'edit-saved',
        innerHTML: '✏️',
        onclick: e => {
          // button is inside of view button :D
          e.stopImmediatePropagation();
          this.editCallback(savedItem);
        }
      });
      const deleteItem = createElement('button', {
        className: 'delete-saved',
        innerHTML: '🗑',
        onclick: e => {
          // button is inside of view button :D
          e.stopImmediatePropagation();
          this.deleteCallback(savedItem);
        }
      });
      listitem.appendChild(loadButton);
      listitem.appendChild(edit);
      listitem.appendChild(deleteItem);
      return listitem;
    };

    this.onClick = cb => {
      this.clickCallback = cb;
      return this;
    };

    this.onEdit = cb => {
      this.editCallback = cb;
      return this;
    };

    this.onDelete = cb => {
      this.deleteCallback = cb;
      return this;
    };

    this.onClose = cb => {
      this.closeCallback = cb;
      return this;
    };

    this.dialog.setAttribute('role', 'dialog');
    this.dialog.appendChild(createElement('header', {
      className: 'dialog-header',
      innerHTML: title
    }));
    this.backdrop.addEventListener('click', (_ref) => {
      let {
        target
      } = _ref;

      if (target === this.backdrop) {
        this.close();
      }
    }); // add action buttons to footer

    this.exportButton = createElement('button', {
      className: 'button',
      type: 'button',
      innerHTML: 'Export',
      onclick: exportSaved
    });
    this.importButton = createElement('button', {
      className: 'button',
      type: 'button',
      innerHTML: 'import',
      onclick: () => __awaiter(this, void 0, void 0, function* () {
        try {
          yield importSaved();
        } catch (e) {// not sure
        } finally {
          this.refreshList();
        }
      })
    });
    const closeButton = createElement('button', {
      className: 'button',
      type: 'button',
      innerHTML: 'Close',
      onclick: this.close.bind(this)
    });
    this.refreshList();
    this.dialogFooter.appendChild(this.exportButton);
    this.dialogFooter.appendChild(this.importButton);
    this.dialogFooter.appendChild(closeButton);
    this.dialog.appendChild(this.dialogBody);
    this.dialog.appendChild(this.dialogFooter);
    this.backdrop.appendChild(this.dialog);
  }

  destroy() {
    var _a;

    (_a = this.backdrop.parentNode) === null || _a === void 0 ? void 0 : _a.removeChild(this.backdrop);
  }

  open() {
    document.body.appendChild(this.backdrop);
  }

  close() {
    this.closeCallback();
    this.destroy();
  }

  clearList() {
    var _a;

    for (const child of Array.from(this.dialogBody.children)) {
      (_a = child.parentNode) === null || _a === void 0 ? void 0 : _a.removeChild(child);
    }
  }

  refreshList() {
    const savedItems = this.getSaved();
    const isEmpty = savedItems.length === 0;
    this.exportButton.disabled = isEmpty;
    this.clearList();

    if (isEmpty) {
      const emptyList = createElement('div', {
        className: 'empty-list',
        innerHTML: 'Nothing saved'
      });
      this.dialogBody.appendChild(emptyList);
    } else {
      // add list
      const savedList = createElement('ul', {
        className: 'saved-list'
      });

      for (const item of savedItems) {
        savedList.appendChild(item);
      }

      this.dialogBody.appendChild(savedList);
    }
  }

}

const menuEvent = event => {
  window.gtag('event', event, {
    event_category: 'menu'
  });
};

const getAppMenu = app => {
  const menu = new Menu();
  let lastLoadedId;
  menu.addMenuItem( // '📃 &nbsp; New'
  'New', {
    callback: () => {
      lastLoadedId = '';
      menu.closeMenu();
      app.reset();
      menuEvent('menu:new');
    }
  });
  menu.addMenuItem( // '💾 &nbsp; Save'
  'Save', {
    // TODO: maybe should export all of these callbacks for testing
    callback: () => {
      // save and prompt edit modal
      const exported = app.typewriter.export();

      if (exported === '[]') {
        // empty should not be saved
        menu.closeMenu();
        menuEvent('menu:save:empty');
        return;
      }

      const id = lastLoadedId || create(exported);
      let submit = 'Save Writing';
      let cancel = 'Delete';

      if (lastLoadedId) {
        submit = 'Update Writing';
        cancel = 'Discard Changes';
      }

      const [item] = getDataById(id);
      menu.closeMenu();
      new Dialog('Save', {
        submit,
        cancel
      }).addInput('Name', {
        type: 'text',
        name: 'name',
        value: item === null || item === void 0 ? void 0 : item.name
      }).onSubmit((_ref) => {
        let {
          name
        } = _ref;

        if (!name) {
          // TODO: should return validation errors
          return false;
        }

        if (lastLoadedId) {
          // actually update
          updateWriting(lastLoadedId, exported);
        }

        update(id, {
          name
        });
        menuEvent('menu:save:success');
        return true;
      }).onCancel(() => {
        // TODO: make sure you can't exit from clicking the backdrop
        if (!lastLoadedId) {
          // newly created should delete the writing
          deleteById(id);
        }

        menuEvent('menu:save:cancel');
      }).open();
    }
  });
  menu.addMenuItem( // '👀 &nbsp; View Saved'
  'View Saved', {
    callback: () => {
      menu.closeMenu();
      menuEvent('menu:view-saved'); // const savedList = new SavedList('Saved Writings');

      const savedList = new SavedList('Saved journals');
      savedList.onClick((_ref2) => {
        let {
          key
        } = _ref2;
        const writing = get(key);

        if (writing) {
          app.typewriter.import(writing); // handle save as if it may be update instead

          lastLoadedId = key;
          menuEvent('menu:view-saved:view');
        } else {
          // empty writings got no reason to live
          deleteById(key);
          menuEvent('menu:view-saved:delete-empty');
        }
      }).onDelete((_ref3) => {
        let {
          key
        } = _ref3;
        deleteById(key); // refresh list

        savedList.refreshList();
        menuEvent('menu:view-saved:delete');
      }).onEdit((_ref4) => {
        let {
          name,
          key
        } = _ref4;
        new Dialog('Update', {
          submit: 'Update Writing'
        }).addInput('Name', {
          type: 'text',
          name: 'name',
          value: name
        }).onSubmit((_ref5) => {
          let {
            name: newName
          } = _ref5;

          if (!newName) {
            // TODO: should return validation errors
            return false;
          }

          update(key, {
            name: newName
          });
          savedList.refreshList();
          menuEvent('menu:view-saved:edit');
          return true;
        }).open();
      }).onClose(() => {
        app.focusText();
        app.typewriter.cursor.draw();
      }).open();
    }
  }); // menu.addMenuItem('📋 &nbsp; Paste Text', {
  //   callback: () => {
  //     const pasteDialog = new Dialog('Paste Text');
  //
  //     menu.closeMenu();
  //
  //     menuEvent('menu:paste-text');
  //
  //     pasteDialog
  //       .addTextArea('Text', {
  //         name: 'content',
  //       })
  //       .onSubmit<{ content: string }>(({ content }) => {
  //         const lines = content.split(/[\r\n]/);
  //         const { typewriter } = app;
  //         const { cursor } = typewriter;
  //
  //         typewriter.reset();
  //
  //         for (const line of lines) {
  //           typewriter.addCharacter(line);
  //           cursor.newline();
  //         }
  //       })
  //       .open();
  //   },
  // });
  // menu.addDivider();
  // menu.addMenuItem('🙋‍♀️ &nbsp; App Feedback', {
  //   href: 'https://github.com/bozdoz/typewritesomething/issues/new',
  // });
  //
  // menu.addMenuItem('🥰 &nbsp; Sponsor Me', {
  //   href: 'https://www.paypal.com/paypalme/bozdoz',
  // });

  return menu;
};

// import MultiAudio from './utils/MultiAudio';
// const keypressAudio = new MultiAudio(
//   '/static/audio/keypress.mp3',
//   // ios struggles with playing multi-audio; needs to have at most 3
//   isIos ? 3 : 7
// );
// const newlineAudio = new MultiAudio('/static/audio/return.mp3', 2);

const eventTarget$1 = cursorCanvas;

class App {
  constructor() {
    var _this = this;

    this.mousemovedelay = 150;
    this.running = false;
    this.typewriter = new TypeWriter();
    this.menu = null;

    this.removeLongTouch = () => {};

    this.events = function () {
      let onoff = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'on';
      const documentEvents = {
        mousedown: _this.handleMouseDown,
        touchstart: _this.handleTouchStart,
        mouseup: _this.handleMouseUp,
        touchend: _this.handleMouseUp
      };
      const cursorEvents = {
        keydown: _this.handleKeyDown,
        keyup: _this.handleKeyUp,
        focus: _this.handleFocus,
        keypress: _this.handleKeyPress
      };
      const method = onoff === 'on' ? 'addEventListener' : 'removeEventListener'; // eslint-disable-next-line no-restricted-syntax, guard-for-in

      for (const key in documentEvents) {
        const fnc = documentEvents[key];
        eventTarget$1[method](key, fnc);
      } // eslint-disable-next-line no-restricted-syntax, guard-for-in


      for (const key in cursorEvents) {
        const fnc = cursorEvents[key];
        textInput[method](key, fnc);
      }

      if (onoff === 'on') {
        // TODO: maybe move this event to Menu
        _this.removeLongTouch = addLongTouch(eventTarget$1, e => {
          var _a;

          const position = getPositionFromEvent(e); // remove mobile keyboard for css positioning of menu

          textInput.blur();
          (_a = _this.menu) === null || _a === void 0 ? void 0 : _a.openMenu(position);
        });
      } else {
        _this.removeLongTouch();

        _this.removeLongTouch = () => {};
      }
    };

    this.pressedKeys = {};
    /**
     * keydown handles audio
     * @param {KeyboardEvent} e
     */

    this.handleKeyDown = e => {
      const isMeta = e.altKey || e.ctrlKey || e.metaKey;
      const noAudio = NO_AUDIO[e.which] || isMeta;
      const isPressed = this.pressedKeys[e.code];

      if (isPressed) {
        return false;
      }

      if (!noAudio) {
        this.pressedKeys[e.code] = true;

        if (e.key === 'Enter') ;

        return true;
      }

      if (noAudio === 'TAB') {
        // refocus
        window.setTimeout(() => {
          textInput.focus();
        }, 10);
        e.preventDefault();
      }

      return true;
    };

    this.handleKeyPress = e => {
      const isMeta = e.altKey || e.ctrlKey || e.metaKey;
      const disable = e.key === 'Tab' || e.key === 'Enter';

      if (disable || isMeta) {
        e.preventDefault();
      }

      return !disable;
    };
    /**
     * keyup handles character input and navigation
     * @param {KeyboardEvent} e
     */


    this.handleKeyUp = e => {
      const {
        key,
        code
      } = e;
      const ignoreKey = key === 'Shift';
      const isMeta = e.altKey || e.ctrlKey || e.metaKey;

      if (ignoreKey) {
        return;
      }

      if (this.pressedKeys[code]) {
        delete this.pressedKeys[code];
      }

      if (isMeta) {
        // ignore if user is refreshing or navigating or something
        this.emptyText();
        return;
      }

      const {
        typewriter
      } = this;
      const nav = typewriter.cursor.navButtons[key]; // TODO: add test for first character being set
      // ignores first character, which should always be a single character

      const letters = textInput.value.substr(1);

      if (nav) {
        nav();
      } else if (letters) {
        typewriter.addCharacter(letters);
      }

      this.emptyText(); // android needs to blur to remove autocomplete double-type

      textInput.blur();
      this.focusText();
    };

    this.handleFocus = () => {
      this.focusText();
    };

    this.mouseDownStartPos = null;
    /**
     * handleMouseDown
     * @param {MouseEvent} e
     */

    this.handleMouseDown = e => {
      // TODO: add menu somehow somewhere
      // ignore right click
      if ('button' in e && e.button === 2) return; // mousemove would be expensive, so we add it only after the mouse is down

      this.mouseuptimeout = window.setTimeout(() => {
        this.mouseDownStartPos = getPositionFromEvent(e);
        eventTarget$1.addEventListener('touchmove', this.handleMouseMove);
        eventTarget$1.addEventListener('mousemove', this.handleMouseMove);
      }, this.mousemovedelay);
    };
    /**
     * handleTouchStart
     * @param {TouchEvent} e
     */


    this.handleTouchStart = e => {
      e.preventDefault();
      e.stopPropagation();

      if (e.touches && e.touches.length === 2) {
        // todo: work on zooming
        // (https://codepen.io/bozdoz/pen/xxEmJyx?editors=0011)
        return true;
      }

      return this.handleMouseDown(e);
    };
    /**
     * handleMouseMove
     * @param {MouseEvent} e
     */


    this.handleMouseMove = e => {
      // probably prevents browser zoom
      e.preventDefault();
      e.stopPropagation();

      if (!this.mouseDownStartPos) {
        return;
      }

      const _position = getPositionFromEvent(e)._subtract(this.mouseDownStartPos); // fake canvas moving by cheaply altering css


      positionElem(container, _position);
      this.typewriter.cursor.clear();
    };
    /**
     * handleMouseUp
     * @param {MouseEvent} e
     */


    this.handleMouseUp = e => {
      const rightClick = 'button' in e && e.button === 2;
      const stillTouches = 'touches' in e && e.touches.length > 0;
      if (rightClick || stillTouches) return;
      this.removeMoveEvent();
      const position = getPositionFromEvent(e);

      if (this.mouseDownStartPos) {
        // reposition canvas if mouse moved
        position._subtract(this.mouseDownStartPos);

        this.typewriter.reposition(position);
        this.mouseDownStartPos = null;
      } else {
        // act as if it were just a click handler
        this.updateCursor(position);
      }
    };
    /**
     * Updates cursor to a given position
     * @param {Vector} position
     */


    this.updateCursor = position => {
      this.typewriter.cursor.moveToClick(position);
      this.focusText();
    };

    this.removeMoveEvent = () => {
      window.clearTimeout(this.mouseuptimeout);
      eventTarget$1.removeEventListener('touchmove', this.handleMouseMove);
      eventTarget$1.removeEventListener('mousemove', this.handleMouseMove);
    };

    this.emptyText = () => {
      // sets value to empty first to adjust for cursor location
      textInput.value = ''; // leaves a character to disable automatic ProperCase in mobile

      textInput.value = '=';
    };

    this.focusText = () => {
      textInput.focus(); // TODO: reposition canvas to quasi-center textInput
    };
  }

  reset() {
    this.running = true;
    this.typewriter.reset();
    this.events('on');
    this.emptyText();
    this.focusText();
  }

  start() {
    if (this.running) return;
    this.reset();
    this.menu = getAppMenu(this);
  }

  stop() {
    var _a;

    if (!this.running) return;
    this.running = false; // kill events

    this.events('off');
    this.removeMoveEvent();
    (_a = this.menu) === null || _a === void 0 ? void 0 : _a.destroy();
    this.menu = null;
  }

}

const {
  search
} = window.location;
const query = search ? search.substr(1).split('&').reduce((prev, cur) => {
  const [key, val] = cur.split('='); // eslint-disable-next-line no-param-reassign

  prev[key] = val;
  return prev;
}, {}) : {};

const isDebugMode = () => 'debug' in query;

{
  // eslint-disable-next-line no-console
  window.gtag = console.log;
}

/**
 *
 * Inspired by a girl, Ms. Jayme Bergman
 *
 */
const splash = document.getElementById('splash');

const startApp = e => {
  if (e.altKey || e.ctrlKey || e.metaKey) {
    // user might be trying to do something else
    return;
  }

  splash.classList.add('hide');
  splash.removeEventListener('click', startApp);
  splash.removeEventListener('keyup', startApp);
  const app = new App();
  app.start(); // should be able to focus on ios so long as this
  // is called from within a click handler

  app.focusText();
};

const onload = () => {
  if (window.location.hash) {
    window.location.hash = '';
  }

  splash.focus();
  splash.addEventListener('click', startApp);
  splash.addEventListener('keyup', startApp);
  window.removeEventListener('load', onload);
};
/**
 * basic app handlers
 */


window.addEventListener('load', onload); // Register service worker to control making site work offline

if ('serviceWorker' in navigator && "development" === 'production') {
  navigator.serviceWorker.register('/sw.js').then(reg => {
    if (reg.installing) {
      // eslint-disable-next-line no-console
      console.log('Service worker installing');
    } else if (reg.waiting) {
      // eslint-disable-next-line no-console
      console.log('Service worker installed');
    } else if (reg.active) {
      // eslint-disable-next-line no-console
      console.log('Service worker active');
    }
  }).catch(e => {
    // eslint-disable-next-line no-console
    console.error('Service Worker failed'); // eslint-disable-next-line no-console

    console.error(e);
  });
} // TODO: add unit tests for debug mode
// Mostly just debugs CSS for text-input


if (isDebugMode()) {
  document.body.classList.add('debug');
}
//# sourceMappingURL=main.js.map
