export const container = document.getElementById('container') as HTMLElement;
export const textInput = document.getElementById('text-input') as HTMLElement;
export const textCanvas = document.getElementById(
  'text-canvas'
) as HTMLCanvasElement;
export const cursorCanvas = document.getElementById(
  'cursor-canvas'
) as HTMLCanvasElement;
export const textCtx = textCanvas!.getContext('2d', { alpha: true });
export const cursorCtx = cursorCanvas!.getContext('2d');
