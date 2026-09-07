// services/boleta.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Boleta } from '../models/boleta.model'; // crear este modelo

@Injectable({ providedIn: 'root' })
export class BoletaService {
  private apiUrl = 'http://localhost:8080/api/checkout';

  constructor(private http: HttpClient) {}

  confirmarCompra(): Observable<Boleta> {
    return this.http.post<Boleta>(`${this.apiUrl}/confirmar`, {}, { withCredentials: true });
  }
}