import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Output,
  ViewChild
} from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contact-modal',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './contact-modal.html',
  styleUrls: ['./contact-modal.css']
})
export class ContactModalComponent implements AfterViewInit {
  @Output() cerrarModal = new EventEmitter<void>();
  @ViewChild('primerCampo') primerCampo?: ElementRef<HTMLInputElement>;
  @ViewChild('dialogo') dialogo?: ElementRef<HTMLElement>;

  enviado = false;

  ngAfterViewInit(): void {
    // Al abrir el modal el foco pasa al primer campo (accesibilidad con teclado).
    this.primerCampo?.nativeElement.focus();
  }

  @HostListener('document:keydown.escape')
  cerrar(): void {
    this.cerrarModal.emit();
  }

  /** Mantiene el foco dentro del diálogo mientras está abierto. */
  @HostListener('document:keydown.tab', ['$event'])
  atraparFoco(evento: Event): void {
    const tecla = evento as KeyboardEvent;
    const contenedor = this.dialogo?.nativeElement;
    if (!contenedor) return;

    const enfocables = contenedor.querySelectorAll<HTMLElement>(
      'button, input, textarea, select, a[href]'
    );
    if (enfocables.length === 0) return;

    const primero = enfocables[0];
    const ultimo = enfocables[enfocables.length - 1];

    if (tecla.shiftKey && document.activeElement === primero) {
      evento.preventDefault();
      ultimo.focus();
    } else if (!tecla.shiftKey && document.activeElement === ultimo) {
      evento.preventDefault();
      primero.focus();
    }
  }

  enviarFormulario(form: NgForm): void {
    if (form.valid) {
      // Nota: el envío es simulado. Para que llegue de verdad hace falta
      // conectar un backend o un servicio de correo.
      console.log('Formulario enviado desde modal (simulado):', form.value);
      this.enviado = true;
      setTimeout(() => {
        this.enviado = false;
        this.cerrar();
      }, 2000);
      form.reset();
    }
  }
}
