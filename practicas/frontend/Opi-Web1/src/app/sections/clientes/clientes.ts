import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { ContenidoService } from '../../services/contenido';
import { Cliente } from '../../models/contenido';

@Component({
  selector: 'app-clientes',
  standalone: true,
  templateUrl: './clientes.html',
  styleUrls: ['./clientes.css']
})
export class ClientesComponent {
  private readonly contenidoService = inject(ContenidoService);

  readonly clientes = toSignal(
    this.contenidoService.obtenerContenido().pipe(map((contenido) => contenido.clientes)),
    { initialValue: [] as Cliente[] }
  );
}
