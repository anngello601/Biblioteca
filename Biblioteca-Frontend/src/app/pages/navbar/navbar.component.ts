import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CarritoService } from '../../services/carrito.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  usuario: any = null;
  cantidadCarrito = 0;

  constructor(
    private authService: AuthService,
    private carritoService: CarritoService,
    private router: Router
  ) {}

  ngOnInit() {
    this.authService.getUsuarioActual().subscribe({
      next: (user) => this.usuario = user,
      error: () => this.usuario = null
    });
    this.carritoService.verCarrito().subscribe({
      next: (data) => this.cantidadCarrito = data.cantidadTotal,
      error: () => this.cantidadCarrito = 0
    });
  }

  logout() {
    this.authService.logout().subscribe(() => {
      this.usuario = null;
      this.router.navigate(['/login']);
    });
  }
}