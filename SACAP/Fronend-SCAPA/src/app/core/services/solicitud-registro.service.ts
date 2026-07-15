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

  private mockSolicitudes: SolicitudRegistroDTO[] = [
    {
      idSolicitud: 1,
      correo: 'm.castro@agrosense.ec',
      nombres: 'Marco Antonio',
      apellidos: 'Castro Piedad',
      cedula: '1723456789',
      telefono: '0991234567',
      departamento: 'Almacén y Bodega Central',
      cargo: 'Asistente de Bodega',
      fechaSolicitud: 'Hoy 08:30 AM',
      idEstado: 1
    },
    {
      idSolicitud: 2,
      correo: 'l.torres@agrosense.ec',
      nombres: 'Lucía Lorena',
      apellidos: 'Torres Páez',
      cedula: '0918273645',
      telefono: '0987654321',
      departamento: 'Producción Agrícola',
      cargo: 'Agrónoma Junior',
      fechaSolicitud: 'Ayer 16:15 PM',
      idEstado: 1
    }
  ];

  solicitar(datos: SolicitudRegistroDTO): Observable<SolicitudRegistroDTO> {
    return this.http.post<SolicitudRegistroDTO>(`${this.apiUrl}/solicitar`, datos).pipe(
      catchError(err => {
        if (err.status === 0 || err.status === 404) {
          const nueva: SolicitudRegistroDTO = {
            ...datos,
            idSolicitud: (this.mockSolicitudes.length + 10),
            fechaSolicitud: 'Recién solicitada',
            idEstado: 1
          };
          this.mockSolicitudes.unshift(nueva);
          return of(nueva);
        }
        return throwError(() => err);
      })
    );
  }

  listarPendientes(): Observable<SolicitudRegistroDTO[]> {
    return this.http.get<SolicitudRegistroDTO[]>(`${this.apiUrl}/pendientes`).pipe(
      catchError(err => {
        if (err.status === 0 || err.status === 404) {
          return of(this.mockSolicitudes.filter(s => s.idEstado === 1));
        }
        return throwError(() => err);
      })
    );
  }

  listarTodas(): Observable<SolicitudRegistroDTO[]> {
    return this.http.get<SolicitudRegistroDTO[]>(`${this.apiUrl}/todas`).pipe(
      catchError(err => {
        if (err.status === 0 || err.status === 404) {
          return of([...this.mockSolicitudes]);
        }
        return throwError(() => err);
      })
    );
  }

  procesar(idSolicitud: number, datos: ProcesarSolicitudDTO): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${idSolicitud}/procesar`, datos).pipe(
      catchError(err => {
        if (err.status === 0 || err.status === 404) {
          const sol = this.mockSolicitudes.find(s => s.idSolicitud === idSolicitud);
          if (sol) {
            sol.idEstado = datos.aprobar ? 2 : 3;
            if (!datos.aprobar) sol.motivoRechazo = datos.motivoRechazo;
          }
          return of(undefined);
        }
        return throwError(() => err);
      })
    );
  }
}
