import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import { Usuario } from '../models/usuario.model';
import { environment } from '../../environments/environment'; // 👈 sin .prod

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/auth`;

  // 🔥 Signal privado (fuente de verdad)
  private _usuario = signal<Usuario | null>(this.cargarDeStorage());

  // 🔥 Signal público de solo lectura
  usuario = this._usuario.asReadonly();

  // 🔥 Computed útil
  estaLogueado = computed(() => this._usuario() !== null);

  login(email: string, password: string): Observable<Usuario> {
    return this.http
      .post<{ token: string; usuario: Usuario }>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        tap((response) => localStorage.setItem('token', response.token)),
        map((response) => response.usuario),
        tap((usuario) => this.setUsuario(usuario)),
      );
  }

  registro(usuario: Usuario): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.apiUrl}/registro`, usuario);
  }

  logout(): Observable<void> {
    return this.http
      .post<void>(`${this.apiUrl}/logout`, {})
      .pipe(tap(() => this.cerrarSesionLocal()));
  }

  getUsuarioActual(): Observable<Usuario | null> {
    return this.http.get<Usuario>(`${this.apiUrl}/usuario`).pipe(
      tap({
        next: (u) => this.setUsuario(u),
        error: () => this.setUsuario(null),
      }),
    );
  }

  actualizarPerfil(formData: FormData): Observable<Usuario> {
    return this.http
      .put<Usuario>(`${this.apiUrl}/perfil`, formData)
      .pipe(tap((usuario) => this.setUsuario(usuario)));
  }

  private cerrarSesionLocal(): void {
    localStorage.removeItem('token');
    this.setUsuario(null);
  }

  // Métodos auxiliares privados
  private setUsuario(u: Usuario | null): void {
    this._usuario.set(u);
    if (u) {
      localStorage.setItem('usuario', JSON.stringify(u));
    } else {
      localStorage.removeItem('usuario');
    }
  }

  private cargarDeStorage(): Usuario | null {
    try {
      const raw = localStorage.getItem('usuario');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
}
