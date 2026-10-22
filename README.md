# Opitech · Prácticas de Desarrollo

Repositorio con los ejercicios, retos y proyectos que desarrollé durante mi **etapa productiva en Opitech** (2026).

Reúne prácticas de backend en **C# / .NET**, frontend en **Angular** y **React**, y ejercicios de **SQL** y **arquitectura por capas**.

> El proyecto final de la etapa (**OpiSupport / Opidesk**) está en desarrollo y se publicará cuando esté terminado.

---

## Índice

- [Estructura](#estructura)
- [Proyectos de backend](#proyectos-de-backend)
- [Proyectos de frontend](#proyectos-de-frontend)
- [Requisitos](#requisitos)
- [Cómo ejecutar](#cómo-ejecutar)
- [Convenciones](#convenciones)

---

## Estructura

```
opitech-practicas/
├─ practicas/
│  ├─ backend/
│  │  ├─ 01-linq/                     Ejercicios de LINQ
│  │  ├─ 02-biblioteca-app/           POO: biblioteca
│  │  ├─ 03-payment-system/           POO: medios de pago
│  │  ├─ 04-refactoring/              Ejercicios de refactorización
│  │  ├─ 05-inyeccion-dependencias/   Inyección de dependencias por capas
│  │  ├─ 06-expense-tracker/          API de gastos
│  │  ├─ 07-library-management/       API por capas + JWT + PostgreSQL + tests
│  │  ├─ 08-my-library/               API por capas (biblioteca)
│  │  └─ sql/                         Ejercicios de SQL (clínica)
│  └─ frontend/
│     ├─ angular-bills-app/           Angular + NgRx
│     ├─ react-triqui/                React + Vite
│     └─ typescript-tarea/            Ejercicio de TypeScript
└─ README.md
```

---

## Proyectos de backend

Todos en **C# / .NET 10**.

| Proyecto | Descripción | Tipo | Ejecutar |
|---|---|---|---|
| [`01-linq`](practicas/backend/01-linq) | Consultas LINQ sobre colecciones en memoria (`Data/SampleData.cs`) | Consola | `dotnet run --project practicas/backend/01-linq` |
| [`02-biblioteca-app`](practicas/backend/02-biblioteca-app) | Modelado con interfaces y herencia: materiales, préstamos y usuarios | Consola | `dotnet run --project practicas/backend/02-biblioteca-app` |
| [`03-payment-system`](practicas/backend/03-payment-system) | Polimorfismo aplicado a medios de pago y procesamiento de órdenes | Consola | `dotnet run --project practicas/backend/03-payment-system` |
| [`04-refactoring`](practicas/backend/04-refactoring) | Refactorizaciones sucesivas de un mismo código (versiones 1 a 5) | Consola | `dotnet run --project practicas/backend/04-refactoring` |
| [`05-inyeccion-dependencias`](practicas/backend/05-inyeccion-dependencias) | Registro de servicios con `AddScoped` y repositorio en memoria | Web API | [ver README](practicas/backend/05-inyeccion-dependencias/README.md) |
| [`06-expense-tracker`](practicas/backend/06-expense-tracker) | API para registrar y consultar gastos | Web API | [ver README](practicas/backend/06-expense-tracker/README.md) |
| [`07-library-management`](practicas/backend/07-library-management) | Reto de arquitectura: 4 capas, JWT, EF Core + PostgreSQL y pruebas | Web API | [ver README](practicas/backend/07-library-management/README.md) |
| [`08-my-library`](practicas/backend/08-my-library) | API organizada en Domain / Application / Infrastructure / API | Web API | [ver README](practicas/backend/08-my-library/README.md) |
| [`sql`](practicas/backend/sql) | Ejercicios de DDL/DML sobre un esquema de clínica | Scripts | Abrir los `.sql` en pgAdmin o ejecutar con `psql` |

## Proyectos de frontend

| Proyecto | Descripción | Stack |
|---|---|---|
| [`angular-bills-app`](practicas/frontend/angular-bills-app) | Gestión de facturas y pagos, con estado global y formularios reactivos | Angular + NgRx |
| [`react-triqui`](practicas/frontend/react-triqui) | Juego de tres en línea con hooks personalizados | React + Vite |
| [`typescript-tarea`](practicas/frontend/typescript-tarea) | Ejercicio de tipado en TypeScript (`index.ts`) | TypeScript |

---

## Requisitos

| Herramienta | Versión usada |
|---|---|
| .NET SDK | 10.0 |
| Node.js | 20 o superior |
| PostgreSQL | 18 (solo para `07-library-management`) |

---

## Cómo ejecutar

**Backend (consola)**

```bash
dotnet run --project practicas/backend/01-linq
```

**Backend (Web API)**

```bash
dotnet run --project practicas/backend/06-expense-tracker
```

Swagger queda disponible en la URL que indique la consola (normalmente `http://localhost:<puerto>/swagger`).

**Frontend**

```bash
cd practicas/frontend/react-triqui
npm install
npm run dev
```

```bash
cd practicas/frontend/angular-bills-app
npm install
npm start
```

---

## Convenciones

- **Commits** con el formato `tipo(alcance): descripción` — por ejemplo `feat(api): agregar endpoint de préstamos`.
- **Ramas** por tarea: `feat/…`, `fix/…`, `docs/…`, `chore/…`.
- **Sin credenciales en el repositorio.** Las cadenas de conexión y claves JWT se configuran con
  *User Secrets* en desarrollo y con variables de entorno en despliegue. Ver el
  [README de `07-library-management`](practicas/backend/07-library-management/README.md#configuración-de-secretos).

---

## Autor

**William Manuel Bolívar Hernández** — [@0Dagar0](https://github.com/0Dagar0)
