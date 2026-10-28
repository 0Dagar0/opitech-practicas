# OpiSupport

**Sistema de gestión de tickets de soporte técnico (helpdesk) para OPI.**

Backend en **.NET 8** con arquitectura por capas y CQRS · Frontend en **React 19 + TypeScript**.

![.NET](https://img.shields.io/badge/.NET-8.0-512BD4?logo=dotnet&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15%2B-4169E1?logo=postgresql&logoColor=white)

---

## Índice

- [Descripción](#descripción)
- [Características](#características)
- [Stack](#stack)
- [Estructura](#estructura)
- [Requisitos](#requisitos)
- [Puesta en marcha](#puesta-en-marcha)
- [Endpoints principales](#endpoints-principales)
- [Flujo de estados](#flujo-de-estados)
- [Pruebas](#pruebas)
- [Seguridad](#seguridad)
- [Autor](#autor)

---

## Descripción

OpiSupport centraliza las solicitudes de soporte de una empresa: un colaborador reporta un
problema, el sistema lo clasifica y lo asigna a un técnico, y el ticket avanza por un flujo de
estados controlado hasta su cierre. El backend expone una API REST documentada con Swagger y el
frontend consume esa API mediante una SPA en React.

El proyecto reúne en una sola carpeta el **backend**, el **frontend** y su documentación técnica.

## Características

- **Autenticación con JWT** y cuatro roles: `Colaborador`, `Tecnico`, `Supervisor` y `Sistema`.
- **Gestión de tickets** con categoría, área de reporte, prioridad y descripción.
- **Máquina de estados centralizada** en `TicketStatusTransitions`, para que las transiciones válidas
  no dependan de cada controlador.
- **Reapertura limitada a 48 horas** desde la resolución del ticket.
- **Asignación automática** al técnico activo con menos tickets en curso (límite configurable, por
  defecto 5, en `SystemConfig`).
- **Historial de estados y comentarios** por ticket, incluida la trazabilidad de reasignaciones.
- **Monitor de SLA** en segundo plano (`BackgroundService`) que marca los tickets vencidos.
- **Paginación y filtros** en el listado de tickets.
- **Pruebas unitarias** del dominio y de los casos de uso.

## Stack

| Capa | Tecnologías |
|---|---|
| Backend | .NET 8 · ASP.NET Core · CQRS con MediatR · EF Core 8 · Npgsql |
| Seguridad | JWT Bearer · BCrypt |
| Base de datos | PostgreSQL 15 o superior |
| Frontend | React 19 · Vite 8 · TypeScript · Tailwind CSS |
| Formularios | React Hook Form · Zod · Axios |
| Pruebas | xUnit · Moq |
| Documentación API | Swagger / OpenAPI |

## Estructura

```
OpiSupport/
├─ Backend/
│  ├─ OpiSupport.Domain/          Entidades y reglas de negocio puras
│  ├─ OpiSupport.Application/     Casos de uso (CQRS), DTOs e interfaces
│  ├─ OpiSupport.Infrastructure/  EF Core, repositorios, servicios y migraciones
│  ├─ OpiSupport.API/             Controladores, autenticación JWT y arranque
│  └─ OpiSupport.Tests/           Pruebas unitarias (xUnit + Moq)
└─ Frontend/
   └─ opisupport-frontend/        SPA en React + Vite + TypeScript
```

Cada parte tiene su propio README con el detalle técnico:

- [Backend](Backend/README.md)
- [Frontend](Frontend/opisupport-frontend/README.md)

## Requisitos

| Herramienta | Versión |
|---|---|
| .NET SDK | 8.0 |
| Node.js | 20 o superior |
| PostgreSQL | 15 o superior |
| `dotnet-ef` (opcional) | 8.x, para gestionar migraciones |

## Puesta en marcha

### 1. Clonar el repositorio

```bash
git clone https://github.com/0Dagar0/opitech-practicas.git
cd opitech-practicas/Proyectos/OpiSupport
```

### 2. Configurar los secretos del backend

La cadena de conexión y la clave JWT **no** están en `appsettings.json`: se guardan con
**User Secrets**, que solo se cargan en el entorno `Development`.

```powershell
cd Backend\OpiSupport.API

dotnet user-secrets init
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "<cadena de conexión>"
dotnet user-secrets set "Jwt:Key" "<clave de firma>"
dotnet user-secrets set "Seed:SupervisorPassword" "<contraseña del supervisor de ejemplo>"

# Comprobar qué claves hay guardadas (no muestra los valores)
dotnet user-secrets list
```

### 3. Crear la base de datos y aplicar migraciones

```powershell
dotnet ef database update --project Backend\OpiSupport.Infrastructure --startup-project Backend\OpiSupport.API
```

Al arrancar, la aplicación ejecuta un *seed* que crea las categorías, las áreas de reporte, la
configuración del sistema y un usuario `Supervisor` de ejemplo (ver
`Backend/OpiSupport.Infrastructure/Data/DbContextSeed.cs`). **La contraseña de ese usuario se lee de
`Seed:SupervisorPassword`**, nunca del código: si la clave no está configurada y la base de datos no
tiene usuarios, el arranque se detiene con un mensaje que indica cómo crearla.

### 4. Ejecutar el backend

```powershell
dotnet run --project Backend\OpiSupport.API
```

- API: `http://localhost:5030`
- Swagger: `http://localhost:5030/swagger`

El perfil `http` de `launchSettings.json` ya activa `Development`, así que los User Secrets se
cargan automáticamente.

### 5. Ejecutar el frontend

```powershell
cd Frontend\opisupport-frontend
npm install
npm run dev
```

La aplicación queda en `http://localhost:5173` y consume la API desde
`http://localhost:5030/api` (configurado en `src/api/client.ts`).

Scripts disponibles:

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo con recarga en caliente |
| `npm run build` | Compilación de producción |
| `npm run lint` | Análisis estático con oxlint |
| `npm run preview` | Vista previa del build de producción |

## Endpoints principales

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/api/auth/login` | Inicio de sesión (devuelve el JWT) |
| `GET` | `/api/tickets` | Listado paginado de tickets con filtros |
| `GET` | `/api/tickets/{id}` | Detalle del ticket con historial y comentarios |
| `POST` | `/api/tickets` | Crear ticket |
| `PUT` | `/api/tickets/{id}/status` | Cambiar estado (exige comentario al resolver) |
| `PUT` | `/api/tickets/{id}/assign` | Reasignar ticket (Supervisor o Sistema) |
| `POST` | `/api/tickets/{id}/comments` | Añadir comentario |

El contrato completo está disponible en Swagger al ejecutar la API.

## Flujo de estados

```
Abierto ──► En Proceso ──► Resuelto ──► Cerrado
             ▲                 │            │
             │                 ▼            │
             └────────── Reabierto ◄────────┘
```

- `Asignado → En Proceso` también está permitido.
- Solo se puede reabrir dentro de las **48 horas** siguientes a la resolución.

## Pruebas

```powershell
dotnet test Backend\OpiSupport.Tests\OpiSupport.Tests.csproj
```

Las pruebas cubren las reglas del dominio (transiciones de estado) y los casos de uso principales
con dependencias simuladas con Moq.

## Seguridad

- **Ningún secreto se versiona.** Las cadenas de conexión y las claves JWT viven en User Secrets
  durante el desarrollo y en variables de entorno o en el gestor de secretos del servidor en
  producción.
- Las contraseñas se almacenan con **hash BCrypt**, nunca en texto plano.
- El rol `Sistema` existe para procesos automáticos y no se usa para iniciar sesión.

## Autor

**William Manuel Bolívar Hernández** — [@0Dagar0](https://github.com/0Dagar0)
