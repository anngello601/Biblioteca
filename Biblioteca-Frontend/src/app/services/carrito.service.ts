import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ItemCarrito {
  libroId: number;
  nombre: string;
  portada: string;
  precio: number;
  cantidad: number;
  subtotal: number;
}

export interface Carrito {
  items: ItemCarrito[];
  total: number;
  cantidadTotal: number;
}

@Injectable({ providedIn: 'root' })
export class CarritoService {
  private apiUrl = `${environment.apiUrl}/carrito`;

  // Signal global de cantidad (para el navbar)
  private _cantidad = signal<number>(0);
  cantidad = this._cantidad.asReadonly();

  constructor(private http: HttpClient) {}

  verCarrito(): Observable<Carrito> {
    return this.http.get<Carrito>(this.apiUrl).pipe(
      tap(c => this._cantidad.set(c.cantidadTotal))
    );
  }

  agregar(id: number, cantidad: number = 1): Observable<Carrito> {
    return this.http.post<Carrito>(
      `${this.apiUrl}/agregar/${id}?cantidad=${cantidad}`, {}
    ).pipe(tap(c => this._cantidad.set(c.cantidadTotal)));
  }

  eliminar(id: number): Observable<Carrito> {
    return this.http.delete<Carrito>(`${this.apiUrl}/${id}`).pipe(
      tap(c => this._cantidad.set(c.cantidadTotal))
    );
  }

  vaciar(): Observable<Carrito> {
    return this.http.delete<Carrito>(`${this.apiUrl}/vaciar`).pipe(
      tap(() => this._cantidad.set(0))
    );
  }

  refrescarCantidad(): void {
    this.http.get<number>(`${this.apiUrl}/cantidad`)
      .subscribe(c => this._cantidad.set(c));
  }
}