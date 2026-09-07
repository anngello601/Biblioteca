import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CarritoResponse {
  items: { [key: string]: number };
  total: number;
  cantidadTotal: number;
}

@Injectable({ providedIn: 'root' })
export class CarritoService {
  private apiUrl = 'http://localhost:8080/api/carrito';

  constructor(private http: HttpClient) {}

  verCarrito(): Observable<CarritoResponse> {
    return this.http.get<CarritoResponse>(this.apiUrl, { withCredentials: true });
  }

  agregar(id: number, cantidad: number = 1): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/agregar/${id}?cantidad=${cantidad}`, {}, { withCredentials: true });
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { withCredentials: true });
  }

  vaciar(): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/vaciar`, { withCredentials: true });
  }
}