# 07 · Library Management

Reto de **arquitectura por capas** aplicado a la gestión de una biblioteca: libros, autores, categorías, copias, préstamos y reservas, con autenticación JWT.

## Arquitectura

```
07-library-management/
├─ LibraryManagement.Domain/          Entidades e interfaces del dominio
├─ LibraryManagement.Application/     Servicios y casos de uso
├─ LibraryManagement.Infrastructure/  Repositorios y acceso a datos (EF Core + PostgreSQL)
├─ LibraryManagement.WebApi/          Controllers, JWT y configuración
├─ LibraryManagement.Application.Tests/  Pruebas con xUnit y Moq
└─ MiProyecto.Tests/                  Proyecto de pruebas secundario (aprendizaje)
```

La regla de dependencias va siempre hacia el dominio: `WebApi → Application → Domain`,
`Infrastructure → Application`.

## Endpoints

| Controlador | Ruta base |
|---|---|
| Auth | `/api/Auth` |
| Authors | `/api/Authors` |
| Categories | `/api/Categories` |
| Book | `/api/Book` |
| BookCopies | `/api/BookCopies` |
| Loans | `/api/Loans` |
| Reservations | `/api/Reservations` |
| Users | `/api/Users` |

Swagger incluye el botón **Authorize** para probar los endpoints protegidos con el token JWT.

## Requisitos

- .NET SDK 10
- PostgreSQL 18 con una base de datos llamada `librarymanagementdb`

## Configuración de secretos

La cadena de conexión y la clave JWT **no están en el repositorio**. Se cargan con
*User Secrets* en desarrollo y con variables de entorno en despliegue.

```bash
dotnet user-secrets init --project practicas/backend/07-library-management/LibraryManagement.WebApi

dotnet user-secrets set "ConnectionStrings:DefaultConnection" \
  "Host=localhost;Port=5432;Database=librarymanagementdb;Username=postgres;Password=<tu-password>" \
  --project practicas/backend/07-library-management/LibraryManagement.WebApi

dotnet user-secrets set "Jwt:Key" "<clave-aleatoria-de-32-bytes-o-mas>" \
  --project practicas/backend/07-library-management/LibraryManagement.WebApi
```

En despliegue se usan las variables `ConnectionStrings__DefaultConnection` y `Jwt__Key`.
Si falta alguna, la aplicación **no arranca** y muestra el mensaje exacto de lo que falta.

> La clave JWT debe tener **al menos 32 bytes**: es el mínimo que exige HS256.

## Ejecutar

```bash
dotnet run --project practicas/backend/07-library-management/LibraryManagement.WebApi
```

## Pruebas

```bash
dotnet test practicas/backend/07-library-management/LibraryManagement.Application.Tests
```
