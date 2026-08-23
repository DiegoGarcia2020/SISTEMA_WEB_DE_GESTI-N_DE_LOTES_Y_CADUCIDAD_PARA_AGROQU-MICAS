import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { SolicitudRegistroDTO, ProcesarSolicitudDTO } from '../models/solicitud-registro.model';

@Injectable({
  providedIn: 'root'
})
export class SolicitudRegistroService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/registro`;

  solicitar(datos: SolicitudRegistroDTO): Observable<SolicitudRegistroDTO> {
    return this.http.post<SolicitudRegistroDTO>(`${this.apiUrl}/solicitar`, datos);
  }

  listarPendientes(): Observable<SolicitudRegistroDTO[]> {
    return this.http.get<SolicitudRegistroDTO[]>(`${this.apiUrl}/pendientes`);
  }

  listarTodas(): Observable<SolicitudRegistroDTO[]> {
    return this.http.get<SolicitudRegistroDTO[]>(`${this.apiUrl}/todas`);
  }

  procesar(idSolicitud: number, datos: ProcesarSolicitudDTO): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${idSolicitud}/procesar`, datos);
  }
}
