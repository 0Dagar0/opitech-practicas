using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;
using OpiSupport.Domain.Entities;
using System;
using System.Linq;
using System.Security.Cryptography;
using BCrypt.Net;

namespace OpiSupport.Infrastructure.Data
{
    public static class DbContextSeed
    {
        public static void Seed(IServiceProvider serviceProvider)
        {
            using var context = serviceProvider.GetRequiredService<ApplicationDbContext>();
            var configuration = serviceProvider.GetRequiredService<IConfiguration>();

            // 1. Crear categorías si no existen
            if (!context.Categories.Any())
            {
                context.Categories.AddRange(
                    new Category { Name = "Hardware" },
                    new Category { Name = "Software" },
                    new Category { Name = "Red" },
                    new Category { Name = "Infraestructura / Instalaciones" },
                    new Category { Name = "Otro" }
                );
            }

            // 2. Crear áreas de reporte si no existen
            if (!context.Areas.Any())
            {
                context.Areas.AddRange(
                    new Area { Name = "Sistemas / TI" },
                    new Area { Name = "Recursos Humanos" },
                    new Area { Name = "Contabilidad / Finanzas" },
                    new Area { Name = "Operaciones / Planta" },
                    new Area { Name = "Dirección / Gerencia" },
                    new Area { Name = "Ventas / Comercial" },
                    new Area { Name = "Logística / Bodega" },
                    new Area { Name = "Servicios Generales / Mantenimiento" }
                );
            }

            // 3. Crear configuración del sistema si no existe
            if (!context.SystemConfigs.Any())
            {
                context.SystemConfigs.Add(
                    new SystemConfig { Key = "MaxTicketsPerTechnician", Value = "5" }
                );
            }

            // 4. Crear usuario supervisor de ejemplo (si no existe)
            if (!context.Users.Any())
            {
                // La contraseña NO vive en el código: se lee de configuración
                // (User Secrets en desarrollo, variables de entorno en despliegue).
                var supervisorPassword = configuration["Seed:SupervisorPassword"];

                if (string.IsNullOrWhiteSpace(supervisorPassword))
                {
                    throw new InvalidOperationException(
                        "La base de datos no tiene usuarios y no se configuró 'Seed:SupervisorPassword'. " +
                        "Ejecuta en Backend/OpiSupport.API: dotnet user-secrets set \"Seed:SupervisorPassword\" \"<contraseña>\"");
                }

                var passwordHash = BCrypt.Net.BCrypt.HashPassword(supervisorPassword);
                context.Users.Add(new User
                {
                    FullName = "Supervisor Principal",
                    EmployeeCode = "SUP-001",
                    Email = "supervisor@opitech.com",
                    PasswordHash = passwordHash,
                    Role = "Supervisor",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                });
            }

            // Crear usuario "Sistema" (para procesos automáticos como SLA)
            if (!context.Users.Any(u => u.EmployeeCode == "SYS-000"))
            {
                // El usuario "Sistema" no inicia sesión: se le asigna una contraseña aleatoria
                // que se descarta al terminar el seed, para que no exista una clave conocida.
                var randomPassword = Convert.ToBase64String(RandomNumberGenerator.GetBytes(32));
                var passwordHash = BCrypt.Net.BCrypt.HashPassword(randomPassword);
                context.Users.Add(new User
                {
                    FullName = "Sistema",
                    EmployeeCode = "SYS-000",
                    Email = "system@opitech.com",
                    PasswordHash = passwordHash,
                    Role = "Sistema",        // Nuevo rol (no tiene permisos de login)
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    ActiveReopenedCount = 0
                });
            }


            // 5. Guardar todos los cambios en la base de datos
            context.SaveChanges();
        }
    }
}