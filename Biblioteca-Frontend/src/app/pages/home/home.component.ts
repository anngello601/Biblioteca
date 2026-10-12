import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LibroService } from '../../services/libro.service';
import { CarritoService } from '../../services/carrito.service';
import { Libro } from '../../models/libro.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  private libroService = inject(LibroService);
  private carritoService = inject(CarritoService);

  librosDestacados: Libro[] = [];
  cargando = true;

  // 🆕 Signal para más vendidos
  masVendidos = signal<Libro[]>([]);
  cargandoMasVendidos = signal<boolean>(true);

  ngOnInit() {
    this.cargarLibrosDestacados();
    this.cargarMasVendidos();
  }

  cargarLibrosDestacados() {
    this.cargando = true;
    this.libroService.listarPaginado(0, 8).subscribe({
      next: (response) => {
        this.librosDestacados = response.content;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar libros destacados:', err);
        this.cargando = false;
      }
    });
  }

  // 🆕 Cargar más vendidos
  cargarMasVendidos() {
    this.cargandoMasVendidos.set(true);
    this.libroService.getMasVendidos(8).subscribe({
      next: (libros) => {
        this.masVendidos.set(libros);
        this.cargandoMasVendidos.set(false);
      },
      error: (err) => {
        console.error('Error al cargar más vendidos:', err);
        this.masVendidos.set([]);
        this.cargandoMasVendidos.set(false);
      }
    });
  }

  agregarAlCarrito(id: number) {
    if (!id) return;
    this.carritoService.agregar(id, 1).subscribe({
      next: () => alert('✅ Libro agregado al carrito'),
      error: (err) => {
        const mensaje = err.error?.error || 'Error al agregar';
        alert('❌ ' + mensaje);
      }
    });
  }

  suscribirNewsletter() {
    alert('✅ ¡Código enviado a tu correo!');
  }
}