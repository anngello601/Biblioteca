import { Component, signal, effect, inject, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LibroService } from '../../../services/libro.service';
import { CarritoService } from '../../../services/carrito.service';
import { Libro } from '../../../models/libro.model';

@Component({
  selector: 'app-listado',
  standalone: true,
  imports: [RouterLink, FormsModule, CommonModule],
  templateUrl: './listado.component.html',
  styleUrls: ['./listado.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListadoComponent {
  private libroService = inject(LibroService);
  private carritoService = inject(CarritoService);

  // Señales privadas
  private librosSignal = signal<Libro[]>([]);
  private cargandoSignal = signal(false);
  private paginaSignal = signal(0);
  private tamanioSignal = signal(12);
  private totalPaginasSignal = signal(0);
  private totalElementosSignal = signal(0);
  private agregandoSignal = signal(false); // 🔥 Nuevo: para mostrar spinner en el botón

  // Señales públicas
  filtroSignal = signal('');

  // Exponer como readonly
  readonly libros = this.librosSignal.asReadonly();
  readonly cargando = this.cargandoSignal.asReadonly();
  readonly totalPaginas = this.totalPaginasSignal.asReadonly();
  readonly totalElementos = this.totalElementosSignal.asReadonly();
  readonly paginaActual = this.paginaSignal.asReadonly();

  constructor() {
    effect(() => {
      const filtro = this.filtroSignal();
      const pagina = this.paginaSignal();
      const tamanio = this.tamanioSignal();
      this.cargarLibros(filtro, pagina, tamanio);
    });
  }

  private cargarLibros(filtro: string, pagina: number, tamanio: number) {
    this.cargandoSignal.set(true);
    this.libroService.listarPaginado(pagina, tamanio, filtro).subscribe({
      next: (response) => {
        this.librosSignal.set(response.content);
        this.totalPaginasSignal.set(response.totalPages);
        this.totalElementosSignal.set(response.totalElements);
        this.cargandoSignal.set(false);
      },
      error: (err) => {
        console.error('Error al cargar:', err);
        alert('Error al cargar los libros. Revisa la consola.');
        this.cargandoSignal.set(false);
      }
    });
  }

  cambiarFiltro(tipo: string) {
    this.filtroSignal.set(tipo);
    this.paginaSignal.set(0);
  }

  cambiarPagina(pagina: number) {
    if (pagina < 0 || pagina >= this.totalPaginasSignal()) return;
    this.paginaSignal.set(pagina);
  }

  resetFiltro() {
    this.filtroSignal.set('');
    this.paginaSignal.set(0);
  }

  recargar() {
    this.cargarLibros(this.filtroSignal(), this.paginaSignal(), this.tamanioSignal());
  }

  agregarAlCarrito(id: number, cantidad: number = 1) {
    if (!id) {
      alert('ID de libro inválido');
      return;
    }
    
    // Activar el spinner en el botón
    this.agregandoSignal.set(true);
    
    this.carritoService.agregar(id, cantidad).subscribe({
      next: () => {
        this.agregandoSignal.set(false);
        alert('✅ Libro agregado al carrito');
      },
      error: (err) => {
        this.agregandoSignal.set(false);
        console.error('Error al agregar al carrito:', err);
        alert('❌ Error al agregar el libro al carrito: ' + (err.error || err.message));
      }
    });
  }

  eliminar(id: number) {
    if (!id) {
      alert('ID de libro inválido');
      return;
    }
    
    if (confirm('¿Eliminar este libro permanentemente?')) {
      this.libroService.eliminar(id).subscribe({
        next: () => {
          alert('✅ Libro eliminado correctamente');
          // Recargar la lista con el filtro actual
          this.cargarLibros(this.filtroSignal(), this.paginaSignal(), this.tamanioSignal());
        },
        error: (err) => {
          console.error('Error al eliminar:', err);
          alert('❌ Error al eliminar el libro: ' + (err.error || err.message));
        }
      });
    }
  }
}