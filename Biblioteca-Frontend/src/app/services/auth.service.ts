import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Usuario } from '../models/usuario.model';
import { environment } from '../../environments/environment'; // ✅

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly tokenKey = 'authToken';
  private apiUrl = `${environment.apiUrl}/auth`;

  private usuarioSubject = new BehaviorSubject<Usuario | null>(null);
  usuario$ = this.usuarioSubject.asObservable();

  constructor(private http: HttpClient) { }

  login(email: string, password: string): Observable<Usuario> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        tap(response => sessionStorage.setItem(this.tokenKey, response.token)),
        map(response => response.usuario),
        tap(usuario => this.usuarioSubject.next(usuario))
      );
  }

  registro(usuario: Usuario): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.apiUrl}/registro`, usuario);
  }

  logout(): Observable<void> {
    sessionStorage.removeItem(this.tokenKey);
    this.usuarioSubject.next(null);
    return of(void 0);
  }

  getUsuarioActual(): Observable<Usuario | null> {
    if (!sessionStorage.getItem(this.tokenKey)) {
      this.usuarioSubject.next(null);
      return of(null);
    }
    return this.http.get<Usuario>(`${this.apiUrl}/usuario`)
      .pipe(
        tap({
          next: (usuario) => this.usuarioSubject.next(usuario),
          error: (error: { status?: number }) => {
            this.usuarioSubject.next(null);
            if (error.status === 401) {
              sessionStorage.removeItem(this.tokenKey);
            }
          }
        })
      );
  }

  // 🔥 NUEVO: Actualizar perfil
  actualizarPerfil(formData: FormData): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.apiUrl}/perfil`, formData)
      .pipe(
        tap(usuario => {
          // Actualizar el BehaviorSubject con los nuevos datos
          this.usuarioSubject.next(usuario);
        })
      );
  }

  actualizarUsuarioEnSesion(usuario: Usuario) {
    this.usuarioSubject.next(usuario);
  }

}

interface LoginResponse {
  token: string;
  usuario: Usuario;
}