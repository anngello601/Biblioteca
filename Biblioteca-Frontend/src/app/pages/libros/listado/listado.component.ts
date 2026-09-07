import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { LibroService } from '../../../services/libro.service';
import { CarritoService } from '../../../services/carrito.service';
import { Libro } from '../../../models/libro.model';

@Component({
  selector: 'app-listado',
  standalone: true,
  imports: [RouterLink, FormsModule, DecimalPipe], // <-- Importar DecimalPipe
  templateUrl: './listado.component.html',
  styleUrls: ['./listado.component.css']
})
export class ListadoComponent implements OnInit {
  libros: Libro[] = [];
  filtroTipo: string = '';

  constructor(
    private libroService: LibroService,
    private carritoService: CarritoService
  ) {}

  ngOnInit(): void {
    this.cargarTodos();
  }

  cargarTodos(): void {
    this.libroService.listar().subscribe({
      next: (data) => this.libros = data,
      error: (err) => console.error('Error al cargar libros:', err)
    });
  }

  aplicarFiltro(): void {
    if (this.filtroTipo) {
      this.libroService.listar(this.filtroTipo).subscribe({
        next: (data) => this.libros = data,
        error: (err) => console.error('Error al filtrar:', err)
      });
    } else {
      this.cargarTodos();
    }
  }

  resetFiltro(): void {
    this.filtroTipo = '';
    this.cargarTodos();
  }

  agregarAlCarrito(id: number, cantidad: number): void {
    if (!id) return;
    this.carritoService.agregar(id, cantidad).subscribe({
      next: () => {
        alert('✅ Libro agregado al carrito');
      },
      error: (err) => {
        console.error('Error al agregar:', err);
        alert('❌ Error al agregar el libro');
      }
    });
  }

  eliminar(id: number): void {
    if (!id) return;
    if (confirm('¿Eliminar este libro?')) {
      this.libroService.eliminar(id).subscribe({
        next: () => this.aplicarFiltro(),
        error: (err) => console.error('Error al eliminar:', err)
      });
    }
  }
}