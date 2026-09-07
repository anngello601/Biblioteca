import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CarritoService, CarritoResponse } from '../../services/carrito.service';
import { LibroService } from '../../services/libro.service';
import { Libro } from '../../models/libro.model';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './carrito.component.html',
  styleUrls: ['./carrito.component.css']
})
export class CarritoComponent implements OnInit {
  items: { libro: Libro, cantidad: number }[] = [];
  total = 0;
  vacio = true;

  constructor(
    private carritoService: CarritoService,
    private libroService: LibroService
  ) {}

  ngOnInit() {
    this.cargarCarrito();
  }

  cargarCarrito() {
    this.carritoService.verCarrito().subscribe({
      next: (data) => {
        this.items = [];
        for (const [key, value] of Object.entries(data.items)) {
          this.libroService.obtener(+key).subscribe(libro => {
            this.items.push({ libro, cantidad: value });
          });
        }
        this.total = data.total;
        this.vacio = this.items.length === 0;
      }
    });
  }

  eliminar(id: number) {
    this.carritoService.eliminar(id).subscribe(() => this.cargarCarrito());
  }

  vaciar() {
    if (confirm('¿Vaciar carrito?')) {
      this.carritoService.vaciar().subscribe(() => this.cargarCarrito());
    }
  }
}