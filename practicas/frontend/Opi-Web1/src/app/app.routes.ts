import { Routes } from '@angular/router';

/**
 * Cada ruta se carga bajo demanda (lazy loading) para que la portada
 * no descargue el código de las demás secciones.
 */
export const routes: Routes = [
  {
    path: 'servicios',
    title: 'Servicios | OpiTech',
    loadComponent: () =>
      import('./sections/servicios/servicios').then((m) => m.ServiciosComponent)
  },
  {
    path: 'equipo',
    title: 'Equipo | OpiTech',
    loadComponent: () => import('./sections/equipo/equipo').then((m) => m.EquipoComponent)
  },
  {
    path: 'clientes',
    title: 'Clientes | OpiTech',
    loadComponent: () => import('./sections/clientes/clientes').then((m) => m.ClientesComponent)
  },
  {
    path: 'contacto',
    title: 'Contacto | OpiTech',
    loadComponent: () => import('./sections/contacto/contacto').then((m) => m.ContactoComponent)
  },
  {
    path: '',
    title: 'OpiTech | Desarrollo de software a medida',
    loadComponent: () => import('./home/home').then((m) => m.HomeComponent)
  },
  // Cualquier URL desconocida vuelve a la portada en lugar de romper el router.
  { path: '**', redirectTo: '' }
];
