/**
 * Configuración común de las pruebas.
 *
 * jsdom (el navegador simulado que usa Vitest) no implementa canvas, así que
 * los componentes que dibujan (starfield, fondo del universo y constelación)
 * mostraban un aviso al crear el contexto 2D. Aquí se devuelve un contexto
 * simulado que no dibuja nada, pero permite que los componentes se prueben.
 */
const contexto2dFalso = {
  clearRect: () => undefined,
  beginPath: () => undefined,
  moveTo: () => undefined,
  lineTo: () => undefined,
  stroke: () => undefined,
  arc: () => undefined,
  fill: () => undefined,
  fillRect: () => undefined,
  save: () => undefined,
  restore: () => undefined,
  fillText: () => undefined,
  createRadialGradient: () => ({ addColorStop: () => undefined }),
  strokeStyle: '',
  fillStyle: '',
  lineWidth: 1,
  shadowBlur: 0,
  shadowColor: '',
  font: '',
  globalAlpha: 1
};

HTMLCanvasElement.prototype.getContext = (() =>
  contexto2dFalso) as unknown as typeof HTMLCanvasElement.prototype.getContext;
