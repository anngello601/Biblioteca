import { Component, OnInit, OnDestroy, inject, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
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
  private router = inject(Router);
  carritoService = inject(CarritoService);

  usuario: Usuario | null = null;
  isDropdownOpen = false;

  readonly defaultAvatarUrl = 'https://i.ibb.co/nM8GvScD/pngwing-com.png';

  private subscriptions: Subscription[] = [];

  ngOnInit() {
    this.subscriptions.push(
      this.authService.usuario$.subscribe(user => {
        this.usuario = user;
        if (user) {
          this.carritoService.refrescarCantidad();
        }
      })
    );

    this.authService.getUsuarioActual().subscribe({
      error: () => { /* silencio intencional */ }
    });
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // 🆕 Getter para saber si el usuario es admin
  get esAdmin(): boolean {
    return this.usuario?.rol === 'ADMIN';
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  @HostListener('document:click', ['$event'])
  clickOut(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-menu-container')) {
      this.isDropdownOpen = false;
    }
  }

  irAPerfil() {
    this.isDropdownOpen = false;
    this.router.navigate(['/perfil']);
  }

  logout() {
    this.isDropdownOpen = false;
    this.authService.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => this.router.navigate(['/login'])
    });
  }

  getAvatarUrl(): string {
    return this.usuario?.avatarUrl || this.defaultAvatarUrl;
  }
}