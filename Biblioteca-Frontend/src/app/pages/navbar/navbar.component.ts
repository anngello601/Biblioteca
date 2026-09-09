import { Component, OnInit, OnDestroy, inject, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router'; // 👈 Unifica importaciones
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { CarritoService } from '../../services/carrito.service';
import { Usuario } from '../../models/usuario.model';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private carritoService = inject(CarritoService);
  private router = inject(Router);

  usuario: Usuario | null = null;
  cantidadCarrito = 0;
  
  // Propiedad para el menú desplegable
  isDropdownOpen = false;

  // URL del logo genérico (solo se usa si el usuario no tiene foto)
  readonly defaultAvatarUrl = 'https://i.ibb.co/nM8GvScD/pngwing-com.png';

  private subscriptions: Subscription[] = [];

  ngOnInit() {
    this.subscriptions.push(
      this.authService.usuario$.subscribe(user => {
        this.usuario = user;
        console.log('Navbar actualizado con usuario:', user);
      })
    );

    this.authService.getUsuarioActual().subscribe({
      error: (err) => console.error('Error al restaurar sesión:', err)
    });

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

  // 👇 MEJORA 1: Método para alternar el menú
  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  // 👇 MEJORA 2: Cierra el menú si haces clic fuera
  @HostListener('document:click', ['$event'])
  clickOut(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-menu-container')) {
      this.isDropdownOpen = false;
    }
  }

  // 👇 MEJORA 3: Método explícito para ir al perfil (cierra el menú y navega)
  irAPerfil() {
    this.isDropdownOpen = false;
    this.router.navigate(['/perfil']);
  }

  // 👇 MEJORA 4: Método mejorado para cerrar sesión
  logout() {
    this.isDropdownOpen = false; // Cierra el menú inmediatamente
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Error al cerrar sesión:', err);
        // Aún si falla, limpiamos la sesión local y redirigimos
        this.router.navigate(['/login']);
      }
    });
  }

  // 👇 MEJORA 5: Método para obtener la URL del avatar (si no hay, usa la de IBB)
  getAvatarUrl(): string {
    return this.usuario?.avatarUrl || this.defaultAvatarUrl;
  }
}