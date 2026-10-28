# OpiSupport — Backend

API REST para la gestión de tickets de soporte técnico (helpdesk) de OPI.
Construida con **.NET 8** siguiendo una arquitectura en capas con CQRS.

## Estructura

| Proyecto | Responsabilidad |
|---|---|
| `OpiSupport.Domain` | Entidades y reglas de negocio puras (incluye `TicketStatusTransitions`). |
| `OpiSupport.Application` | Casos de uso (comandos y consultas con MediatR), DTOs, interfaces de repositorios. |
| `OpiSupport.Infrastructure` | Acceso a datos (EF Core + PostgreSQL), repositorios, servicios y migraciones. |
| `OpiSupport.API` | Controladores, autenticación JWT, configuración y arranque. |
| `OpiSupport.Tests` | Pruebas unitarias (xUnit + Moq). |

## Requisitos

- .NET SDK 8.0
- PostgreSQL 15 o superior
- (Opcional) `dotnet-ef` para gestionar migraciones

## Configuración de secretos

La cadena de conexión y la clave JWT **no** están en `appsettings.json`.
Se guardan con **User Secrets**, que solo se cargan cuando el entorno es `Development`.

```powershell
cd Backend\OpiSupport.API

# 1. Registrar el proyecto en el almacén de secretos (solo la primera vez)
dotnet user-secrets init

# 2. Guardar los valores (te los pedirá sin mostrarlos en pantalla)
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "<cadena de conexión>"
dotnet user-secrets set "Jwt:Key" "<clave de firma>"
dotnet user-secrets set "Seed:SupervisorPassword" "<contraseña del supervisor de ejemplo>"

# 3. Comprobar qué claves hay guardadas (no muestra los valores)
dotnet user-secrets list
```

> Los secretos se almacenan fuera del repositorio, en
> `%APPDATA%\Microsoft\UserSecrets\<id>\secrets.json`, y nunca se versionan.

`Seed:SupervisorPassword` es la contraseña del usuario `Supervisor` que crea el *seed* en una base
de datos vacía. Si no está configurada, el arranque se detiene con un mensaje que explica cómo
crearla.

## Base de datos

```powershell
# Aplicar las migraciones existentes
dotnet ef database update --project Backend\OpiSupport.Infrastructure --startup-project Backend\OpiSupport.API

# Crear una migración nueva después de cambiar el modelo
dotnet ef migrations add NombreDeLaMigracion --project Backend\OpiSupport.Infrastructure --startup-project Backend\OpiSupport.API
```

Si `dotnet ef` no está disponible:

```powershell
dotnet tool install --global dotnet-ef --version 8.*
```

## Ejecutar la API

```powershell
$env:ASPNETCORE_ENVIRONMENT = "Development"
dotnet run --project Backend\OpiSupport.API
```

- API: `http://localhost:5030`
- Swagger: `http://localhost:5030/swagger`

El perfil `http` de `launchSettings.json` ya activa `Development`, así que al ejecutar
desde Visual Studio o con `dotnet run` los secretos se cargan automáticamente.
Si ejecutas la DLL compilada directamente, establece `ASPNETCORE_ENVIRONMENT=Development`
o proporciona los valores por variables de entorno.

> **En Producción** no existen User Secrets: la cadena de conexión y `Jwt:Key`
> deben llegar por variables de entorno o por el gestor de secretos del servidor.

## Ejecutar las pruebas

```powershell
dotnet test Backend\OpiSupport.Tests\OpiSupport.Tests.csproj
```

## Endpoints principales

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/api/auth/login` | Inicio de sesión (devuelve el JWT). |
| `GET` | `/api/tickets` | Lista paginada de tickets (con `page`, `size` y filtros). |
| `GET` | `/api/tickets/{id}` | Detalle del ticket con historial y comentarios. |
| `POST` | `/api/tickets` | Crear ticket. |
| `PUT` | `/api/tickets/{id}/status` | Cambiar estado (exige comentario al resolver). |
| `PUT` | `/api/tickets/{id}/assign` | Reasignar ticket (Supervisor o Sistema). |
| `POST` | `/api/tickets/{id}/comments` | Añadir comentario. |

## Flujo de estados

```
Abierto ──► En Proceso ──► Resuelto ──► Cerrado
             ▲                 │            │
             │                 ▼            │
             └────────── Reabierto ◄────────┘
```

- `Asignado → En Proceso` también está permitido.
- Solo se puede reabrir dentro de las **48 horas** siguientes a la resolución.
