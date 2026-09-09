// src/app/services/libro.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Libro } from '../models/libro.model';

@Injectable({ providedIn: 'root' })
export class LibroService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/libros';

  // 📚 Método usado por "listado" y "home" (retorna un objeto Page de Spring Boot)
  listarPaginado(page: number = 0, size: number = 12, tipo?: string, search?: string): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (tipo) {
      params = params.set('tipo', tipo);
    }
    if (search) { // 👈 AGREGADO
      params = params.set('search', search);
    }

    return this.http.get<any>(this.apiUrl, { params });
  }

  // 🔍 Método usado por "detalle" y "carrito" (obtiene un solo libro por ID)
  obtener(id: number): Observable<Libro> {
    return this.http.get<Libro>(`${this.apiUrl}/${id}`);
  }

  // ➕ Método usado por "agregar-libro" (crear)
  crearLibro(libro: Libro): Observable<Libro> {
    return this.http.post<Libro>(this.apiUrl, libro);
  }

  // ✏️ Método usado por "agregar-libro" (editar)
  actualizarLibro(id: number, libro: Libro): Observable<Libro> {
    return this.http.put<Libro>(`${this.apiUrl}/${id}`, libro);
  }

  // 🗑️ Método usado por "listado" (eliminar)
  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }


}