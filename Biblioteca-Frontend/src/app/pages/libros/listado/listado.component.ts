import { Component, signal, effect, inject, ChangeDetectionStrategy, computed } from '@angular/core';
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

  // 📦 Señales de estado
  // Hacemos pública librosOriginales para que el template pueda acceder (o exponemos como readonly)
  readonly librosOriginales = signal<Libro[]>([]);  // 👈 PÚBLICA
  private cargandoSignal = signal(false);
  private paginaSignal = signal(0);
  private tamanioSignal = signal(12);
  private totalPaginasSignal = signal(0);
  private totalElementosSignal = signal(0);

  // 🔍 Filtros (públicos)
  filtroTipo = signal('');          // '' | 'FISICO' | 'DIGITAL'
  precioMin = signal<number | null>(null);
  precioMax = signal<number | null>(null);
  editorialesSeleccionadas = signal<string[]>([]);
  textoBusqueda = signal('');       // Para búsqueda

  // 🔥 SEÑAL COMPUTADA: libros filtrados (ya es readonly por defecto)
  readonly libros = computed(() => {
    let resultado = this.librosOriginales();

    // Filtro por tipo
    const tipo = this.filtroTipo();
    if (tipo) {
      resultado = resultado.filter(l => l.tipo === tipo);
    }

    // Filtro por precio mínimo
    const min = this.precioMin();
    if (min !== null && min !== undefined) {
      resultado = resultado.filter(l => l.precio >= min);
    }

    // Filtro por precio máximo
    const max = this.precioMax();
    if (max !== null && max !== undefined) {
      resultado = resultado.filter(l => l.precio <= max);
    }

    // Filtro por editorial
    const editoriales = this.editorialesSeleccionadas();
    if (editoriales.length > 0) {
      resultado = resultado.filter(l => editoriales.includes(l.editorial));
    }

    // Filtro por búsqueda
    const busqueda = this.textoBusqueda().toLowerCase();
    if (busqueda) {
      resultado = resultado.filter(l =>
        l.nombre.toLowerCase().includes(busqueda) ||
        (l.autor && l.autor.toLowerCase().includes(busqueda))
      );
    }

    return resultado;
  });

  // Exponer otras señales como readonly
  readonly cargando = this.cargandoSignal.asReadonly();
  readonly totalPaginas = this.totalPaginasSignal.asReadonly();
  readonly totalElementos = this.totalElementosSignal.asReadonly();
  readonly paginaActual = this.paginaSignal.asReadonly();

  // Computed para editoriales únicas (basado en originales)
  readonly editoriales = computed(() => {
    const eds = this.librosOriginales().map(l => l.editorial).filter(e => e) as string[];
    return [...new Set(eds)];
  });

  constructor() {
    // Efecto para cargar los libros desde el backend al iniciar
    effect(() => {
      const pagina = this.paginaSignal();
      const tamanio = this.tamanioSignal();
      this.cargarLibros(pagina, tamanio);
    });
  }

  // 📡 Cargar todos los libros (sin filtro de tipo)
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

  // 🔍 Cambiar filtro de tipo (desde el combo)
  cambiarFiltro(tipo: string) {
    this.filtroTipo.set(tipo);
    // La computada se actualiza sola
  }

  // 💰 Aplicar filtro de precio
  aplicarFiltroPrecio() {
    // La computada se actualiza sola
  }

  // 📌 Toggle editorial
  toggleEditorial(editorial: string) {
    const current = this.editorialesSeleccionadas();
    if (current.includes(editorial)) {
      this.editorialesSeleccionadas.set(current.filter(e => e !== editorial));
    } else {
      this.editorialesSeleccionadas.set([...current, editorial]);
    }
  }

  // 🔄 Resetear todos los filtros
  resetFiltros() {
    this.filtroTipo.set('');
    this.precioMin.set(null);
    this.precioMax.set(null);
    this.editorialesSeleccionadas.set([]);
    this.textoBusqueda.set('');
    this.paginaSignal.set(0);
  }

  // 📄 Cambiar página
  cambiarPagina(pagina: number) {
    if (pagina < 0 || pagina >= this.totalPaginasSignal()) return;
    this.paginaSignal.set(pagina);
  }

  // 🛒 Agregar al carrito
  agregarAlCarrito(id: number, cantidad: number = 1) {
    if (!id) return;
    this.carritoService.agregar(id, cantidad).subscribe({
      next: () => alert('✅ Agregado al carrito'),
      error: (err) => alert('❌ Error al agregar')
    });
  }

  // ❌ Eliminar
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