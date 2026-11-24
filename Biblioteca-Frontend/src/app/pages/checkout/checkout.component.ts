import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { BoletaService } from '../../services/boleta.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent {
  qrVisible = false;
  procesando = false;
  error = '';
  direccion = '';

  constructor(
    private boletaService: BoletaService,
    private router: Router
  ) {}

  mostrarQr(): void {
    this.qrVisible = true;
  }

  confirmar(): void {
    if (!this.qrVisible || this.procesando) {
      return;
    }
    if (!this.direccion.trim()) {
      this.error = 'Ingresa la dirección para el comprobante de demostración.';
      return;
    }

    this.procesando = true;
    this.error = '';
    this.boletaService.simularPagoYape().subscribe({
      next: (pagoDemo) => {
        void this.router.navigate(['/exito'], {
          state: { pagoDemo, direccion: this.direccion.trim() }
        });
      },
      error: (err) => {
        this.procesando = false;
        this.error = err.error?.error || 'No se pudo registrar la demostración.';
      }
    });
  }
}