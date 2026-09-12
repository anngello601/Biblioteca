import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Usuario } from '../models/usuario.model';
import { environment } from '../../environments/environment.prod';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;

  private usuarioSubject = new BehaviorSubject<Usuario | null>(null);
  usuario$ = this.usuarioSubject.asObservable();

  constructor(private http: HttpClient) { }

  login(email: string, password: string): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.apiUrl}/login`, { email, password }, { withCredentials: true })
      .pipe(tap(usuario => this.usuarioSubject.next(usuario)));
  }

  registro(usuario: Usuario): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.apiUrl}/registro`, usuario, { withCredentials: true });
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/logout`, {}, { withCredentials: true })
      .pipe(tap(() => this.usuarioSubject.next(null)));
  }

  getUsuarioActual(): Observable<Usuario | null> {
    return this.http.get<Usuario>(`${this.apiUrl}/usuario`, { withCredentials: true })
      .pipe(
        tap({
          next: (usuario) => this.usuarioSubject.next(usuario),
          error: () => this.usuarioSubject.next(null)
        })
      );
  }

  // 🔥 NUEVO: Actualizar perfil
  actualizarPerfil(formData: FormData): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.apiUrl}/perfil`, formData, { withCredentials: true })
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