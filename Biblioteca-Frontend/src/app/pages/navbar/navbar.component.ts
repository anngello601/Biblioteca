import { Component, HostListener, signal, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive], // ← ahora sí se usa
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent {
  private router = inject(Router);
  private authService = inject(AuthService);

  usuario = this.authService.usuario;

  isDropdownOpen = signal(false);
  itemsCarrito = signal(0);

  estaLogueado = computed(() => this.usuario() !== null);
  cantidadCarrito = computed(() => this.itemsCarrito());
  nombreMostrar = computed(() => this.usuario()?.nombre ?? '');
  avatarUrl = computed(
    () =>
      this.usuario()?.avatarUrl ||
      'https://www.nicepng.com/png/detail/115-1150821_default-avatar-comments-sign-in-icon-png.png',
  );

  toggleDropdown(event?: Event) {
    event?.stopPropagation();
    this.isDropdownOpen.update((v) => !v);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-menu-container')) {
      this.isDropdownOpen.set(false);
    }
  }

  irAPerfil() {
    this.isDropdownOpen.set(false);
    this.router.navigate(['/perfil']);
  }

  logout() {
    this.isDropdownOpen.set(false);
    this.authService.logout().subscribe({
      next: () => this.router.navigate(['/home']),
      error: () => this.router.navigate(['/home']),
    });
  }
}
