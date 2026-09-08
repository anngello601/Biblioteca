import { Component, OnInit, inject } from '@angular/core';
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

  ngOnInit() {
    this.cargarLibrosDestacados();
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

  agregarAlCarrito(id: number) {
    if (!id) return;
    this.carritoService.agregar(id, 1).subscribe({
      next: () => alert('✅ Libro agregado al carrito'),
      error: () => alert('❌ Error al agregar')
    });
  }

  // 👈 NUEVO MÉTODO para el newsletter
  suscribirNewsletter() {
    alert('✅ ¡Código enviado a tu correo!');
  }
}