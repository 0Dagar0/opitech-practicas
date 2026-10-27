import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { ContenidoService } from '../../services/contenido';
import { Servicio } from '../../models/contenido';

@Component({
  selector: 'app-servicios',
  standalone: true,
  templateUrl: './servicios.html',
  styleUrls: ['./servicios.css']
})
export class ServiciosComponent {
  private readonly contenidoService = inject(ContenidoService);

  /** Signal: la vista se actualiza sola cuando llega la respuesta. */
  readonly servicios = toSignal(
    this.contenidoService.obtenerContenido().pipe(map((contenido) => contenido.servicios)),
    { initialValue: [] as Servicio[] }
  );
}
