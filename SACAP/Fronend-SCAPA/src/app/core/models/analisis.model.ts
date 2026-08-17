export interface ProductoMayorIngresoDTO {
  idProducto: number;
  nombre: string;
  unidadesVendidas: number;
  ingresoTotal: number;
  ingresoAnterior: number;
  variacion?: number | null;
}

export interface DemandaTemporadaDTO {
  idProducto: number;
  nombre: string;
  unidadesVendidas: number;
  montoTotal: number;
  temporada: string;
  totalUnidades: number;
  totalMonto: number;
}

export interface LoteProximoVencerDTO {
  idLote: number;
  numeroLote: string;
  nombreProducto: string;
  cantidadActual: number;
  fechaVencimiento: string;
  diasRestantes: number;
  nivelAlerta: string;
  estadoLote: string;
}

export interface ProductoEstancadoDTO {
  idProducto: number;
  nombre: string;
  cantidadActual: number;
  ultimoMovimiento: string | null;
  diasSinMovimiento?: number | null;
}

export interface InventarioTotalDTO {
  idProducto: number;
  nombre: string;
  unidadMedida: string;
  cantidadTotal: number;
  precioUnitario: number;
  valorTotal: number;
  lotesActivos: number;
}

export interface MovimientoProductoDTO {
  idMovimiento: number;
  nombreProducto: string;
  numeroLote: string;
  tipoMovimiento: string;
  naturaleza: string;
  cantidad: number;
  fechaMovimiento: string;
  usuario: string;
  observacion: string;
}

export interface EstadisticaPromocionesDTO {
  aprobadas: number;
  totalSugeridas: number;
  activas: number;
  porcentajeAprobacion: number;
}

export interface ProductoSalvadoDTO {
  idLote: number;
  numeroLote: string;
  nombreProducto: string;
  cantidadAlertada: number;
  cantidadVendida: number;
  fechaVencimiento: string;
  nombreAlerta: string;
}

export interface UsuarioAnulacionDTO {
  idUsuario: number;
  correo: string;
  operacion: string;
  tablaAfectada: string;
  totalOperaciones: number;
  ultimaOperacion?: string | null;
}

export interface DiaCompraDTO {
  diaSemana: number;
  nombreDia: string;
  totalVentas: number;
  montoTotal: number;
  totalUnidades: number;
}

export interface ClienteFrecuenteDTO {
  cliente: string;
  totalCompras: number;
  montoTotal: number;
  promedioCompra: number;
  ultimaCompra?: string | null;
}

export interface DevolucionMensualDTO {
  anio: number;
  mes: number;
  nombreMes: string;
  totalDevoluciones: number;
  cantidadTotal: number;
  motivoPrincipal: string;
}

export interface ProductoTemporadaDTO {
  idProducto: number;
  nombre: string;
  temporada: string;
  unidadesVendidas: number;
  montoTotal: number;
  totalUnidadesTemporada: number;
  porcentajeParticipacion: number;
}

export interface ClienteChurnDTO {
  cliente: string;
  comprasAnteriores: number;
  montoAnterior: number;
  ultimaCompra?: string | null;
  mesesSinCompra: number;
  promedioMensual: number;
}

export type PeriodoAnalisis = 'ESTA_SEMANA' | 'SEMANA_ANTERIOR' | 'ESTE_MES' | 'MES_ANTERIOR' | 'ULTIMOS_30_DIAS' | 'ULTIMOS_90_DIAS';
