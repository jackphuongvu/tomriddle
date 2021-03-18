import Dialog from './Dialog';

describe('Dialog', () => {
  const title = 'Do you have a title?';
  let dialog: Dialog;

  beforeEach(() => {
    dialog = new Dialog(title);
  });

  it('has a title', () => {
    expect(dialog.dialog?.textContent).toContain(title);
  });

  it('has a cancel button', () => {
    expect(dialog.dialog?.textContent).toContain('Cancel');
  });

  it('has an OK button', () => {
    expect(dialog.dialog?.textContent).toContain('OK');
  });

  it('is added to document', () => {
    dialog.open();
    expect(document.querySelectorAll('button')).toHaveLength(2);
  });

  it('can dismiss the dialog with the cancel button', () => {
    jest.spyOn(Dialog.prototype, 'close');
    dialog.cancelButton.click();
    expect(dialog.close).toHaveBeenCalled();
  });

  it('calls onClose after cancel button click', () => {
    const onClose = jest.fn();
    dialog.onClose(onClose);
    dialog.cancelButton.click();
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onSubmit after submit button click', () => {
    const onSubmit = jest.fn();
    dialog.onSubmit(onSubmit);
    dialog.submitButton.click();
    expect(onSubmit).toHaveBeenCalled();
  });

  it('can add inputs', () => {
    dialog.addInput('Name Input', {
      type: 'text',
    });

    dialog.open();

    const label = document.querySelector('label');
    const input = document.querySelector('input');

    expect(label?.innerHTML).toBe('Name Input');

    expect(label?.htmlFor).toBe(input?.id);
  });

  it('sends formdata in onSubmit', () => {
    const onSubmit = jest.fn();
    const value = 'First name';

    dialog.addInput('Name Input', {
      value,
      type: 'text',
      name: 'name',
    });

    dialog.onSubmit(onSubmit);
    dialog.submitButton.click();

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: value,
      })
    );
  });

  it('calls onClose after submit button click', () => {
    const onClose = jest.fn();
    dialog.onClose(onClose);
    dialog.submitButton.click();
    expect(onClose).toHaveBeenCalled();
  });

  it('does not call onClose if onSubmit returns false', () => {
    const onClose = jest.fn();
    const onSubmit = jest.fn(() => false);
    dialog.onClose(onClose);
    dialog.onSubmit(onSubmit);
    dialog.submitButton.click();
    expect(onClose).not.toHaveBeenCalled();
  });
});
