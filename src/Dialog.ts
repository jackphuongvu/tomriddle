import createElement from './utils/createElement';

let inputCount = 0;

class Dialog {
  backdrop = createElement('div', {
    className: 'backdrop dialog-backdrop',
  });

  dialog = createElement('div', {
    className: 'dialog',
  });

  dialogForm = createElement('form');

  dialogFooter = createElement('div', {
    className: 'dialog-footer',
  });

  submitButton: HTMLButtonElement | null;

  cancelButton: HTMLButtonElement | null;

  submitCallback: (a: Record<string, any>) => void | boolean = () => {};

  closeCallback: () => void = () => {};

  constructor(title: string) {
    this.dialog.setAttribute('role', 'dialog');

    this.dialog.appendChild(
      createElement('header', {
        className: 'dialog-header',
        innerHTML: title,
      })
    );

    const dialogBody = createElement('div', {
      className: 'dialog-body',
    });

    dialogBody.appendChild(this.dialogForm);

    this.dialog.appendChild(dialogBody);

    this.submitButton = createElement('button', {
      className: 'button button-primary',
      type: 'button',
      innerHTML: 'OK',
      onclick: () => {
        if (this.submitCallback(this.formData) !== false) {
          this.close();
        }
      },
    });

    this.cancelButton = createElement('button', {
      className: 'button',
      type: 'button',
      innerHTML: 'Cancel',
      onclick: () => this.close(),
    });

    this.dialogFooter.appendChild(this.cancelButton);
    this.dialogFooter.appendChild(this.submitButton);

    this.dialog.appendChild(this.dialogFooter);
    this.backdrop.appendChild(this.dialog);
  }

  get formData() {
    const inputs = Array.from(this.dialogForm.elements) as HTMLInputElement[];
    const obj: Record<string, any> = {};

    for (const input of inputs) {
      obj[input.name] = input.value;
    }

    return obj;
  }

  addInput = (label: string, atts: Partial<Writable<HTMLInputElement>>) => {
    const input = createElement('input', atts);

    inputCount += 1;
    input.id = `dialog-input-${inputCount}`;

    const labelElem = createElement('label', {
      htmlFor: input.id,
      innerHTML: label,
    });

    this.dialogForm?.appendChild(labelElem);
    this.dialogForm?.appendChild(input);
  };

  onSubmit = (cb: () => void) => {
    // do something with inputs
    // maybe serialize the inputs
    // add cb to onsubmit functions
    this.submitCallback = cb;
  };

  onClose = (cb: () => void) => {
    this.closeCallback = cb;
  };

  open() {
    document.body.appendChild(this.backdrop!);
  }

  close() {
    this.closeCallback();
    this.backdrop?.parentNode?.removeChild(this.backdrop);
  }
}

export default Dialog;
