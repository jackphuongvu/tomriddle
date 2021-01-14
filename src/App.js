import MultiAudio from './utils/MultiAudio';
import NO_AUDIO from './helpers/NO_AUDIO';
import { TypeWriter } from './Typewriter';
import Vector from './utils/Vector';
import Debugger from './utils/Debugger';
import { container, textInput } from './helpers/getElements';

const ENTER = 13;
const keypressAudio = new MultiAudio('/static/audio/keypress.mp3', 5);
const newlineAudio = new MultiAudio('/static/audio/return.mp3', 2);
const IS_IOS = navigator.userAgent.match(/(iPad|iPhone|iPod)/g);

const events = [];
const eventLog = new Debugger();

eventLog.formatter((message) => {
  events.push(message);
  if (events.length > 3) {
    events.shift();
  }

  return events.join(', ');
});

class App {
  mouseuptimeout;

  mousemovedelay;

  mousedowntime;

  clickdelay;

  originalPos;

  running = false;

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
    if (!this.running) return;
    this.running = false;

    // kill events
    this.events('off');
    this.removeMoveEvent();
  };

  events = (onoff = 'on') => {
    const documentEvents = {
      mouseup: this.handleMouseUp,
      touchend: this.handleTouchEnd,
      mousedown: this.handleMouseDown,
      touchstart: this.handleTouchStart,
    };
    const cursorEvents = {
      keydown: this.handleKeyDown,
      keyup: this.handleKeyUp,
      focus: this.focus,
    };

    let key;
    let fnc;
    const method = onoff === 'on' ? 'addEventListener' : 'removeEventListener';

    // eslint-disable-next-line no-restricted-syntax, guard-for-in
    for (key in documentEvents) {
      fnc = documentEvents[key];
      document[method](key, fnc);
    }

    // eslint-disable-next-line no-restricted-syntax, guard-for-in
    for (key in cursorEvents) {
      fnc = cursorEvents[key];
      textInput[method](key, fnc);
    }

    if (IS_IOS) {
      document[method]('touchstart', this.iosTouchStart);
    }
  };

  /** keydown handles audio */
  handleKeyDown = (e) => {
    eventLog.log('keydown');
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
  };

  /**
   * keyup handles character input and navigation
   */
  handleKeyUp = (e) => {
    eventLog.log('keyup');
    const nav = this.typewriter.cursor.navButtons[e.which];
    const value = e.key;
    const isLetter = value.length === 1;

    if (nav) {
      nav();
    } else if (isLetter) {
      this.typewriter.addCharacter(value);
    }
    this.typewriter.focusText();
  };

  focus = () => {
    eventLog.log('focus');
    this.typewriter.focusText();
  };

  handleMouseUp = (e) => {
    eventLog.log('mouseup');
    this.removeMoveEvent();

    if (this.originalPos) {
      const _position = this.getPositionFromEvent(e);

      _position._subtract(this.originalPos);

      this.typewriter.reposition(_position);
      this.originalPos = null;
    } else if (Date.now() - this.mousedowntime <= this.clickdelay) {
      this.updateCursor(e);
    }
  };

  handleTouchEnd = (e) => {
    eventLog.log('touchend');
    if (!e.touches.length) {
      if (e.changedTouches.length) {
        e.clientX = e.changedTouches[0].clientX;
        e.clientY = e.changedTouches[0].clientY;
      } else {
        this.removeMoveEvent();
        return;
      }
    }

    this.handleMouseUp(e);
  };

  handleMouseDown = (e) => {
    eventLog.log('mousedown');
    // ignore right click
    if (e.button === 2) return;

    // single finger or mouse
    this.mousedowntime = new Date();

    this.mouseuptimeout = window.setTimeout(() => {
      this.originalPos = this.originalPos || this.getPositionFromEvent(e);

      document.addEventListener('mousemove', this.handleMouseMove);
      document.addEventListener('touchmove', this.handleMouseMove);
      document.addEventListener('mouseup', this.removeMoveEvent);
    }, this.mousemovedelay);
  };

  handleTouchStart = (e) => {
    eventLog.log('touchstart');
    e.preventDefault();
    if (e.touches && e.touches.length === 2) {
      // todo: work on zooming
      return false;
    }
    e.stopPropagation();
    return this.handleMouseDown(e);
  };

  iosTouchStart = (e) => {
    eventLog.log('ios touch start');
    this.updateCursor(e);
  };

  handleMouseMove = (e) => {
    eventLog.log('mouse move');
    if (!this.originalPos) return;

    const _position = this.getPositionFromEvent(e)._subtract(this.originalPos);

    container.style.left = `${_position.x}px`;
    container.style.top = `${_position.y}px`;
    this.typewriter.cursor.clear();
  };

  updateCursor = (e) => {
    const _position = this.getPositionFromEvent(e);
    this.typewriter.cursor.moveToClick(_position);
    this.typewriter.focusText();
  };

  removeMoveEvent = () => {
    window.clearTimeout(this.mouseuptimeout);
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('touchmove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.removeMoveEvent);
  };

  getPositionFromEvent = (e) => {
    const touch = (e.touches && e.touches[0]) || {};
    const { position } = this.typewriter.cursor;
    const _x = e.clientX || touch.clientX || position.x;
    const _y = e.clientY || touch.clientY || position.y;
    return new Vector(_x, _y);
  };
}

export default new App();
