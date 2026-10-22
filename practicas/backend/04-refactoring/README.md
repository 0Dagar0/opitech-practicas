# 04 · Refactoring

Colección de ejercicios de **refactorización**: cada archivo muestra una versión (o un caso)
del mismo tipo de código, con el objetivo de hacerlo más legible y mantenible.

| Archivo | Contenido |
|---|---|
| `refactoring1.cs` | Cálculo de salarios con herencia (`Empleado`, `FullTime`, `FreeLance`) |
| `refactoring2.cs` | Cálculo de IVA sobre un total |
| `refctoring3.cs` | Descuentos sobre productos |
| `refactoring4.cs` | Confirmación de pedidos y notificación (`Pedido`, `EmailNotificador`) |
| `refactorin5.cs` | Obtención de iniciales de un nombre |

Es una **biblioteca de clases**, no un ejecutable: no hay punto de entrada porque el foco es
el código de cada ejemplo, no su ejecución.

```bash
dotnet build practicas/backend/04-refactoring/Refactoring.csproj
```
