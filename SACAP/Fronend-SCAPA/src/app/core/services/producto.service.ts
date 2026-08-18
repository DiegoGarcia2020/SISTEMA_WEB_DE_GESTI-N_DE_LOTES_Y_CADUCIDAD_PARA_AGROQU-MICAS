import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ProductoDTO {
  idProducto: number;
  nombre: string;
  descripcion: string;
  unidadMedida: string;
  precio: number;
  idEstado: number;
  ingredienteActivo?: string;
  periodoCarenciaDias?: number;
  toxicidad?: {
    idToxicidad: number;
    nombre: string;
    colorEtiqueta: string;
  };
  formulacion?: {
    idFormulacion: number;
    sigla: string;
    nombre: string;
  };
  categoria?: {
    idCategoria: number;
    nombre: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/productos`;

  listarTodos(): Observable<ProductoDTO[]> {
    return this.http.get<ProductoDTO[]>(this.apiUrl);
  }

  obtenerPorId(id: number): Observable<ProductoDTO> {
    return this.http.get<ProductoDTO>(`${this.apiUrl}/${id}`);
  }

  crearProducto(datos: any): Observable<ProductoDTO> {
    return this.http.post<ProductoDTO>(this.apiUrl, datos);
  }

  actualizarProducto(id: number, datos: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, datos);
  }

  desactivarProducto(idProducto: number, idEstadoInactivo: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${idProducto}/desactivar?idEstadoInactivo=${idEstadoInactivo}`, {});
  }
}
