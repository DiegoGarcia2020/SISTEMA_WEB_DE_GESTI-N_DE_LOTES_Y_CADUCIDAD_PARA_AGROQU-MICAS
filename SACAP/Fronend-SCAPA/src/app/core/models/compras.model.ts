/**
 * Modelos TypeScript para el Módulo de Compras e Inventario Inicial.
 * Interfaces que reflejan los DTOs del backend Spring Boot.
 */

// ==================== ORDEN DE COMPRA ====================

export interface OrdenCompra {
  id: number;
  idProveedor: number;
  nombreProveedor: string;
  numeroFactura: string;
  fechaEmision: string;
  subtotalBruto: number;
  totalDescuentos: number;
  costoTransporte: number;
  impuestos: number;
  totalNeto: number;
  estado: 'PENDIENTE' | 'RECEPCIONADA' | 'ANULADA';
  fechaRegistro: string;
  detalles: DetalleCompra[];
}

export interface DetalleCompra {
  id: number;
  idProducto: number;
  nombreProducto: string;
  unidadMedida: string;
  cantidad: number;
  precioUnitario: number;
  porcentajeDescuento: number;
  valorDescuento: number;
  subtotal: number;
  esBonificacion: boolean;
}

// ==================== REQUESTS ====================

export interface OrdenCompraRequest {
  idProveedor: number;
  numeroFactura: string;
  fechaEmision: string;
  costoTransporte: number;
  impuestos: number;
  detalles: DetalleCompraRequest[];
}

export interface DetalleCompraRequest {
  idProducto: number;
  cantidad: number;
  precioUnitario: number;
  porcentajeDescuento: number;
  esBonificacion: boolean;
}

// ==================== RECEPCIÓN DE LOTES ====================

export interface RecepcionLoteRequest {
  idOrdenCompra: number;
  lotes: LoteRecepcionItem[];
}

export interface LoteRecepcionItem {
  idDetalleCompra: number;
  numeroLote: string;
  fechaVencimiento: string;
  fechaFabricacion?: string;
}

// ==================== HELPERS ====================

export interface PrecioMemoria {
  precioUnitario: number;
  encontrado: boolean;
}

export interface ProveedorSimple {
  idProveedor: number;
  nombre: string;
  ruc: string;
}

export interface ProductoSimple {
  idProducto: number;
  nombre: string;
  unidadMedida: string;
  precio: number;
}
