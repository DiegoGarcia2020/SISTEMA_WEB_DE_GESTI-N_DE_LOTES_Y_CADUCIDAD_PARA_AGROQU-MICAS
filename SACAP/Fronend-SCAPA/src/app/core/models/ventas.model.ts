import { TemporadaDTO, PromocionIADTO } from './operaciones.model';

export interface ClienteDTO {
  idCliente: number;
  nombreFinca: string;
  cedula: string;
  telefono?: string;
  direccion?: string;
  idEstado?: number;
}

export interface ClienteCreateRequest {
  nombreFinca: string;
  cedula: string;
  telefono?: string;
  direccion?: string;
  idTecnico: number;
}

export interface LoteSugeridoDTO {
  idLote: number;
  numeroLote: string;
  idProducto: number;
  nombreProducto: string;
  nombreBodega: string;
  diasHastaVencimiento: number;
  cantidadDisponible: number;
  precioUnitario: number;
  scoreUrgencia: number;
  instruccionesAplicacion?: string;
}

export interface CultivoDTO {
  idCultivo: number;
  nombre: string;
  idEstado?: number;
}

export interface PlagaDTO {
  idPlaga: number;
  nombre: string;
  idEstado?: number;
}

export interface SugerenciaComboDTO {
  titulo: string;
  esCombo: boolean;
  score: number;
  descuentoSugerido: number;
  justificacionIA: string;
  lotes: LoteSugeridoDTO[];
}

export interface DetalleVentaRequest {
  idLote: number;
  cantidad: number;
  esComboIA?: boolean;
  idPromocion?: number | null;
  descuentoPct?: number | null;
}

export interface VentaCreateRequest {
  idCliente: number;
  lineas: DetalleVentaRequest[];
}

export interface DetalleVentaDTO {
  idDetalle: number;
  idLote: number;
  numeroLote: string;
  nombreProducto: string;
  cantidad: number;
  precioUnitario: number;
  subtotalLinea: number;
  esComboIA: boolean;
  instruccionesAplicacion?: string;
}

export interface VentaDTO {
  idVenta: number;
  numeroOrden: string;
  fechaVenta: string;
  idCliente: number;
  nombreCliente: string;
  nombreTecnico: string;
  subtotal: number;
  descuentoTotal: number;
  total: number;
  estado: string;
  lineas: DetalleVentaDTO[];
}

export interface VentaDashboardDTO {
  temporadasActivas: TemporadaDTO[];
  promocionesActivas: PromocionIADTO[];
  ventasHoyCantidad: number;
  ventasHoyTotal: number;
}

// Item de carrito en el frontend (antes de confirmar la venta)
export interface CarritoItem {
  idLote: number;
  numeroLote: string;
  nombreProducto: string;
  cantidad: number;
  precioUnitario: number;
  esComboIA: boolean;
  idPromocion?: number | null;
  descuentoPct?: number;
}
