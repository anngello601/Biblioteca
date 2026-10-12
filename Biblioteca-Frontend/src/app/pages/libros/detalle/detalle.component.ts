import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LibroService } from '../../../services/libro.service';
import { CarritoService } from '../../../services/carrito.service';
import { Libro } from '../../../models/libro.model';

@Component({
  selector: 'app-detalle-libro',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './detalle.component.html',
  styleUrls: ['./detalle.component.css'],
  // 🔥 Si usas OnPush, necesitas forzar la detección de cambios.
  // Si no, puedes eliminar esta línea y usar el Default (recomendado para este caso)
  // changeDetection: ChangeDetectionStrategy.OnPush  // 👈 COMENTAR O ELIMINAR
})
export class DetalleComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private libroService = inject(LibroService);
  private carritoService = inject(CarritoService);
  private cdr = inject(ChangeDetectorRef); // 👈 Inyectar

  libro: Libro | null = null;
  cantidad = 1;
  loading = true;
  error = '';

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    console.log('📄 ID obtenido de la ruta:', id);

    if (id) {
      this.cargarLibro(+id);
    } else {
      this.error = 'ID no válido';
      this.loading = false;
    }
  }

  cargarLibro(id: number) {
    this.loading = true;
    this.libroService.obtener(id).subscribe({
      next: (data) => {
        console.log('✅ Libro recibido:', data);
        this.libro = data;
        this.loading = false;
        this.cdr.detectChanges(); // 👈 FORZAR DETECCIÓN DE CAMBIOS
      },
      error: (err) => {
        console.error('❌ Error al cargar el libro:', err);
        this.error = 'Error al cargar el libro';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  agregarAlCarrito() {
  if (!this.libro) return;
  this.carritoService.agregar(this.libro.id!, this.cantidad).subscribe({
    next: () => {
      // Opcional: usar un toast en vez de alert
      alert('✅ Libro agregado al carrito');
      // Ya NO navegamos al carrito (mejor UX: dejar que el usuario siga comprando)
      
    },
    error: (err) => {
      const mensaje = err.error?.error || 'Error al agregar al carrito';
      alert('❌ ' + mensaje);
    }
  });
}

  volver() {
    this.router.navigate(['/libros']);
  }
}