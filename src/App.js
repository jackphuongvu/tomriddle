import MultiAudio from './utils/MultiAudio';
import NO_AUDIO from './helpers/NO_AUDIO';
import { TypeWriter } from './Typewriter';
import Vector from './utils/Vector';
import Debugger from './utils/Debugger';
import { container, textInput } from './helpers/getElements';

const ENTER = 13;
const keypressAudio = new MultiAudio('/static/audio/keypress.mp3', 5);
const newlineAudio = new MultiAudio('/static/audio/return.mp3', 2);

const events = [];
const eventLog = new Debugger();

eventLog.formatter((message) => {
  events.push(message);
  if (events.length > 4) {
    events.shift();
  }

  return events.join(', ');
});

const getPositionFromEvent = (e) => {
  const touch = (e.touches && e.touches[0]) || {};
  const _x = e.clientX || touch.clientX;
  const _y = e.clientY || touch.clientY;

  return new Vector(_x, _y);
};

class App {
  mousemovedelay = 150;

  running = false;

  constructor() {
    this.typewriter = new TypeWriter();
  }

  start = () => {
    if (this.running) return;

    this.running = true;
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

  handleMouseDown = (e) => {
    eventLog.log('mousedown');
    // ignore right click
    if (e.button === 2) return;

    // mousemove would be expensive, so we add it only after the mouse is down
    this.mouseuptimeout = window.setTimeout(() => {
      this.mouseDownStartPos = getPositionFromEvent(e);

      document.addEventListener('touchmove', this.handleMouseMove);
      document.addEventListener('mousemove', this.handleMouseMove);
    }, this.mousemovedelay);
  };

  handleTouchStart = (e) => {
    eventLog.log('touchstart');
    e.preventDefault();
    e.stopPropagation();

    if (e.touches && e.touches.length === 2) {
      // todo: work on zooming
      // (https://codepen.io/bozdoz/pen/xxEmJyx?editors=0011)
      return false;
    }
    return this.handleMouseDown(e);
  };

  handleMouseMove = (e) => {
    eventLog.log('mouse move');
    const _position = getPositionFromEvent(e)._subtract(this.mouseDownStartPos);

    // fake canvas moving by cheaply altering css
    // TODO: move to util function
    const x = `${_position.x}px`;
    const y = `${_position.y}px`;

    // avoid Cumulative Layout Shift: https://web.dev/cls/
    container.style.transform = `translate(${x}, ${y})`;

    this.typewriter.cursor.clear();
  };

  handleMouseUp = (e) => {
    eventLog.log('mouseup');
    this.removeMoveEvent();

    if (this.mouseDownStartPos) {
      // reposition canvas if mouse moved
      const _position = getPositionFromEvent(e).subtract(
        this.mouseDownStartPos
      );

      this.typewriter.reposition(_position);
      this.mouseDownStartPos = null;
    } else {
      // act as if it were just a click handler
      this.updateCursor(e);
    }
  };

  handleTouchEnd = (e) => {
    eventLog.log('touchend');
    this.handleMouseUp(e);
  };

  updateCursor = (e) => {
    const _position = getPositionFromEvent(e);
    this.typewriter.cursor.moveToClick(_position);
    this.typewriter.focusText();
  };

  removeMoveEvent = () => {
    window.clearTimeout(this.mouseuptimeout);
    document.removeEventListener('touchmove', this.handleMouseMove);
    document.removeEventListener('mousemove', this.handleMouseMove);
  };
}

export default new App();
