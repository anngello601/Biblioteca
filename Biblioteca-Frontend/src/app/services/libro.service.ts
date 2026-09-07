// services/libro.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Libro } from '../models/libro.model';

@Injectable({ providedIn: 'root' })
export class LibroService {
  private apiUrl = 'http://localhost:8080/api/libros';

  constructor(private http: HttpClient) {}

  listar(tipo?: string): Observable<Libro[]> {
    const params = tipo ? `?tipo=${tipo}` : '';
    return this.http.get<Libro[]>(`${this.apiUrl}${params}`, { withCredentials: true });
  }

  obtener(id: number): Observable<Libro> {
    return this.http.get<Libro>(`${this.apiUrl}/${id}`, { withCredentials: true });
  }

  guardar(libro: Libro): Observable<Libro> {
    return this.http.post<Libro>(this.apiUrl, libro, { withCredentials: true });
  }

  actualizar(id: number, libro: Libro): Observable<Libro> {
    return this.http.put<Libro>(`${this.apiUrl}/${id}`, libro, { withCredentials: true });
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { withCredentials: true });
  }
}