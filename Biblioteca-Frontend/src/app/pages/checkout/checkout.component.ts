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
  procesando = false;
  error = '';
  direccion = '';
  titularTarjeta = 'USUARIO DE PRUEBA';
  numeroTarjeta = '4111111111111111';
  vencimientoTarjeta = '12/30';
  cvvTarjeta = '123';
  errorTarjeta = '';

  constructor(
    private boletaService: BoletaService,
    private router: Router
  ) {}

  confirmar(): void {
    if (this.procesando) {
      return;
    }
    if (!this.direccion.trim()) {
      this.error = 'Ingresa la dirección para el comprobante de demostración.';
      return;
    }
    if (!this.tarjetaDePruebaValida()) {
      this.errorTarjeta = 'Usa únicamente los datos de tarjeta de prueba indicados en pantalla.';
      return;
    }

    this.procesando = true;
    this.error = '';
    this.errorTarjeta = '';
    this.boletaService.simularPagoTarjeta().subscribe({
      next: (pagoDemo) => {
        this.numeroTarjeta = '';
        this.cvvTarjeta = '';
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

  private tarjetaDePruebaValida(): boolean {
    return this.titularTarjeta.trim().length > 0
      && this.numeroTarjeta.replace(/\s/g, '') === '4111111111111111'
      && this.vencimientoTarjeta === '12/30'
      && this.cvvTarjeta === '123';
  }
}