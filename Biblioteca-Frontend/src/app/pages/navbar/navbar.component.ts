import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { CarritoService } from '../../services/carrito.service';
import { Usuario } from '../../models/usuario.model';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private carritoService = inject(CarritoService);
  private router = inject(Router);

  usuario: Usuario | null = null;
  cantidadCarrito = 0;
  private subscriptions: Subscription[] = [];

  ngOnInit() {
    // Suscribirse al usuario (se actualiza al login/logout)
    this.subscriptions.push(
      this.authService.usuario$.subscribe(user => {
        this.usuario = user;
      })
    );

    // Obtener sesión actual si existe
    this.authService.getUsuarioActual().subscribe();

    // Suscribirse al carrito
    this.subscriptions.push(
      this.carritoService.verCarrito().subscribe({
        next: (data) => this.cantidadCarrito = data.cantidadTotal,
        error: () => this.cantidadCarrito = 0
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  logout() {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/login']);
    });
  }
}