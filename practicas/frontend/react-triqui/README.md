# React · Triqui

Juego de tres en línea (triqui) hecho con React y Vite.

## Stack

- React 19
- Vite
- ESLint

## Ejecutar

```bash
npm install
npm run dev
```

Servidor de desarrollo: `http://localhost:5173`

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Compila a `dist/` |
| `npm run preview` | Sirve la compilación |
| `npm run lint` | Análisis con ESLint |

## Estructura

```
src/
├─ Components/
│  ├─ Board.jsx        Tablero de 3×3
│  ├─ Square.jsx       Cada casilla
│  └─ PLayerInput.jsx  Entrada de nombres de jugadores
├─ Hooks/
│  └─ useTriquiGame.js Lógica del juego (turnos y ganador)
├─ App.jsx
└─ main.jsx
```
