import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { Usuario } from '../models/usuario.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';

  private usuarioSubject = new BehaviorSubject<Usuario | null>(null);
  usuario$ = this.usuarioSubject.asObservable();

  constructor(private http: HttpClient) { }

  // En tu servicio de Angular
  login(email: string, password: string): Observable<Usuario> {
    return this.http.post<Usuario>('http://localhost:8080/api/auth/login',
      { email, password },
      { withCredentials: true } // 👈 ¡CRUCIAL para que guarde la cookie JSESSIONID!
    ).pipe(
      tap(usuario => {
        // 👈 ¡AQUÍ SE ACTUALIZA EL NAVBAR INMEDIATAMENTE!
        this.usuarioSubject.next(usuario);
        localStorage.setItem('usuario', JSON.stringify(usuario));
      })
    );
  }


  registro(usuario: Usuario): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.apiUrl}/registro`, usuario, { withCredentials: true });
  }

  logout(): Observable<any> {
    return this.http.post('http://localhost:8080/api/auth/logout', {}, {
      withCredentials: true
    }).pipe(
      tap(() => {
        this.usuarioSubject.next(null); // Limpia la memoria
        localStorage.removeItem('usuario');
      })
    );
  }

  // 🔥 Este método siempre hace la petición al backend (incluso si ya hay usuario)
  getUsuarioActual(): Observable<Usuario | null> {
    return this.http.get<Usuario>('http://localhost:8080/api/auth/usuario', {
      withCredentials: true
    }).pipe(
      tap(usuario => {
        if (usuario) this.usuarioSubject.next(usuario);
      })
    );
  }
}