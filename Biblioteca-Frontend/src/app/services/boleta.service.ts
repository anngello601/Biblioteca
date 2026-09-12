import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Boleta } from '../models/boleta.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class BoletaService {
  private apiUrl = `${environment.apiUrl}/checkout`; 
  

  constructor(private http: HttpClient) {}

  confirmarCompra(): Observable<Boleta> {
    return this.http.post<Boleta>(`${this.apiUrl}/confirmar`, {}, { withCredentials: true });
  }
}