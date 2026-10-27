import { Component, inject } from '@angular/core';
import { ContactModalComponent } from '../contact-modal/contact-modal';
import { UiService } from '../../services/ui';

@Component({
  selector: 'app-contact-float',
  standalone: true,
  imports: [ContactModalComponent],
  templateUrl: './contact-float.html',
  styleUrls: ['./contact-float.css']
})
export class ContactFloatComponent {
  private readonly uiService = inject(UiService);

  /** Se comparte con el hero de la portada. */
  readonly contactoAbierto = this.uiService.contactoAbierto;

  menuOpen = false;

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  abrirModal(): void {
    this.uiService.abrirContacto();
    this.menuOpen = false;
  }

  cerrarModal(): void {
    this.uiService.cerrarContacto();
  }
}
