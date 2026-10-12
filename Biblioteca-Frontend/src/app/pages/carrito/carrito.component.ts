import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CarritoService, Carrito } from '../../services/carrito.service';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './carrito.component.html',
  styleUrls: ['./carrito.component.css']
})
export class CarritoComponent implements OnInit {
  private carritoService = inject(CarritoService);

  carrito = signal<Carrito | null>(null);
  cargando = signal<boolean>(true);

  ngOnInit() {
    this.cargarCarrito();
  }

  cargarCarrito() {
    this.cargando.set(true);
    this.carritoService.verCarrito().subscribe({
      next: (data) => {
        this.carrito.set(data);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false)
    });
  }

  eliminar(id: number) {
    this.carritoService.eliminar(id).subscribe(c => this.carrito.set(c));
  }

  vaciar() {
    if (confirm('¿Vaciar carrito?')) {
      this.carritoService.vaciar().subscribe(c => this.carrito.set(c));
    }
  }
}