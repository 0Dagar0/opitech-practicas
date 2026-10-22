# Angular · Bills App

Aplicación Angular para la gestión de facturas y pagos.

## Stack

- **Angular 21** (standalone components)
- **NgRx** (`@ngrx/store`, `@ngrx/effects`, `@ngrx/store-devtools`) para el estado global
- **Reactive Forms** para los formularios de pago
- **Vitest** para pruebas

## Ejecutar

```bash
npm install
npm start
```

Servidor de desarrollo: `http://localhost:4200`

## Scripts

| Comando | Qué hace |
|---|---|
| `npm start` | Servidor de desarrollo con recarga |
| `npm run build` | Compila a `dist/` |
| `npm run watch` | Compila en modo observación |
| `npm test` | Ejecuta las pruebas con Vitest |

## Estructura

```
src/
├─ app/
│  ├─ core/       Guards, modelos y estado global (NgRx: store/auth)
│  ├─ features/   Funcionalidades (login, expenses)
│  ├─ layout/     Header, sidebar, footer y contenedor
│  └─ shared/     Componentes reutilizables (modal)
└─ enviroments/   Configuración por entorno
```
