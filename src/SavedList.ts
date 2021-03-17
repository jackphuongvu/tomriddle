import createElement from './utils/createElement';
import * as Storage from './Storage';
import prettyDate from './utils/prettyDate';

// TODO: add search
class SavedList {
  // TODO: might need to separate these backdrops into a new class
  backdrop = createElement('div', {
    className: 'backdrop dialog-backdrop',
  });

  dialog = createElement('div', {
    className: 'popup dialog saved-list',
  });

  dialogBody = createElement('div', {
    className: 'dialog-body',
  });

  clickCallback: (si: Storage.SavedItem) => void | boolean = () => {};

  editCallback: (si: Storage.SavedItem) => void | boolean = () => {};

  deleteCallback: (si: Storage.SavedItem) => void | boolean = () => {};

  closeCallback: () => void = () => {};

  // TODO: might be able to extend from Dialog.ts
  constructor(title: string) {
    this.dialog.setAttribute('role', 'dialog');

    this.dialog.appendChild(
      createElement('header', {
        className: 'dialog-header',
        innerHTML: title,
      })
    );

    this.backdrop.addEventListener('click', ({ target }) => {
      if (target === this.backdrop) {
        this.close();
      }
    });

    this.refreshList();

    this.dialog.appendChild(this.dialogBody);
    this.backdrop.appendChild(this.dialog);
  }

  getSaved = (): HTMLElement[] => {
    const saved = Storage.getInfo();

    return saved.data.map(this.formatSaved);
  };

  formatSaved = (savedItem: Storage.SavedItem) => {
    const { name, created } = savedItem;
    const listitem = createElement('li', {
      className: 'saved-item',
      onclick: () => {
        this.clickCallback(savedItem);
        this.close();
      },
    });

    const loadButton = createElement('span', {
      className: 'saved-title-container',
    });

    const title = createElement('span', {
      className: 'saved-title',
      innerHTML: name,
    });

    const createdElem = createElement('span', {
      className: 'saved-date-created',
      innerHTML: prettyDate(created),
      title: new Date(created).toLocaleString(),
    });

    loadButton.appendChild(title);
    loadButton.appendChild(createdElem);

    const edit = createElement('button', {
      className: 'edit-saved',
      innerHTML: '✏️',
      onclick: () => {
        this.editCallback(savedItem);
      },
    });

    const deleteItem = createElement('button', {
      className: 'delete-saved',
      innerHTML: '🗑',
      onclick: (e) => {
        // delete button is inside of view button :D
        e.stopImmediatePropagation();
        this.deleteCallback(savedItem);
      },
    });

    listitem.appendChild(loadButton);
    listitem.appendChild(edit);
    listitem.appendChild(deleteItem);

    return listitem;
  };

  destroy() {
    this.backdrop?.parentNode?.removeChild(this.backdrop);
  }

  onClick = (cb: this['clickCallback']): this => {
    this.clickCallback = cb;

    return this;
  };

  onEdit = (cb: this['editCallback']): this => {
    this.editCallback = cb;

    return this;
  };

  onDelete = (cb: this['deleteCallback']): this => {
    this.deleteCallback = cb;

    return this;
  };

  onClose = (cb: () => void): this => {
    this.closeCallback = cb;

    return this;
  };

  open() {
    document.body.appendChild(this.backdrop);
  }

  close() {
    this.closeCallback();
    this.destroy();
  }

  refreshList() {
    // TODO: do something if empty
    const savedItems = this.getSaved();
    const savedList = createElement('ul', {
      className: 'saved-list',
    });

    // clear list
    for (const child of Array.from(this.dialogBody.children)) {
      child.parentNode?.removeChild(child);
    }

    // add list
    for (const item of savedItems) {
      savedList.appendChild(item);
    }

    this.dialogBody.appendChild(savedList);
  }
}

export default SavedList;
