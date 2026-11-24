import { CurrencyPipe } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PagoDemo } from '../../models/pago-demo.model';
import { ComprobantePdfService } from '../../services/comprobante-pdf.service';

@Component({
  selector: 'app-exito',
  standalone: true,
  imports: [RouterLink, CurrencyPipe],
  templateUrl: './exito.component.html',
  styleUrls: ['./exito.component.css']
})
export class ExitoComponent {
  readonly pagoDemo = (history.state as { pagoDemo?: PagoDemo }).pagoDemo;
  readonly direccion = (history.state as { direccion?: string }).direccion || '';
  descargandoPdf = false;
  errorPdf = '';

  constructor(private comprobantePdfService: ComprobantePdfService) {}

  async descargarComprobante(): Promise<void> {
    if (!this.pagoDemo || this.descargandoPdf) {
      return;
    }

    this.descargandoPdf = true;
    this.errorPdf = '';
    try {
      await this.comprobantePdfService.descargar(this.pagoDemo, this.direccion);
    } catch (error) {
      this.errorPdf = error instanceof Error
        ? error.message
        : 'No se pudo generar el PDF de demostración.';
    } finally {
      this.descargandoPdf = false;
    }
  }
}