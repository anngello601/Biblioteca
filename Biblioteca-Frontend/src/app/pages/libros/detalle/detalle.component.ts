import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LibroService } from '../../../services/libro.service';
import { CarritoService } from '../../../services/carrito.service';
import { Libro } from '../../../models/libro.model';

@Component({
  selector: 'app-detalle-libro',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './detalle.component.html',
  styleUrls: ['./detalle.component.css']
})
export class DetalleComponent implements OnInit {
  libro: Libro | null = null;
  cantidad = 1;
  loading = true;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private libroService: LibroService,
    private carritoService: CarritoService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    console.log('ID obtenido de la ruta:', id);  // 👈 Log

    if (id) {
      this.cargarLibro(+id);
    } else {
      this.error = 'ID no válido';
      this.loading = false;
      console.error('No se encontró ID en la ruta');
    }
  }

  cargarLibro(id: number) {
    console.log('Cargando libro con ID:', id);  // 👈 Log
    this.loading = true;
    this.libroService.obtener(id).subscribe({
      next: (data) => {
        console.log('Libro recibido:', data);  // 👈 Log
        this.libro = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar el libro:', err);  // 👈 Log
        this.error = 'Error al cargar el libro: ' + (err.error || err.message);
        this.loading = false;
      }
    });
  }

  agregarAlCarrito() {
    if (!this.libro) return;
    this.carritoService.agregar(this.libro.id!, this.cantidad).subscribe({
      next: () => {
        alert('✅ Libro agregado al carrito');
        this.router.navigate(['/carrito']);
      },
      error: () => alert('❌ Error al agregar')
    });
  }

  volver() {
    this.router.navigate(['/libros']);
  }
}