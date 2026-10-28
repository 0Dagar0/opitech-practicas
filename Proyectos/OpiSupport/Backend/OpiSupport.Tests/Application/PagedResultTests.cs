using System;
using System.Collections.Generic;
using System.Linq;
using OpiSupport.Application.Shared;
using Xunit;

namespace OpiSupport.Tests.Application
{
    /// <summary>
    /// Pruebas del cálculo de la paginación (el bug del ticket #1 que no aparecía).
    /// </summary>
    public class PagedResultTests
    {
        [Fact]
        public void Calcula_el_total_de_paginas_con_11_registros_y_paginas_de_10()
        {
            var items = Enumerable.Range(1, 10).ToList();

            var resultado = PagedResult<int>.Create(items, 11, 1, 10);

            Assert.Equal(11, resultado.TotalItems);
            Assert.Equal(2, resultado.TotalPages);
            Assert.Equal(1, resultado.CurrentPage);
            Assert.Equal(10, resultado.Items.Count);
        }

        [Fact]
        public void Calcula_el_total_de_paginas_con_division_exacta()
        {
            var items = Enumerable.Range(1, 10).ToList();

            var resultado = PagedResult<int>.Create(items, 20, 2, 10);

            Assert.Equal(2, resultado.TotalPages);
        }

        [Fact]
        public void Sin_registros_siempre_hay_una_pagina()
        {
            var resultado = PagedResult<int>.Create(Array.Empty<int>(), 0, 1, 10);

            Assert.Equal(0, resultado.TotalItems);
            Assert.Equal(1, resultado.TotalPages);
            Assert.Empty(resultado.Items);
        }

        [Fact]
        public void Un_tamano_de_pagina_invalido_no_divide_por_cero()
        {
            var resultado = PagedResult<int>.Create(new List<int>(), 5, 1, 0);

            Assert.Equal(1, resultado.TotalPages);
        }
    }
}
