import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { PaisDTO, ProvinciaDTO, CiudadDTO } from '../models/geografia.model';

@Injectable({
  providedIn: 'root'
})
export class GeografiaService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // --- MOCKS PARA FALLBACK OFFLINE ---
  private mockPaises: PaisDTO[] = [
    { idPais: 1, nombre: 'Ecuador', codigoIso: 'EC' },
    { idPais: 2, nombre: 'Colombia', codigoIso: 'CO' },
    { idPais: 3, nombre: 'Peru', codigoIso: 'PE' }
  ];

  private mockProvincias: ProvinciaDTO[] = [
    { idProvincia: 1, nombre: 'Los Rios', idPais: 1, nombrePais: 'Ecuador' },
    { idProvincia: 2, nombre: 'Guayas', idPais: 1, nombrePais: 'Ecuador' },
    { idProvincia: 3, nombre: 'Pichincha', idPais: 1, nombrePais: 'Ecuador' }
  ];

  private mockCiudades: CiudadDTO[] = [
    { idCiudad: 1, nombre: 'Quevedo', idProvincia: 1, nombreProvincia: 'Los Rios' },
    { idCiudad: 2, nombre: 'Guayaquil', idProvincia: 2, nombreProvincia: 'Guayas' },
    { idCiudad: 3, nombre: 'Quito', idProvincia: 3, nombreProvincia: 'Pichincha' }
  ];

  // ================= PAISES =================
  listarPaises(): Observable<PaisDTO[]> {
    return this.http.get<PaisDTO[]>(`${this.apiUrl}/paises`).pipe(
      catchError(err => {
        if (err.status === 0 || err.status === 404) return of([...this.mockPaises]);
        return throwError(() => err);
      })
    );
  }

  crearPais(data: Partial<PaisDTO>): Observable<PaisDTO> {
    return this.http.post<PaisDTO>(`${this.apiUrl}/paises`, data).pipe(
      catchError(err => {
        if (err.status === 0 || err.status === 404) {
          const newId = Math.max(...this.mockPaises.map(p => p.idPais), 0) + 1;
          const nuevo: PaisDTO = { idPais: newId, nombre: data.nombre || 'Nuevo Pais', codigoIso: data.codigoIso || 'XX' };
          this.mockPaises.push(nuevo);
          return of(nuevo);
        }
        return throwError(() => err);
      })
    );
  }

  actualizarPais(id: number, data: Partial<PaisDTO>): Observable<PaisDTO> {
    return this.http.put<PaisDTO>(`${this.apiUrl}/paises/${id}`, data).pipe(
      catchError(err => {
        if (err.status === 0 || err.status === 404) {
          const idx = this.mockPaises.findIndex(p => p.idPais === id);
          if (idx >= 0) this.mockPaises[idx] = { ...this.mockPaises[idx], ...data };
          return of(this.mockPaises[idx]);
        }
        return throwError(() => err);
      })
    );
  }

  desactivarPais(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/paises/${id}/desactivar`, {}).pipe(
      catchError(err => {
        if (err.status === 0 || err.status === 404) {
          this.mockPaises = this.mockPaises.filter(p => p.idPais !== id);
          return of(undefined);
        }
        return throwError(() => err);
      })
    );
  }

  // ================= PROVINCIAS =================
  listarProvincias(): Observable<ProvinciaDTO[]> {
    return this.http.get<ProvinciaDTO[]>(`${this.apiUrl}/provincias`).pipe(
      catchError(err => {
        if (err.status === 0 || err.status === 404) return of([...this.mockProvincias]);
        return throwError(() => err);
      })
    );
  }

  listarProvinciasPorPais(idPais: number): Observable<ProvinciaDTO[]> {
    return this.http.get<ProvinciaDTO[]>(`${this.apiUrl}/provincias/pais/${idPais}`).pipe(
      catchError(err => {
        if (err.status === 0 || err.status === 404) return of(this.mockProvincias.filter(p => p.idPais === idPais));
        return throwError(() => err);
      })
    );
  }

  crearProvincia(data: Partial<ProvinciaDTO>): Observable<ProvinciaDTO> {
    return this.http.post<ProvinciaDTO>(`${this.apiUrl}/provincias`, data).pipe(
      catchError(err => {
        if (err.status === 0 || err.status === 404) {
          const newId = Math.max(...this.mockProvincias.map(p => p.idProvincia), 0) + 1;
          const nueva: ProvinciaDTO = { idProvincia: newId, nombre: data.nombre || 'Nueva Provincia', idPais: data.idPais || 0 };
          this.mockProvincias.push(nueva);
          return of(nueva);
        }
        return throwError(() => err);
      })
    );
  }

  actualizarProvincia(id: number, data: Partial<ProvinciaDTO>): Observable<ProvinciaDTO> {
    return this.http.put<ProvinciaDTO>(`${this.apiUrl}/provincias/${id}`, data).pipe(
      catchError(err => {
        if (err.status === 0 || err.status === 404) {
          const idx = this.mockProvincias.findIndex(p => p.idProvincia === id);
          if (idx >= 0) this.mockProvincias[idx] = { ...this.mockProvincias[idx], ...data };
          return of(this.mockProvincias[idx]);
        }
        return throwError(() => err);
      })
    );
  }

  desactivarProvincia(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/provincias/${id}/desactivar`, {}).pipe(
      catchError(err => {
        if (err.status === 0 || err.status === 404) {
          this.mockProvincias = this.mockProvincias.filter(p => p.idProvincia !== id);
          return of(undefined);
        }
        return throwError(() => err);
      })
    );
  }

  // ================= CIUDADES =================
  listarCiudades(): Observable<CiudadDTO[]> {
    return this.http.get<CiudadDTO[]>(`${this.apiUrl}/ciudades`).pipe(
      catchError(err => {
        if (err.status === 0 || err.status === 404) return of([...this.mockCiudades]);
        return throwError(() => err);
      })
    );
  }

  listarCiudadesPorProvincia(idProvincia: number): Observable<CiudadDTO[]> {
    return this.http.get<CiudadDTO[]>(`${this.apiUrl}/ciudades/provincia/${idProvincia}`).pipe(
      catchError(err => {
        if (err.status === 0 || err.status === 404) return of(this.mockCiudades.filter(c => c.idProvincia === idProvincia));
        return throwError(() => err);
      })
    );
  }

  crearCiudad(data: Partial<CiudadDTO>): Observable<CiudadDTO> {
    return this.http.post<CiudadDTO>(`${this.apiUrl}/ciudades`, data).pipe(
      catchError(err => {
        if (err.status === 0 || err.status === 404) {
          const newId = Math.max(...this.mockCiudades.map(c => c.idCiudad), 0) + 1;
          const nueva: CiudadDTO = { idCiudad: newId, nombre: data.nombre || 'Nueva Ciudad', idProvincia: data.idProvincia || 0 };
          this.mockCiudades.push(nueva);
          return of(nueva);
        }
        return throwError(() => err);
      })
    );
  }

  actualizarCiudad(id: number, data: Partial<CiudadDTO>): Observable<CiudadDTO> {
    return this.http.put<CiudadDTO>(`${this.apiUrl}/ciudades/${id}`, data).pipe(
      catchError(err => {
        if (err.status === 0 || err.status === 404) {
          const idx = this.mockCiudades.findIndex(c => c.idCiudad === id);
          if (idx >= 0) this.mockCiudades[idx] = { ...this.mockCiudades[idx], ...data };
          return of(this.mockCiudades[idx]);
        }
        return throwError(() => err);
      })
    );
  }

  desactivarCiudad(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/ciudades/${id}/desactivar`, {}).pipe(
      catchError(err => {
        if (err.status === 0 || err.status === 404) {
          this.mockCiudades = this.mockCiudades.filter(c => c.idCiudad !== id);
          return of(undefined);
        }
        return throwError(() => err);
      })
    );
  }
}
