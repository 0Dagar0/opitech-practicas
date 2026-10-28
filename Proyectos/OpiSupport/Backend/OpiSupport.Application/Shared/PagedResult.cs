using System;
using System.Collections.Generic;

namespace OpiSupport.Application.Shared
{
    /// <summary>
    /// Resultado paginado genérico. Incluye los metadatos que el frontend
    /// necesita para dibujar la paginación (total de registros y total de páginas).
    /// </summary>
    public class PagedResult<T>
    {
        public IReadOnlyList<T> Items { get; init; } = Array.Empty<T>();
        public int TotalItems { get; init; }
        public int TotalPages { get; init; }
        public int CurrentPage { get; init; }
        public int PageSize { get; init; }

        /// <summary>
        /// Construye el resultado calculando el total de páginas.
        /// Siempre hay al menos 1 página, aunque no haya registros.
        /// </summary>
        public static PagedResult<T> Create(IReadOnlyList<T> items, int totalItems, int currentPage, int pageSize)
        {
            var totalPages = pageSize <= 0
                ? 1
                : Math.Max(1, (int)Math.Ceiling(totalItems / (double)pageSize));

            return new PagedResult<T>
            {
                Items = items,
                TotalItems = totalItems,
                TotalPages = totalPages,
                CurrentPage = currentPage,
                PageSize = pageSize
            };
        }
    }
}
