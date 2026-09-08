import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './pages/navbar/navbar.component';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  template: `
    <app-navbar></app-navbar>
    <router-outlet></router-outlet>
  `,
  styleUrls: ['./app.css']
})
export class AppComponent implements OnInit {
  private authService = inject(AuthService);

  ngOnInit() {
    // Intentar restaurar sesión al cargar la aplicación
    this.authService.getUsuarioActual().subscribe({
      error: () => console.log('No hay sesión activa')
    });
  }
}