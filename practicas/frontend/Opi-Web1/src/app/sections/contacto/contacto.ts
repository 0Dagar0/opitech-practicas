import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';

@Component({
  selector: 'app-contacto',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './contacto.html',
  styleUrls: ['./contacto.css']
})
export class ContactoComponent {
  enviado = false;

  enviarFormulario(form: NgForm): void {
    if (form.valid) {
      // Nota: el envío es simulado. Para que llegue de verdad hace falta
      // conectar un backend o un servicio de correo.
      console.log('Formulario enviado (simulado):', form.value);
      this.enviado = true;
      setTimeout(() => (this.enviado = false), 3000);
      form.reset();
    }
  }
}
