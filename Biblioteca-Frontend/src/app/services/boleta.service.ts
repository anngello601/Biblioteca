import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PagoDemo } from '../models/pago-demo.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class BoletaService {
  private apiUrl = `${environment.apiUrl}/checkout`; 
  

  constructor(private http: HttpClient) {}

  simularPagoTarjeta(): Observable<PagoDemo> {
    return this.http.post<PagoDemo>(
      `${this.apiUrl}/simular?metodoPago=TARJETA_VISA_BCP_DEMO`,
      {}
    );
  }
}