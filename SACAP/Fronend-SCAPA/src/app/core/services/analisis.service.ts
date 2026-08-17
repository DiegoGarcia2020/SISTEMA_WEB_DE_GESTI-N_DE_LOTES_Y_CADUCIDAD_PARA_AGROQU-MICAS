import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ProductoMayorIngresoDTO,
  DemandaTemporadaDTO,
  LoteProximoVencerDTO,
  ProductoEstancadoDTO,
  InventarioTotalDTO,
  MovimientoProductoDTO,
  EstadisticaPromocionesDTO,
  ProductoSalvadoDTO,
  UsuarioAnulacionDTO,
  DiaCompraDTO,
  ClienteFrecuenteDTO,
  DevolucionMensualDTO,
  ProductoTemporadaDTO,
  ClienteChurnDTO,
  PeriodoAnalisis
} from '../models/analisis.model';

@Injectable({ providedIn: 'root' })
export class AnalisisService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/ia/analisis`;

  mayorIngreso(periodo: PeriodoAnalisis = 'ESTA_SEMANA'): Observable<ProductoMayorIngresoDTO[]> {
    return this.http.get<ProductoMayorIngresoDTO[]>(`${this.apiUrl}/mayor-ingreso`, {
      params: new HttpParams().set('periodo', periodo)
    });
  }

  demandaTemporada(idTemporada?: number): Observable<DemandaTemporadaDTO[]> {
    let params = new HttpParams();
    if (idTemporada) params = params.set('idTemporada', String(idTemporada));
    return this.http.get<DemandaTemporadaDTO[]>(`${this.apiUrl}/demanda-temporada`, { params });
  }

  caducidad(dias: number = 30): Observable<LoteProximoVencerDTO[]> {
    return this.http.get<LoteProximoVencerDTO[]>(`${this.apiUrl}/caducidad`, {
      params: new HttpParams().set('dias', String(dias))
    });
  }

  inventarioEstancado(): Observable<ProductoEstancadoDTO[]> {
    return this.http.get<ProductoEstancadoDTO[]>(`${this.apiUrl}/inventario-estancado`);
  }

  inventarioTotal(): Observable<InventarioTotalDTO[]> {
    return this.http.get<InventarioTotalDTO[]>(`${this.apiUrl}/inventario-total`);
  }

  movimientos(desde: string, hasta: string): Observable<MovimientoProductoDTO[]> {
    return this.http.get<MovimientoProductoDTO[]>(`${this.apiUrl}/movimientos`, {
      params: new HttpParams().set('desde', desde).set('hasta', hasta)
    });
  }

  estadisticasPromociones(): Observable<EstadisticaPromocionesDTO> {
    return this.http.get<EstadisticaPromocionesDTO>(`${this.apiUrl}/promociones-estadisticas`);
  }

  productosSalvados(): Observable<ProductoSalvadoDTO[]> {
    return this.http.get<ProductoSalvadoDTO[]>(`${this.apiUrl}/productos-salvados`);
  }

  anulaciones(semanas: number = 4): Observable<UsuarioAnulacionDTO[]> {
    return this.http.get<UsuarioAnulacionDTO[]>(`${this.apiUrl}/anulaciones`, {
      params: new HttpParams().set('semanas', String(semanas))
    });
  }

  diasCompra(periodo: PeriodoAnalisis = 'ESTA_SEMANA'): Observable<DiaCompraDTO[]> {
    return this.http.get<DiaCompraDTO[]>(`${this.apiUrl}/dias-compra`, {
      params: new HttpParams().set('periodo', periodo)
    });
  }

  clientesFrecuentes(): Observable<ClienteFrecuenteDTO[]> {
    return this.http.get<ClienteFrecuenteDTO[]>(`${this.apiUrl}/clientes-frecuentes`);
  }

  devolucionesMensuales(meses: number = 6): Observable<DevolucionMensualDTO[]> {
    return this.http.get<DevolucionMensualDTO[]>(`${this.apiUrl}/devoluciones-mensuales`, {
      params: new HttpParams().set('meses', String(meses))
    });
  }

  productosPorTemporada(): Observable<ProductoTemporadaDTO[]> {
    return this.http.get<ProductoTemporadaDTO[]>(`${this.apiUrl}/productos-temporada`);
  }

  churnClientes(): Observable<ClienteChurnDTO[]> {
    return this.http.get<ClienteChurnDTO[]>(`${this.apiUrl}/churn-clientes`);
  }
}
