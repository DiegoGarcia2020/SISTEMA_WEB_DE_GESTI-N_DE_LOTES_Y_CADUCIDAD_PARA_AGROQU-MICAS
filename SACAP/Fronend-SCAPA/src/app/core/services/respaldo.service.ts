import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface RespaldoResultadoDTO {
  tipo: string;
  exitCode: number;
  mensaje: string;
  rutaArchivo: string;
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class RespaldoService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  generarRespaldo(tipo: 'FULL' | 'INCREMENTAL'): Observable<RespaldoResultadoDTO> {
    return this.http.post<RespaldoResultadoDTO>(`${this.apiUrl}/admin/respaldo`, { tipo });
  }
}
