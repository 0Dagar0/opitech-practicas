import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';
import { Contenido } from '../models/contenido';

@Injectable({
  providedIn: 'root'
})
export class ContenidoService {
  private readonly http = inject(HttpClient);
  private readonly dataUrl = 'assets/data/content.json';

  /**
   * shareReplay(1) guarda la respuesta: si se visitan Servicios, Equipo y
   * Clientes, el JSON se descarga una sola vez en lugar de tres.
   */
  private readonly contenido$ = this.http
    .get<Contenido>(this.dataUrl)
    .pipe(shareReplay(1));

  obtenerContenido(): Observable<Contenido> {
    return this.contenido$;
  }
}
