# 08 · My Library

API de biblioteca organizada en cuatro capas, como ejercicio de separación de responsabilidades.

## Estructura

```
08-my-library/
└─ src/
   ├─ MyLibrary.Domain/          Entidades
   ├─ MyLibrary.Application/     Servicios y contratos
   ├─ MyLibrary.Infrastructure/  Implementaciones
   └─ MyLibrary.API/             Controllers y configuración
```

## Ejecutar

```bash
dotnet run --project practicas/backend/08-my-library/src/MyLibrary.API
```

Swagger: `http://localhost:<puerto>/swagger`

## Notas

- No requiere base de datos.
- El controlador se llama `BoockController` (error de tipeo pendiente de renombrar a `BookController`).
