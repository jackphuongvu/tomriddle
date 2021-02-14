const colors = ['red', 'green', 'blue', 'orange', 'brown', 'purple', 'black'];

const positions = {
  topleft: 0,
  bottomleft: 0,
  bottomright: 0,
  topright: 0,
};

interface Props {
  position?: keyof typeof positions;
}

class Debugger {
  _formatter = (message: string): string => message;

  elem: HTMLDivElement;

  constructor({ position = 'topleft' }: Props = {}) {
    const div = document.createElement('div');

    this.elem = div;

    div.style.position = 'absolute';

    if (position.startsWith('top')) {
      div.style.top = `${positions[position]}em`;
    } else {
      div.style.bottom = `${positions[position]}em`;
    }

    if (position.endsWith('left')) {
      div.style.left = '0';
    } else {
      div.style.right = '0';
    }

    div.style.color = colors[positions[position]];

    document.body.appendChild(div);

    positions[position] += 1;
  }

  log(message: string): void {
    this.elem.innerText = this._formatter(message);
  }

  formatter(func: (a: string) => string): void {
    this._formatter = func;
  }
}

export default Debugger;
