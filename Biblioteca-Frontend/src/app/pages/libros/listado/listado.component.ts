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

  // 🔥 Señales privadas (solo para uso interno)
  private librosSignal = signal<Libro[]>([]);
  private cargandoSignal = signal(false);
  private paginaSignal = signal(0);
  private tamanioSignal = signal(12);
  private totalPaginasSignal = signal(0);
  private totalElementosSignal = signal(0);

  // 🔥 Señales públicas (para usar en el template)
  filtroSignal = signal(''); // 👈 AHORA ES PÚBLICA

  // Exponer como readonly las señales que se usan en el template
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
    if (!id) return;
    this.carritoService.agregar(id, cantidad).subscribe({
      next: () => alert('✅ Agregado al carrito'),
      error: (err) => alert('❌ Error al agregar')
    });
  }

  eliminar(id: number) {
    if (!id) return;
    if (confirm('¿Eliminar este libro?')) {
      this.libroService.eliminar(id).subscribe({
        next: () => this.cargarLibros(this.filtroSignal(), this.paginaSignal(), this.tamanioSignal()),
        error: (err) => console.error('Error al eliminar:', err)
      });
    }
  }
}