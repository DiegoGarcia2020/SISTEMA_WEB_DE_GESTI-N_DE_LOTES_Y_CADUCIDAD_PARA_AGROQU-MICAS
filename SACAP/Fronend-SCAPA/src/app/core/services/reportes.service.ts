import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ReporteFiltros {
  fechaInicio?: string;
  fechaFin?: string;
  idProducto?: number;
  idCliente?: number;
  idCategoria?: number;
  idTemporada?: number;
  idTipoMovimiento?: number;
  idPromocion?: number;
  pagina?: number;
  tamanio?: number;
}

export interface ReporteRespuesta {
  titulo: string;
  data: any[];
  total?: number;
  pagina?: number;
  tamanio?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ReportesService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/v1/reportes`;

  getReporte(ruta: string, filtros?: ReporteFiltros): Observable<ReporteRespuesta> {
    let params = new HttpParams();
    if (filtros) {
      if (filtros.fechaInicio) params = params.set('fechaInicio', filtros.fechaInicio);
      if (filtros.fechaFin) params = params.set('fechaFin', filtros.fechaFin);
      if (filtros.idProducto) params = params.set('idProducto', filtros.idProducto.toString());
      if (filtros.idCliente) params = params.set('idCliente', filtros.idCliente.toString());
      if (filtros.idCategoria) params = params.set('idCategoria', filtros.idCategoria.toString());
      if (filtros.idTemporada) params = params.set('idTemporada', filtros.idTemporada.toString());
      if (filtros.idTipoMovimiento) params = params.set('idTipoMovimiento', filtros.idTipoMovimiento.toString());
      if (filtros.idPromocion) params = params.set('idPromocion', filtros.idPromocion.toString());
      if (filtros.pagina !== undefined && filtros.pagina !== null) {
        params = params.set('pagina', filtros.pagina.toString());
      }
      if (filtros.tamanio) params = params.set('tamanio', filtros.tamanio.toString());
    }
    return this.http.get<ReporteRespuesta>(`${this.apiUrl}/${ruta}`, { params });
  }
}
