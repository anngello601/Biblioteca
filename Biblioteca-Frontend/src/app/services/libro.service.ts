import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Libro } from '../models/libro.model';
import { PageResponse } from '../models/page-response.model';

@Injectable({ providedIn: 'root' })
export class LibroService {
  private apiUrl = 'http://localhost:8080/api/libros';

  constructor(private http: HttpClient) { }

  listarPaginado(page: number = 0, size: number = 12, tipo?: string): Observable<PageResponse<Libro>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (tipo) {
      params = params.set('tipo', tipo);
    }

    return this.http.get<PageResponse<Libro>>(this.apiUrl, { params, withCredentials: true });
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