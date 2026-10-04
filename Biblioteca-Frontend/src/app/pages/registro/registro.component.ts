import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Usuario } from '../../models/usuario.model';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.css']
})
export class RegistroComponent {
  usuario: Usuario = {
    nombre: '',
    email: '',
    password: '',
    rol: 'CLIENTE'   // 🆕 valor por defecto
  };
  confirmPassword = '';
  error = '';
  loading = false;

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    if (this.usuario.password !== this.confirmPassword) {
      this.error = 'Las contraseñas no coinciden';
      return;
    }
    this.loading = true;
    this.error = '';
    this.authService.registro(this.usuario).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/login'], { queryParams: { registered: 'true' } });
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.error || err.error || 'Error al registrarse';
      }
    });
  }
}