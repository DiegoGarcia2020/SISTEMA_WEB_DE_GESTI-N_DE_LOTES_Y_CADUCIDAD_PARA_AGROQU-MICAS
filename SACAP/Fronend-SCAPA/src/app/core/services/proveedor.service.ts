import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Proveedor {
  idProveedor: number;
  nombreRepresentante: string;
  ruc: string;
  telefono?: string;
  telefonoEmpresa?: string;
  direccion?: string;
  correoContacto?: string;
  idEstado: number;
  empresa?: any;
  ciudad?: any;
  nombreEmpresa?: string;
  nombreCiudad?: string;
}

export interface ProveedorRequest {
  ruc: string;
  nombreRepresentante: string;
  direccion: string;
  telefonoEmpresa?: string;
  correoContacto?: string;
  idEmpresa: number;
  idCiudad: number;
  idEstado: number;
}

export interface ProveedorProductoDTO {
  idProveedorProducto?: number;
  idProveedor: number;
  idProducto: number;
  precioReferencial?: number;
  codigoProductoProveedor?: string;
  idEstado?: number;
  nombreProducto?: string;
  unidadMedida?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProveedorService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/proveedores`;

  listarProveedores(page: number = 0, size: number = 25, q: string = ''): Observable<any> {
    let params = new import('@angular/common/http').HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    if (q) {
      params = params.set('q', q);
    }
    return this.http.get<any>(this.apiUrl, { params });
  }

  listarTodos(): Observable<Proveedor[]> {
    return this.http.get<Proveedor[]>(`${this.apiUrl}/todos`);
  }

  obtenerPorId(id: number): Observable<Proveedor> {
    return this.http.get<Proveedor>(`${this.apiUrl}/${id}`);
  }

  crearProveedor(data: ProveedorRequest): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  actualizarProveedor(id: number, data: ProveedorRequest): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  eliminarProveedor(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  listarProductos(idProveedor: number): Observable<ProveedorProductoDTO[]> {
    return this.http.get<ProveedorProductoDTO[]>(`${this.apiUrl}/${idProveedor}/productos`);
  }

  asociarProducto(idProveedor: number, data: ProveedorProductoDTO): Observable<any> {
    return this.http.post(`${this.apiUrl}/${idProveedor}/productos`, data);
  }

  desasociarProducto(idProveedor: number, idProducto: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${idProveedor}/productos/${idProducto}`);
  }
}
