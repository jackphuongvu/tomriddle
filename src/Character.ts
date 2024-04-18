import { textCtx } from './helpers/getElements';
import Vector from './utils/Vector';

const ALPHA_MARGIN = 0.06;
const ROTATE_MARGIN = 0.05;
const TRANSLATE_MARGIN = 0.2;
const GLOBAL_ALPHA = 0.72;

function randMargin(num: number, margin: number) {
  const min = num - margin;
  const max = num + margin;
  const value = Math.random() * (max - min) + min;
  return value;
}

type CharacterTypewriter = Pick<
  import('./Typewriter').TypeWriter,
  'canvasOffset'
>;

export class Character extends Vector {
  s: string;

  rotate: number;

  alpha: number;

  typewriter: CharacterTypewriter;

  constructor(
    typewriter: CharacterTypewriter,
    charStr: string,
    _x: number,
    _y: number
  ) {
    // save vector position
    super(randMargin(_x, TRANSLATE_MARGIN), randMargin(_y, TRANSLATE_MARGIN));

    this.s = charStr;
    this.rotate = randMargin(0, ROTATE_MARGIN);
    this.alpha = randMargin(GLOBAL_ALPHA, ALPHA_MARGIN);
    this.typewriter = typewriter;

    // save inverse of current typewriter offsets
    // useful for applying future changing offsets
    // in redraw functions
    this._subtract(typewriter.canvasOffset);

    this.draw();
  }

  draw = () => {
    // console.log('draw');
    // console.log('this.s', this.s);
    // apply current typewriter offsets
    const vec = this.add(this.typewriter.canvasOffset);
    // console.log('vec', vec);
    //
    // console.log('textCtx', textCtx);
    if (textCtx) {
      textCtx.save();
      textCtx.translate(vec.x, vec.y);
      textCtx.rotate(this.rotate);
      textCtx.globalAlpha = this.alpha;
      textCtx.fillText(this.s, 0, 0);
      textCtx.restore();
    }
  };
}
