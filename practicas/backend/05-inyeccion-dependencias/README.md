# 05 · Inyección de dependencias

Ejercicio para entender el **registro y ciclo de vida de servicios** en ASP.NET Core.

## Qué demuestra

- Registro con `AddScoped`, que crea **una instancia por petición HTTP**.
- Separación en capas: `Domain`, `Application` y `API`.
- Uso de una interfaz (`IBookRepository`) con una implementación **en memoria**, para no depender de una base de datos.

```csharp
builder.Services.AddScoped<IBookRepository, InMemoryBookRepository>();
builder.Services.AddScoped<BookService>();
```

## Ejecutar

```bash
dotnet run --project practicas/backend/05-inyeccion-dependencias/ServiciosEInyeccionDependencias.API
```

Swagger: `http://localhost:<puerto>/swagger`

## Estructura

```
05-inyeccion-dependencias/
├─ ServiciosEInyeccionDependencias.API/          Controladores y Program.cs
├─ ServiciosEInyeccionDependencias.Application/  DTOs, interfaces, repositorio en memoria y servicios
└─ ServiciosEInyeccionDependencias.Domain/       Entidades
```
