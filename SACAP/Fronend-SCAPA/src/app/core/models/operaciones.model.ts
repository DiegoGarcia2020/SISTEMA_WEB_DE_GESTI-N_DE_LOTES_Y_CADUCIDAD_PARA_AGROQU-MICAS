export interface FaseAgrariaDTO {
  idFase?: number;
  nombreFase: string;
  fechaInicio: string;
  fechaFin: string;
  tipoActividad: 'PREPARACION' | 'SIEMBRA' | 'FUMIGACION' | 'FERTILIZACION' | 'COSECHA' | 'SECADO';
  estadoFase: 'PENDIENTE' | 'EN_CURSO' | 'COMPLETADA';
  insumosRequeridos?: string[];
  observaciones?: string;
}

export interface TemporadaDTO {
  idTemporada: number;
  nombre: string;
  cultivo: string;
  fechaInicio: string;
  fechaFinProyectada: string;
  fechaFinReal?: string;
  estado: 'ACTIVA' | 'CERRADA' | 'PLANIFICADA';
  progresoPorcentaje: number;
  observaciones?: string;
  fases?: FaseAgrariaDTO[];
}

export interface AlertaCaducidadDTO {
  idAlerta: number;
  codigoLote: string;
  nombreProducto: string;
  bodega: string;
  stockActual: number;
  unidadMedida: string;
  fechaCaducidad: string;
  diasRestantes: number;
  nivelPrioridad: 'URGENTE' | 'ALTA' | 'MEDIA' | 'BAJA';
  estado: 'ACTIVA' | 'DESCARTADA' | 'EN_PROMOCION';
  sugerenciaDescuento?: number;
}

export interface PromocionIADTO {
  idPromocion: number;
  titulo: string;
  codigoLote: string;
  nombreProducto: string;
  descuentoSugerido: number; // Porcentaje, ej: 15%
  precioOriginal: number;
  precioPromocion: number;
  justificacionIA: string;
  estado: 'SUGERIDA' | 'APROBADA' | 'RECHAZADA' | 'ACTIVA';
  fechaCreacion: string;
  fechaVigencia: string;
}

export interface ReglaNegocioIADTO {
  idRegla: number;
  descuentoMaximo: number;
  activarPromociones: boolean;
  diasAlertaAnticipada: number;
  modeloIaActivo: string;
}
