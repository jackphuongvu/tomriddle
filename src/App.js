import DOMEvent from './DOMEvent';
import MultiAudio from './MultiAudio';
import NO_AUDIO from './NO_AUDIO';
import { TypeWriter } from './Typewriter';
import Vector from './Vector';

const ENTER = 13;
const FONT_SIZE = 26;
const textInput = document.getElementById('text-input');
const letterSize = parseInt(Math.min(FONT_SIZE, window.innerWidth / 17), 10);
const letterWidth = (letterSize * 12) / 20;
const lineHeight = letterSize + 8;
const keypressAudio = window.keypress_audio || new MultiAudio('/static/audio/keypress.mp3', 5);
const newlineAudio = window.newline_audio || new MultiAudio('/static/audio/return.mp3', 2);
const IS_IOS = navigator.userAgent.match(/(iPad|iPhone|iPod)/g);

class App {
  mouseuptimeout;

  mousemovedelay;

  mousedowntime;

  clickdelay;

  originalPos;

  running = false;

  splashEvents = [];

  constructor() {
    this.typewriter = new TypeWriter();
  }

  reset = () => {
    this.mouseuptimeout = 0;
    this.mousemovedelay = 150;
    this.mousedowntime = 0;
    this.clickdelay = 150;
    this.originalPos = 0;
  };

  start = () => {
    if (this.running) return;

    this.running = true;
    this.reset();
    this.typewriter.reset();
    this.events('on');
    this.typewriter.focusText();
    this.typewriter.cursor.draw();
  };

  stop = () => {
    this.splash();
    if (!this.running) return;
    this.running = false;

    // kill events
    this.events('off');
    this.removeMoveEvent();
  };

  splash = () => {
    // some functions below
    // should push to this array
    // to describe tear down events
    for (let i = 0, len = this.splashEvents.length; i < len; i += 1) {
      const fnc = this.splashEvents[i];
      fnc();
    }
  };

  events = (_onoff) => {
    const onoff = _onoff || 'on';
    const documentEvents = {
      mouseup: this.mouseup,
      touchend: this.touchend,
      mousedown: this.mousedown,
      touchstart: this.touchstart,
    };
    const cursorEvents = {
      keydown: this.keydown,
      keyup: this.keyup,
      focus: this.focus,
    };

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
      DOMEvent[onoff](textInput, key, fnc);
    }

    if (IS_IOS) {
      DOMEvent[onoff](document, 'touchstart', this.iosTouchStart);
    }
  };

  /** keydown handles audio */
  keydown = (e) => {
    const noAudio = NO_AUDIO[e.which];

    if (!noAudio) {
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
        textInput.focus();
      }, 10);
      e.preventDefault();
    }

    return false;
  }

  /**
   * keyup handles character input and navigation
   */
  keyup = (e) => {
    const nav = this.typewriter.cursor.navButtons[e.which];
    const value = e.key;
    const isLetter = value.length === 1;

    if (nav) {
      nav();
    } else if (isLetter) {
      TypeWriter.addCharacter(value);
    }
    this.typewriter.focusText();
  }

  focus = () => {
    this.typewriter.focusText();
  }

  mouseup = (e) => {
    this.removeMoveEvent();

    if (this.originalPos) {
      const _position = this.getPositionFromEvent(e);

      _position._subtract(this.originalPos);

      TypeWriter.reposition(_position);
      this.originalPos = null;
    } else if (new Date() - this.mousedowntime <= this.clickdelay) {
      this.updateCursor(e);
    }
  }

  touchend = (e) => {
    if (!e.touches.length) {
      if (e.changedTouches.length) {
        e.clientX = e.changedTouches[0].clientX;
        e.clientY = e.changedTouches[0].clientY;
      } else {
        this.removeMoveEvent();
        return;
      }
    }

    this.mouseup(e);
  }

  mousedown = (e) => {
    // ignore right click
    if (e.button === 2) return;

    // single finger or mouse
    this.mousedowntime = new Date();

    this.mouseuptimeout = window.setTimeout(() => {
      this.originalPos = this.originalPos || this.getPositionFromEvent(e);

      DOMEvent.on(document, 'mousemove', this.mousemove);
      DOMEvent.on(document, 'touchmove', this.mousemove);
      DOMEvent.on(document, 'mouseup', this.removeMoveEvent);
    }, this.mousemovedelay);
  }

  touchstart = (e) => {
    e.preventDefault();
    if (e.touches && e.touches.length === 2) {
      // todo: work on zooming
      return false;
    }
    e.stopPropagation();
    return this.mousedown(e);
  }

  iosTouchStart = (e) => {
    this.updateCursor(e);
  }

  mousemove = (e) => {
    if (!this.originalPos) return;
    const _position = this.getPositionFromEvent(e);

    _position._subtract(this.originalPos);

    this.container.style.left = `${_position.x}px`;
    this.container.style.top = `${_position.y}px`;
    this.typewriter.cursor.clear();
  }

  updateCursor = (e) => {
    const _position = this.getPositionFromEvent(e);
    const letterOffset = new Vector(letterWidth / 2, lineHeight / 2);
    const _newpos = _position.subtract(letterOffset);
    this.typewriter.cursor.update(_newpos);
    this.typewriter.focusText();
  }

  removeMoveEvent = () => {
    window.clearTimeout(this.mouseuptimeout);
    DOMEvent.off(document, 'mousemove', this.mousemove);
    DOMEvent.off(document, 'touchmove', this.mousemove);
    DOMEvent.off(document, 'mouseup', this.removeMoveEvent);
  }

  getPositionFromEvent = (e) => {
    const touch = (e.touches && e.touches[0]) || {};
    const { position } = this.typewriter.cursor;
    const _x = e.clientX || touch.clientX || position.x;
    const _y = e.clientY || touch.clientY || position.y;
    return new Vector(_x, _y);
  }
}

export default new App();
