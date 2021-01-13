export const container = document.getElementById('container');
export const textInput = document.getElementById('text-input');
export const textCanvas = document.getElementById('text-canvas');
export const cursorCanvas = document.getElementById('cursor-canvas');
export const textCtx = textCanvas.getContext('2d', { alpha: true });
export const cursorCtx = cursorCanvas.getContext('2d');
