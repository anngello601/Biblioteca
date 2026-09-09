import { Component, OnInit, WritableSignal, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LibroService } from '../../../services/libro.service';
import { Libro } from '../../../models/libro.model';

@Component({
  selector: 'app-agregar-libro',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './agregar-libro.component.html',
  styleUrls: ['./agregar-libro.component.css']
})
export class AgregarLibroComponent implements OnInit {
  private libroService = inject(LibroService);

  // Estado de paginación
  libros = signal<Libro[]>([]);
  currentPage = signal(0);
  totalPages = signal(0);
  totalElements = signal(0);
  filtroTipo = signal<string>('');

  // Señales con tipo explícito
  editandoId: WritableSignal<number | null> = signal<number | null>(null);
  
  formLibro: WritableSignal<Libro> = signal<Libro>({
    id: 0, // Inicializamos con 0 para que TypeScript no se queje
    nombre: '',
    tipo: 'FISICO',
    editorial: '',
    anioPublicacion: new Date().getFullYear(),
    precio: 0,
    stock: 0,
    portada: '',
    autor: '',
    descripcion: ''
  });

  ngOnInit() {
    this.cargarLibros();
  }

  cargarLibros() {
    // ✅ CORREGIDO: El método se llama 'listarPaginado' (no 'getLibros')
    this.libroService.listarPaginado(this.currentPage(), 12, this.filtroTipo() || undefined).subscribe({
      next: (data) => {
        this.libros.set(data.content);
        this.totalPages.set(data.totalPages);
        this.totalElements.set(data.totalElements);
      },
      error: (err) => console.error('Error al cargar libros:', err)
    });
  }

  cambiarPagina(pagina: number) {
    if (pagina >= 0 && pagina < this.totalPages()) {
      this.currentPage.set(pagina);
      this.cargarLibros();
    }
  }

  aplicarFiltro() {
    this.currentPage.set(0);
    this.cargarLibros();
  }

  guardarLibro() {
    const libro = this.formLibro();

    if (!libro.nombre || !libro.autor || !libro.precio) {
      alert('Por favor completa los campos obligatorios (Nombre, Autor y Precio).');
      return;
    }

    if (this.editandoId() !== null) {
      // EDICIÓN: Mandamos el ID existente
      this.libroService.actualizarLibro(this.editandoId()!, libro).subscribe({
        next: () => {
          alert('Libro actualizado correctamente');
          this.limpiarFormulario();
          this.cargarLibros();
        },
        error: (err) => console.error(err)
      });
    } else {
      // CREACIÓN: Quitamos el id: 0 usando desestructuración para que el backend lo genere
      const { id, ...libroSinId } = libro;
      
      this.libroService.crearLibro(libroSinId as Libro).subscribe({
        next: () => {
          alert('Libro agregado correctamente');
          this.limpiarFormulario();
          this.cargarLibros();
        },
        error: (err) => console.error(err)
      });
    }
  }

  editarLibro(libro: Libro) {
    this.editandoId.set(libro.id!);
    this.formLibro.set({ ...libro });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  eliminarLibro(id: number) {
    if (confirm('¿Seguro que quieres eliminar este libro?')) {
      this.libroService.eliminar(id).subscribe({
        next: () => {
          alert('Libro eliminado');
          if (this.libros().length === 1 && this.currentPage() > 0) {
            this.currentPage.update(p => p - 1);
          }
          this.cargarLibros();
        },
        error: (err) => console.error(err)
      });
    }
  }

  limpiarFormulario() {
    this.editandoId.update(() => null);
    this.formLibro.update(() => ({
      id: 0,
      nombre: '',
      tipo: 'FISICO' as 'FISICO',
      editorial: '',
      anioPublicacion: new Date().getFullYear(),
      precio: 0,
      stock: 0,
      portada: '',
      autor: '',
      descripcion: ''
    }));
  }
}