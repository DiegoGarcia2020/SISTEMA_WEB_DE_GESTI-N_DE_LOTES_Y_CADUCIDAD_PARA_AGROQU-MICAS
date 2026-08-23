import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { TemporadaDTO, AlertaCaducidadDTO, PromocionIADTO, ReglaNegocioIADTO } from '../models/operaciones.model';

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

@Injectable({
  providedIn: 'root'
})
export class OperacionesService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // --- MOCKS PARA FALLBACK OFFLINE ---

  // ================= TEMPORADAS =================
  listarTemporadas(): Observable<TemporadaDTO[]> {
    return this.http.get<TemporadaDTO[]>(`${this.apiUrl}/temporadas`);
  }

  crearTemporada(datos: Partial<TemporadaDTO>): Observable<TemporadaDTO> {
    return this.http.post<TemporadaDTO>(`${this.apiUrl}/temporadas`, datos);
  }

  cambiarEstadoTemporada(id: number, estado: 'ACTIVA' | 'CERRADA' | 'PLANIFICADA'): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/temporadas/${id}/estado`, { estado });
  }

  // ================= ALERTAS DE CADUCIDAD =================
  listarAlertas(page: number = 0, size: number = 10): Observable<PageResponse<AlertaCaducidadDTO>> {
    let params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PageResponse<AlertaCaducidadDTO>>(`${this.apiUrl}/alertas`, { params });
  }

  descartarAlerta(idAlerta: number): Observable<void> {
    // El backend requiere el id del catálogo cat_estado_alerta para "DESCARTADA" (seed: 2)
    return this.http.put<void>(`${this.apiUrl}/alertas/${idAlerta}/descartar?idEstadoDescartado=2`, {});
  }

  solicitarPromocionAlerta(idAlerta: number): Observable<PromocionIADTO> {
    return this.http.post<PromocionIADTO>(`${this.apiUrl}/alertas/${idAlerta}/promover`, {});
  }

  getOrdenesPaginadas(page: number, size: number, searchTerm?: string): Observable<PageResponse<any>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (searchTerm) {
      params = params.set('numeroFactura', searchTerm);
    }

    return this.http.get<PageResponse<any>>(`${this.apiUrl}/ordenes-compra/paginadas`, { params });
  }

  // ================= PROMOCIONES & REGLAS IA =================
  listarPromociones(page: number = 0, size: number = 10): Observable<PageResponse<PromocionIADTO>> {
    let params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PageResponse<PromocionIADTO>>(`${this.apiUrl}/promociones`, { params });
  }

  cambiarEstadoPromocion(idPromocion: number, estado: 'APROBADA' | 'RECHAZADA' | 'ACTIVA'): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/promociones/${idPromocion}/estado`, { estado });
  }

  crearPromocionManual(payload: {
    nombre: string;
    descripcion: string;
    fechaInicio: string;
    fechaFin: string;
    porcentajeDescuento: number;
    idEstado: number;
    idLote: number;
  }): Observable<PromocionIADTO> {
    return this.http.post<PromocionIADTO>(`${this.apiUrl}/promociones`, payload);
  }

  listarLotesProximosVencer(page: number, size: number, q?: string): Observable<PageResponse<any>> {
    let params = new HttpParams().set('page', page).set('size', size).set('dias', 90);
    if (q) params = params.set('q', q);
    return this.http.get<PageResponse<any>>(`${this.apiUrl}/lotes/proximos-vencer`, { params });
  }

  obtenerReglaNegocioIA(): Observable<ReglaNegocioIADTO> {
    return this.http.get<ReglaNegocioIADTO>(`${this.apiUrl}/ia/reglas`);
  }

  actualizarReglaNegocioIA(regla: Partial<ReglaNegocioIADTO>): Observable<ReglaNegocioIADTO> {
    return this.http.put<ReglaNegocioIADTO>(`${this.apiUrl}/ia/reglas`, regla);
  }

  // ================= MOCKS DE OPERACIONES (DESPACHOS, USO EN CAMPO, DEVOLUCIONES) =================

  // ================= MOCKS DE VENTAS: CLIENTES, PEDIDOS, COMBOS =================

  // ================= ENDPOINTS DE DESPACHOS FEFO & LOTES =================
  listarLotesDisponiblesFefo(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/movimientos/lotes-disponibles`);
  }

  despacharFefo(payload: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/movimientos/despachos-fefo`, payload);
  }

  listarDevolucionesPendientesBodega(page: number = 0, size: number = 20): Observable<PageResponse<any>> {
    const params = new HttpParams().set('page', page.toString()).set('size', size.toString());
    return this.http.get<PageResponse<any>>(`${this.apiUrl}/operaciones/devoluciones-venta/pendientes-bodega`, { params });
  }

  listarDespachosPendientes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/movimientos/pendientes`);
  }

  listarTodosMovimientos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/movimientos`);
  }

  aprobarDespacho(idMovimiento: number, observacion?: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/movimientos/${idMovimiento}/aprobar`, {}, { params: { observacion: observacion || 'Aprobado' } });
  }

  rechazarDespacho(idMovimiento: number, observacion?: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/movimientos/${idMovimiento}/rechazar`, {}, { params: { observacion: observacion || 'Rechazado' } });
  }

  // ================= ENDPOINTS DE USO EN CAMPO =================
  crearUsoCampo(payload: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/uso-campo`, payload);
  }

  listarUsoCampo(fechaInicio?: string, fechaFin?: string, cultivo?: string): Observable<any[]> {
    let params: any = {};
    if (fechaInicio) params.fechaInicio = fechaInicio;
    if (fechaFin) params.fechaFin = fechaFin;
    if (cultivo) params.cultivo = cultivo;

    return this.http.get<any[]>(`${this.apiUrl}/uso-campo/filtrado`, { params });
  }

  // ================= ENDPOINTS DE DEVOLUCIONES =================
  crearDevolucion(payload: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/devoluciones`, payload);
  }

  listarDevolucionesPendientes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/devoluciones/pendientes`);
  }

  listarTodasDevoluciones(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/devoluciones`);
  }

  cambiarEstadoDevolucion(idDevolucion: number, payload: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/devoluciones/${idDevolucion}/cambiar-estado`, payload);
  }

  // ================= ENDPOINTS DE VENTAS: CLIENTES =================
  listarClientes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/clientes`);
  }

  crearCliente(payload: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/clientes`, payload);
  }

  // ================= ENDPOINTS DE VENTAS: ÓRDENES DE PEDIDO =================
  crearOrdenPedido(payload: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/operaciones/pedidos`, payload);
  }

  listarPedidosPorTecnico(idTecnico: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/operaciones/pedidos/tecnico/${idTecnico}`);
  }

  listarPedidosPendientesBodega(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/operaciones/pedidos/bodega/pendientes`);
  }

  despacharPedido(idOrden: number, idUsuarioBodeguero: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/operaciones/pedidos/${idOrden}/despachar`, {}, { params: { idUsuarioBodeguero } });
  }

  entregarPedido(idOrden: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/operaciones/pedidos/${idOrden}/entregar`, {});
  }

  registrarDevolucionCliente(payload: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/operaciones/pedidos/devolucion-cliente`, null, {
      params: {
        idPedidoOriginal: payload.idPedidoOriginal || '',
        motivo: payload.motivo,
        cantidad: payload.cantidad,
        idLote: payload.idLote,
        idUsuario: payload.idUsuario || 1
      }
    });
  }

  registrarDevolucionCampo(payload: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/operaciones/devoluciones-venta/campo`, payload);
  }

  listarMisDevolucionesCampo(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/operaciones/devoluciones-venta/mis-devoluciones`);
  }

  recibirDevolucionFisicaVenta(idDevolucion: number, estadoInventario: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/operaciones/devoluciones-venta/${idDevolucion}/recibir-fisica`, {}, {
      params: { estadoInventario }
    });
  }

  // ================= ENDPOINTS DE COMBOS / KITTING =================
  listarCombosActivos(): Observable<PromocionIADTO[]> {
    const params = new HttpParams().set('page', 0).set('size', 200);
    return this.http
      .get<PageResponse<PromocionIADTO>>(`${this.apiUrl}/promociones/activas`, { params })
      .pipe(map(r => r?.content ?? []));
  }

  crearComboKit(payload: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/promociones`, payload);
  }

  // ================= MÓDULO COMPRAS: ÓRDENES DE COMPRA =================

  crearOrdenCompra(payload: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/ordenes-compra`, payload);
  }

  listarOrdenesCompra(estado?: string, idProveedor?: number, desde?: string, hasta?: string): Observable<any[]> {
    let params: any = {};
    if (estado) params.estado = estado;
    if (idProveedor) params.idProveedor = idProveedor;
    if (desde) params.desde = desde;
    if (hasta) params.hasta = hasta;

    return this.http.get<any[]>(`${this.apiUrl}/ordenes-compra`, { params });
  }

  obtenerOrdenCompra(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/ordenes-compra/${id}`);
  }

  recepcionarOrden(id: number, payload: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/ordenes-compra/${id}/recepcionar`, payload);
  }

  anularOrdenCompra(id: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/ordenes-compra/${id}/anular`, {});
  }

  obtenerUltimoPrecioProducto(idProducto: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/ordenes-compra/ultimo-precio/${idProducto}`);
  }

  // ================= DOCUMENTOS ORDEN DE COMPRA =================
  subirDocumentoOrdenCompra(idOrden: number, archivo: File): Observable<any> {
    const formData = new FormData();
    formData.append('archivo', archivo);
    formData.append('tipoDocumento', 'FACTURA_PROVEEDOR');
    return this.http.post<any>(`${this.apiUrl}/ordenes-compra/${idOrden}/documentos`, formData);
  }

  listarDocumentosOrdenCompra(idOrden: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/ordenes-compra/${idOrden}/documentos`);
  }

  eliminarDocumentoOrdenCompra(idDocumento: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/ordenes-compra/documentos/${idDocumento}`);
  }
}
