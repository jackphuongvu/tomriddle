import createElement from './utils/createElement';

class Dialog {
  dialog: HTMLElement | null;

  backdrop: HTMLElement | null;

  constructor() {
    this.dialog = createElement('div', {
      className: 'dialog',
      id: 'dialog',
    });

    this.dialog.setAttribute('role', 'dialog');

    this.backdrop = createElement('div', {
      className: 'backdrop dialog-backdrop',
      id: 'dialog-backdrop',
    });

    this.backdrop.appendChild(this.dialog);
  }

  destroy() {
    this.backdrop?.parentNode?.removeChild(this.backdrop);

    this.dialog = null;
    this.backdrop = null;
  }

  setTitle = () => {
    // sets title
  };

  addInput = () => {
    // adds input
  };

  onSubmit = (cb: () => void) => {
    // do something with inputs
    // maybe serialize the inputs
    // add cb to onsubmit functions
  };

  handleSubmit = () => {
    // destroy if cb is successful
    this.destroy();
  };

  handleClose = () => {
    // fade out animation?
    this.destroy();
  };
}

export default Dialog;
