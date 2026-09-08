import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Usuario } from '../models/usuario.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';
  
  private usuarioSubject = new BehaviorSubject<Usuario | null>(null);
  usuario$ = this.usuarioSubject.asObservable();

  constructor(private http: HttpClient) {}

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

  // 🔥 Este método siempre hace la petición al backend (incluso si ya hay usuario)
  getUsuarioActual(): Observable<Usuario | null> {
    return this.http.get<Usuario>(`${this.apiUrl}/usuario`, { withCredentials: true })
      .pipe(
        tap({
          next: (usuario) => this.usuarioSubject.next(usuario),
          error: (err) => {
            // Si da error 401, significa que no hay sesión válida
            if (err.status === 401) {
              this.usuarioSubject.next(null);
            }
          }
        })
      );
  }
}