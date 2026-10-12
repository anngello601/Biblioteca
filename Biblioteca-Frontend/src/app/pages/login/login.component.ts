import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  email = '';
  password = '';
  error = '';
  mensajeRegistro = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['registered'] === 'true') {
        this.mensajeRegistro = '✅ Registro exitoso. Inicia sesión.';
      }
    });
  }

  // login.component.ts (ya funciona)
  onSubmit() {
    this.authService.login(this.email, this.password).subscribe({
      next: () => this.router.navigate(['/libros']),
      error: (err) => {
        if (typeof err.error === 'string') {
          this.error = err.error;
        } else if (typeof err.error?.error === 'string') {
          this.error = err.error.error;
        } else if (typeof err.error?.detalle === 'string') {
          this.error = err.error.detalle;
        } else if (err.status === 0) {
          this.error = 'No se puede conectar con el servidor. Verifica que Spring Boot esté ejecutándose.';
        } else if (err.status === 401) {
          this.error = 'Credenciales inválidas.';
        } else {
          this.error = 'No se pudo iniciar sesión. Revisa los registros del backend.';
        }
      }
    });
  }
}