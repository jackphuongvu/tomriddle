import createElement from './utils/createElement';
import getPositionFromEvent from './utils/getPositionFromEvent';

type AnyFunction = (...args: any[]) => void;

interface MenuItem {
  callback?: AnyFunction;
  href?: string;
}

const isAnchorElement = (a: HTMLElement): a is HTMLAnchorElement =>
  a.tagName === 'A';

class Menu {
  menu: HTMLElement;

  menuBackdrop: HTMLElement;

  constructor() {
    this.events('on');

    this.menu = createElement('div', {
      className: 'menu',
      id: 'menu',
    });

    this.menuBackdrop = createElement('div', {
      className: 'menu-backdrop',
      id: 'menu-backdrop',
    });

    this.menuBackdrop.appendChild(this.menu);
  }

  destroy() {
    this.events('off');
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

    this.menu.appendChild(menuItem);
  }

  events(onoff = 'on') {
    const method = onoff === 'on' ? 'addEventListener' : 'removeEventListener';

    const events: Record<string, AnyFunction> = {
      contextmenu: this.handleContextMenu,
    };

    // eslint-disable-next-line guard-for-in
    for (const key in events) {
      document.body[method](key, events[key]);
    }
  }

  handleContextMenu = (e: MouseEvent) => {
    if (this.menu.contains(e.target as Node)) return;

    // open menu at position
    const buffer = 5;
    const { x, y } = getPositionFromEvent(e).add(buffer);

    e.preventDefault();

    this.openMenu({ x, y });
  };

  openMenu = ({ x, y }: { x: number; y: number }) => {
    if (this.menuBackdrop.parentNode == null) {
      document.body.appendChild(this.menuBackdrop);
      document.body.addEventListener('click', this.handleClose);
    }

    this.menu.style.top = `${y}px`;
    this.menu.style.left = `${x}px`;
  };

  handleClose = (e: MouseEvent) => {
    if (!this.menu.contains(e.target as Node)) {
      this.menuBackdrop.parentNode?.removeChild(this.menuBackdrop);
      document.body.removeEventListener('click', this.handleClose);
    }
  };
}

export default Menu;
