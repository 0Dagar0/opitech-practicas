/** Tipos del contenido que se carga desde assets/data/content.json. */

export interface Servicio {
  titulo: string;
  descripcion: string;
  imagen: string;
}

export interface MiembroEquipo {
  nombre: string;
  rol: string;
  foto: string;
}

export interface Cliente {
  nombre: string;
  logo: string;
}

export interface Contenido {
  servicios: Servicio[];
  equipo: MiembroEquipo[];
  clientes: Cliente[];
}
