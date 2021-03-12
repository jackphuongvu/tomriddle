import { cursorCanvas } from './helpers/getElements';
import createElement from './utils/createElement';
import getPositionFromEvent from './utils/getPositionFromEvent';
import positionElem from './utils/positionElem';

interface MenuItem {
  callback?: AnyFunction;
  href?: string;
}

const isAnchorElement = (a: HTMLElement): a is HTMLAnchorElement =>
  a.tagName === 'A';

const eventTarget = cursorCanvas;

class Menu {
  menu = createElement('div', {
    className: 'popup menu',
    id: 'menu',
  });

  menuBackdrop = createElement('div', {
    className: 'backdrop menu-backdrop',
    id: 'menu-backdrop',
  });

  constructor() {
    this.events('on');

    this.menu.setAttribute('role', 'list');

    this.menuBackdrop.appendChild(this.menu);
  }

  destroy() {
    this.events('off');
    this.menuBackdrop?.parentNode?.removeChild(this.menuBackdrop);
  }

  addMenuItem(innerText: string, { callback, href }: MenuItem = {}) {
    const tagname = href ? 'a' : 'div';
    const menuItem = createElement(tagname, {
      innerText,
      className: 'menu-item',
    });

    if (isAnchorElement(menuItem)) {
      menuItem.target = '_blank';
      menuItem.href = href!;
    }

    if (callback) {
      menuItem.addEventListener('click', callback);
    }

    if (callback || href) {
      // is clickable
      menuItem.classList.add('clickable');
    }

    menuItem.setAttribute('role', 'listitem');

    this.menu?.appendChild(menuItem);
  }

  events(onoff = 'on') {
    const method = onoff === 'on' ? 'addEventListener' : 'removeEventListener';

    const events: Record<string, AnyFunction> = {
      contextmenu: this.handleContextMenu,
    };

    // eslint-disable-next-line guard-for-in
    for (const key in events) {
      eventTarget[method](key, events[key]);
    }
  }

  handleContextMenu = (e: MouseEvent) => {
    if (this.menu?.contains(e.target as Node)) return;

    // open menu at position
    const buffer = 5;
    const { x, y } = getPositionFromEvent(e).add(buffer);

    e.preventDefault();

    this.openMenu({ x, y });
  };

  openMenu(position: { x: number; y: number }) {
    if (this.menuBackdrop?.parentNode == null) {
      document.body.appendChild(this.menuBackdrop!);
      document.body.addEventListener('click', this.handleClose);
    }

    positionElem(this.menu!, position);
  }

  closeMenu() {
    const elem = this.menuBackdrop;

    // TODO: add test for this
    if (!elem || elem.parentNode == null) {
      return;
    }

    // don't listen for more close events
    document.body.removeEventListener('click', this.handleClose);

    // actually remove things after exit animation
    const onExit = (e: AnimationEvent) => {
      if (e.target !== elem) return;
      elem.removeEventListener('animationend', onExit);
      elem.classList.remove('exit');
      elem.parentNode?.removeChild(elem);
    };

    elem.addEventListener('animationend', onExit);

    // trigger exit animation
    elem.classList.add('exit');
  }

  handleClose = ({ target }: MouseEvent) => {
    if (!this.menu?.contains(target as Node)) {
      this.closeMenu();
    }
  };
}

export default Menu;
