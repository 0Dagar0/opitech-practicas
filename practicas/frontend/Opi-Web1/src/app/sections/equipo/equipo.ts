import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { ContenidoService } from '../../services/contenido';
import { MiembroEquipo } from '../../models/contenido';

@Component({
  selector: 'app-equipo',
  standalone: true,
  templateUrl: './equipo.html',
  styleUrls: ['./equipo.css']
})
export class EquipoComponent {
  private readonly contenidoService = inject(ContenidoService);

  readonly equipo = toSignal(
    this.contenidoService.obtenerContenido().pipe(map((contenido) => contenido.equipo)),
    { initialValue: [] as MiembroEquipo[] }
  );
}
