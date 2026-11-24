import { Injectable } from '@angular/core';
import { PagoDemo } from '../models/pago-demo.model';

@Injectable({ providedIn: 'root' })
export class ComprobantePdfService {
  async descargar(pago: PagoDemo, direccion: string): Promise<void> {
    const { jsPDF } = await import('jspdf');
    const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const logo = await this.obtenerLogo();

    pdf.setProperties({
      title: `Comprobante de demostración ${pago.id}`,
      subject: 'Documento de prueba sin validez tributaria'
    });
    pdf.addImage(logo, 'PNG', 14, 11, 58, 21);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.text('COMPROBANTE DE VENTA', pageWidth - 14, 17, { align: 'right' });
    pdf.setFontSize(9);
    pdf.setTextColor(180, 35, 35);
    pdf.text('DEMO | SIN VALIDEZ TRIBUTARIA', pageWidth - 14, 24, { align: 'right' });
    pdf.setTextColor(35, 35, 35);

    pdf.setFontSize(9);
    pdf.text(`Empresa: ${pago.empresa.nombre}`, 14, 40);
    pdf.text(`RUC de demostración (no válido): ${pago.empresa.rucDemo}`, 14, 46);
    pdf.text(`Referencia: ${pago.id}`, 14, 52);
    pdf.text(`Emisión: ${this.formatearFecha(pago.fecha)}`, 14, 58);

    pdf.setFont('helvetica', 'bold');
    pdf.text('DATOS DEL COMPRADOR', 14, 69);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Nombre: ${pago.comprador.nombre}`, 14, 75);
    pdf.text(`Correo: ${pago.comprador.email}`, 14, 81);
    const addressLines = pdf.splitTextToSize(`Dirección: ${direccion}`, pageWidth - 28);
    pdf.text(addressLines, 14, 87);

    let y = 87 + addressLines.length * 4 + 8;
    const drawTableHeader = (): void => {
      pdf.setFillColor(239, 243, 247);
      pdf.rect(14, y - 5, pageWidth - 28, 9, 'F');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8);
      pdf.text('Libro / autor', 16, y);
      pdf.text('Cant.', 132, y, { align: 'right' });
      pdf.text('P. unitario', 163, y, { align: 'right' });
      pdf.text('Subtotal', pageWidth - 16, y, { align: 'right' });
      pdf.setFont('helvetica', 'normal');
      y += 7;
    };

    drawTableHeader();
    for (const detalle of pago.detalles) {
      const description = pdf.splitTextToSize(
        [detalle.nombre, detalle.autor ? `Autor: ${detalle.autor}` : ''].filter(Boolean).join('\n'),
        105
      );
      const rowHeight = Math.max(9, description.length * 4);
      if (y + rowHeight > pageHeight - 24) {
        pdf.addPage();
        y = 20;
        drawTableHeader();
      }

      pdf.text(description, 16, y);
      pdf.text(String(detalle.cantidad), 132, y, { align: 'right' });
      pdf.text(this.formatearMonto(detalle.precioUnitario), 163, y, { align: 'right' });
      pdf.text(this.formatearMonto(detalle.subtotal), pageWidth - 16, y, { align: 'right' });
      y += rowHeight;
      pdf.setDrawColor(220, 224, 228);
      pdf.line(14, y - 2, pageWidth - 14, y - 2);
      y += 2;
    }

    if (y + 14 > pageHeight - 24) {
      pdf.addPage();
      y = 20;
    }
    y += 4;
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11);
    pdf.text('TOTAL (PEN)', 145, y, { align: 'right' });
    pdf.text(this.formatearMonto(pago.total), pageWidth - 16, y, { align: 'right' });
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.text(`Método: ${pago.metodoPago} (simulado)`, 14, y + 9);

    for (let page = 1; page <= pdf.getNumberOfPages(); page++) {
      pdf.setPage(page);
      pdf.setFontSize(7);
      pdf.setTextColor(100, 100, 100);
      pdf.text(
        'Documento de demostración: no acredita un pago ni constituye una boleta legal.',
        14,
        pageHeight - 10
      );
      pdf.text(`${page}/${pdf.getNumberOfPages()}`, pageWidth - 14, pageHeight - 10, { align: 'right' });
    }

    pdf.save(`comprobante-demo-${pago.id.replace(/[^a-zA-Z0-9-]/g, '')}.pdf`);
  }

  private formatearFecha(fecha: string): string {
    return new Intl.DateTimeFormat('es-PE', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'America/Lima'
    }).format(new Date(fecha));
  }

  private formatearMonto(monto: number): string {
    return `S/ ${monto.toFixed(2)}`;
  }

  private async obtenerLogo(): Promise<string> {
    const url = new URL('novabook-logo.png', document.baseURI);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('No se pudo cargar el logo de NovaBook.');
    }

    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const image = new Image();
    image.src = objectUrl;

    try {
      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () => reject(new Error('El logo de NovaBook no es válido.'));
      });

      const canvas = document.createElement('canvas');
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const context = canvas.getContext('2d');
      if (!context) {
        throw new Error('No se pudo preparar el logo para el PDF.');
      }
      context.drawImage(image, 0, 0);

      const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
      let left = canvas.width;
      let top = canvas.height;
      let right = 0;
      let bottom = 0;
      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          const index = (y * canvas.width + x) * 4;
          if (pixels[index + 3] > 0 &&
              (pixels[index] < 245 || pixels[index + 1] < 245 || pixels[index + 2] < 245)) {
            left = Math.min(left, x);
            top = Math.min(top, y);
            right = Math.max(right, x);
            bottom = Math.max(bottom, y);
          }
        }
      }

      if (right < left || bottom < top) {
        throw new Error('El logo de NovaBook está vacío.');
      }

      const margin = 8;
      left = Math.max(0, left - margin);
      top = Math.max(0, top - margin);
      right = Math.min(canvas.width - 1, right + margin);
      bottom = Math.min(canvas.height - 1, bottom + margin);

      const cropped = document.createElement('canvas');
      cropped.width = right - left + 1;
      cropped.height = bottom - top + 1;
      const croppedContext = cropped.getContext('2d');
      if (!croppedContext) {
        throw new Error('No se pudo recortar el logo para el PDF.');
      }
      croppedContext.drawImage(
        canvas,
        left, top, cropped.width, cropped.height,
        0, 0, cropped.width, cropped.height
      );
      return cropped.toDataURL('image/png');
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  }
}
