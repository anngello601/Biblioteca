import { Component, signal, effect, inject, ChangeDetectionStrategy, computed } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
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
  private route = inject(ActivatedRoute); // 🆕

  readonly librosOriginales = signal<Libro[]>([]);
  private cargandoSignal = signal(false);
  private paginaSignal = signal(0);
  private tamanioSignal = signal(12);
  private totalPaginasSignal = signal(0);
  private totalElementosSignal = signal(0);

  // 🔍 Filtros
  filtroTipo = signal('');
  precioMin = signal<number | null>(null);
  precioMax = signal<number | null>(null);
  editorialesSeleccionadas = signal<string[]>([]);
  textoBusqueda = signal('');

  // 🆕 Título dinámico según la ruta
  tituloSeccion = signal<string>('Catálogo');

  // 🔥 Computed de libros filtrados
  readonly libros = computed(() => {
    let resultado = this.librosOriginales();

    const tipo = this.filtroTipo();
    if (tipo) {
      resultado = resultado.filter(l => l.tipo === tipo);
    }

    const min = this.precioMin();
    if (min !== null && min !== undefined) {
      resultado = resultado.filter(l => l.precio >= min);
    }

    const max = this.precioMax();
    if (max !== null && max !== undefined) {
      resultado = resultado.filter(l => l.precio <= max);
    }

    const editoriales = this.editorialesSeleccionadas();
    if (editoriales.length > 0) {
      resultado = resultado.filter(l => editoriales.includes(l.editorial));
    }

    const busqueda = this.textoBusqueda().toLowerCase();
    if (busqueda) {
      resultado = resultado.filter(l =>
        l.nombre.toLowerCase().includes(busqueda) ||
        (l.autor && l.autor.toLowerCase().includes(busqueda))
      );
    }

    return resultado;
  });

  readonly cargando = this.cargandoSignal.asReadonly();
  readonly totalPaginas = this.totalPaginasSignal.asReadonly();
  readonly totalElementos = this.totalElementosSignal.asReadonly();
  readonly paginaActual = this.paginaSignal.asReadonly();

  readonly editoriales = computed(() => {
    const eds = this.librosOriginales().map(l => l.editorial).filter(e => e) as string[];
    return [...new Set(eds)];
  });

  constructor() {
    // 🆕 Leer data de la ruta antes de cargar
    const tipoFijo = this.route.snapshot.data['tipoFijo'];
    if (tipoFijo) {
      this.filtroTipo.set(tipoFijo);
      this.tituloSeccion.set(tipoFijo === 'DIGITAL' ? 'Libros Digitales' : 'Libros Físicos');
    } else {
      this.tituloSeccion.set('Catálogo Completo');
    }

    // Effect para cargar libros
    effect(() => {
      const pagina = this.paginaSignal();
      const tamanio = this.tamanioSignal();
      this.cargarLibros(pagina, tamanio);
    });
  }

  private cargarLibros(pagina: number, tamanio: number) {
    this.cargandoSignal.set(true);
    this.libroService.listarPaginado(pagina, tamanio).subscribe({
      next: (response) => {
        this.librosOriginales.set(response.content);
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
    this.filtroTipo.set(tipo);
  }

  aplicarFiltroPrecio() {}

  toggleEditorial(editorial: string) {
    const current = this.editorialesSeleccionadas();
    if (current.includes(editorial)) {
      this.editorialesSeleccionadas.set(current.filter(e => e !== editorial));
    } else {
      this.editorialesSeleccionadas.set([...current, editorial]);
    }
  }

  resetFiltros() {
    this.filtroTipo.set('');
    this.precioMin.set(null);
    this.precioMax.set(null);
    this.editorialesSeleccionadas.set([]);
    this.textoBusqueda.set('');
    this.paginaSignal.set(0);
  }

  cambiarPagina(pagina: number) {
    if (pagina < 0 || pagina >= this.totalPaginasSignal()) return;
    this.paginaSignal.set(pagina);
  }

  agregarAlCarrito(id: number, cantidad: number = 1) {
    if (!id) return;
    this.carritoService.agregar(id, cantidad).subscribe({
      next: () => alert('✅ Agregado al carrito'),
      error: (err) => {
        const mensaje = err.error?.error || 'Error al agregar';
        alert('❌ ' + mensaje);
      }
    });
  }

  eliminar(id: number) {
    if (!id) return;
    if (confirm('¿Eliminar este libro?')) {
      this.libroService.eliminar(id).subscribe({
        next: () => this.cargarLibros(this.paginaSignal(), this.tamanioSignal()),
        error: (err) => console.error('Error al eliminar:', err)
      });
    }
  }
}