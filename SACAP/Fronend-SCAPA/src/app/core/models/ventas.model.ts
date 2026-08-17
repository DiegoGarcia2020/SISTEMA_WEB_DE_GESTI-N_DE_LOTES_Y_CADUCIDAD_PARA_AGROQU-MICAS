export interface VentaRankingDTO {
  idProducto: number;
  nombre: string;
  unidades: number;
  montoTotal: number;
  unidadesAnterior?: number | null;
  variacion?: number | null;
}

export interface VentaAnalisisDTO {
  resumen: string;
  hallazgos: string[];
  tendencia: 'AL ALZA' | 'A LA BAJA' | 'ESTABLE';
  alertaAltaDemanda: boolean;
  alertaMensaje?: string | null;
}

export interface VentasMasVendidosDTO {
  periodo: string;
  desde: string;
  hasta: string;
  top: number;
  ranking: VentaRankingDTO[];
  rankingAnterior: VentaRankingDTO[];
  analisis: VentaAnalisisDTO;
  totalVentas: number;
  totalUnidades: number;
  totalMonto: number;
}

export type PeriodoVentas = 'ESTA_SEMANA' | 'SEMANA_ANTERIOR' | 'QUINCENA' | 'QUINCENA_ANTERIOR' | 'ESTE_MES' | 'MES_ANTERIOR' | 'ULTIMOS_30_DIAS';
