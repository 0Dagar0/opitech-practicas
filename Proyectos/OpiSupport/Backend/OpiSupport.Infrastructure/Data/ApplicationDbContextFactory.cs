using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using System;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Xml.Linq;

namespace OpiSupport.Infrastructure.Data
{
    public class ApplicationDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
    {
        public ApplicationDbContext CreateDbContext(string[] args)
        {
            // Configuración para las herramientas de migración (dotnet ef)
            var optionsBuilder = new DbContextOptionsBuilder<ApplicationDbContext>();

            // La cadena de conexión ya no vive en el código ni en appsettings.json:
            // se lee de User Secrets (o de appsettings.json como respaldo).
            var connectionString = LoadConnectionString();

            optionsBuilder.UseNpgsql(connectionString);

            return new ApplicationDbContext(optionsBuilder.Options);
        }

        /// <summary>
        /// Resuelve la cadena de conexión en el mismo orden que la aplicación:
        /// 1. User Secrets (entorno de Desarrollo).
        /// 2. appsettings.json del proyecto API.
        /// </summary>
        private static string LoadConnectionString()
        {
            var apiSettingsPath = FindApiSettingsPath();
            var apiProjectDir = Path.GetDirectoryName(apiSettingsPath)!;

            var fromUserSecrets = ReadFromUserSecrets(apiProjectDir);
            if (!string.IsNullOrWhiteSpace(fromUserSecrets))
                return fromUserSecrets!;

            using var document = JsonDocument.Parse(File.ReadAllText(apiSettingsPath));
            var connectionString = document.RootElement
                .GetProperty("ConnectionStrings")
                .GetProperty("DefaultConnection")
                .GetString();

            if (string.IsNullOrWhiteSpace(connectionString))
                throw new InvalidOperationException(
                    $"No se encontró la cadena de conexión. Configúrala con 'dotnet user-secrets set \"ConnectionStrings:DefaultConnection\" \"...\"' " +
                    $"o en {apiSettingsPath}");

            return connectionString;
        }

        /// <summary>
        /// Lee la cadena de conexión del almacén de User Secrets del proyecto API.
        /// Devuelve null si el proyecto no usa User Secrets o si la clave no está guardada.
        /// </summary>
        private static string? ReadFromUserSecrets(string apiProjectDir)
        {
            var csprojPath = Directory.GetFiles(apiProjectDir, "*.csproj").FirstOrDefault();
            if (csprojPath == null) return null;

            var userSecretsId = XDocument.Load(csprojPath)
                .Descendants()
                .FirstOrDefault(element => element.Name.LocalName == "UserSecretsId")
                ?.Value;

            if (string.IsNullOrWhiteSpace(userSecretsId)) return null;

            // En Windows los secretos viven en %APPDATA%\Microsoft\UserSecrets\<id>\secrets.json
            var secretsPath = Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData),
                "Microsoft", "UserSecrets", userSecretsId, "secrets.json");

            if (!File.Exists(secretsPath)) return null;

            using var document = JsonDocument.Parse(File.ReadAllText(secretsPath));
            return document.RootElement.TryGetProperty("ConnectionStrings:DefaultConnection", out var value)
                ? value.GetString()
                : null;
        }

        /// <summary>
        /// Busca el appsettings.json del proyecto API subiendo por los directorios
        /// desde el directorio actual, para que funcione desde la raíz o desde Backend.
        /// </summary>
        private static string FindApiSettingsPath()
        {
            var directory = new DirectoryInfo(Directory.GetCurrentDirectory());

            while (directory != null)
            {
                var candidate = Path.Combine(directory.FullName, "Backend", "OpiSupport.API", "appsettings.json");
                if (File.Exists(candidate)) return candidate;

                candidate = Path.Combine(directory.FullName, "OpiSupport.API", "appsettings.json");
                if (File.Exists(candidate)) return candidate;

                directory = directory.Parent;
            }

            throw new InvalidOperationException("No se encontró Backend/OpiSupport.API/appsettings.json desde el directorio actual.");
        }
    }
}
