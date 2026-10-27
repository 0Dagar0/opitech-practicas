import { Injectable, signal } from '@angular/core';

/**
 * Estado de interfaz compartido entre componentes que no son padre/hijo,
 * como el hero de la portada y el botón flotante de contacto.
 */
@Injectable({
  providedIn: 'root'
})
export class UiService {
  private readonly _contactoAbierto = signal(false);

  /** Signal de solo lectura: el modal se muestra cuando vale true. */
  readonly contactoAbierto = this._contactoAbierto.asReadonly();

  abrirContacto(): void {
    this._contactoAbierto.set(true);
  }

  cerrarContacto(): void {
    this._contactoAbierto.set(false);
  }
}
