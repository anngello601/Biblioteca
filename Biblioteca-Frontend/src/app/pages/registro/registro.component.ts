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
    rol: 'CLIENTE'
  };
  confirmPassword = '';
  error = '';
  erroresCampos: { [key: string]: string } = {}; //  errores por campo
  loading = false;

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    this.error = '';
    this.erroresCampos = {};

    // Validación local: contraseñas coinciden
    if (this.usuario.password !== this.confirmPassword) {
      this.error = 'Las contraseñas no coinciden';
      return;
    }

    this.loading = true;
    this.authService.registro(this.usuario).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/login'], { queryParams: { registered: 'true' } });
      },
      error: (err) => {
        this.loading = false;

        if (err.error?.errores) {
          this.erroresCampos = err.error.errores;
          this.error = 'Por favor, corrige los errores del formulario.';
        }
        else if (err.error?.error) {
          this.error = err.error.error;
        }
        else if (typeof err.error === 'string') {
          this.error = err.error;
        }

        else {
          this.error = 'Error al registrarse. Intenta de nuevo.';
        }
      }
    });
  }
}