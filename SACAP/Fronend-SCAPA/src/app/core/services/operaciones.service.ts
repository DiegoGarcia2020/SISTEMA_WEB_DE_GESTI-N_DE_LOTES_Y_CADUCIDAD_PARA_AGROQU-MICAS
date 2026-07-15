import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { TemporadaDTO, AlertaCaducidadDTO, PromocionIADTO, ReglaNegocioIADTO } from '../models/operaciones.model';

@Injectable({
  providedIn: 'root'
})
export class OperacionesService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // --- MOCKS PARA FALLBACK OFFLINE ---
  private mockTemporadas: TemporadaDTO[] = [
    { 
      idTemporada: 1, 
      nombre: 'Maíz Cosecha Verano 2026', 
      cultivo: 'Maíz Híbrido INIAP', 
      fechaInicio: '2026-05-15', 
      fechaFinProyectada: '2026-09-15', 
      estado: 'ACTIVA', 
      progresoPorcentaje: 37, 
      observaciones: 'Campaña principal de ciclo corto con alta fertilización nitrogenada.',
      fases: [
        { idFase: 101, nombreFase: 'Preparación de Terreno & Rastrillo', fechaInicio: '2026-05-15', fechaFin: '2026-05-30', tipoActividad: 'PREPARACION', estadoFase: 'COMPLETADA', insumosRequeridos: ['Tractor John Deere', 'Abono Orgánico Compostado'], observaciones: 'Desmalezado y nivelación de lotes norte.' },
        { idFase: 102, nombreFase: 'Siembra Directa / Loritos & Almácigo', fechaInicio: '2026-06-01', fechaFin: '2026-06-20', tipoActividad: 'SIEMBRA', estadoFase: 'COMPLETADA', insumosRequeridos: ['Semilla Híbrida Maíz Trueno', 'Fertilizante de Arranque 18-46-0'], observaciones: 'Siembra en hileras a 70cm con sembradora de precisión.' },
        { idFase: 103, nombreFase: 'Aplicación de Fungicidas & Fertilizante Foliar', fechaInicio: '2026-06-25', fechaFin: '2026-08-10', tipoActividad: 'FUMIGACION', estadoFase: 'EN_CURSO', insumosRequeridos: ['Fungicida Carbendazim 500 SC', 'Fertilizante Urea Agrícola 46% N'], observaciones: 'Control preventivo de tizón foliar y refuerzo nitrogenado en V8.' },
        { idFase: 104, nombreFase: 'Cosecha Mecanizada de Mazorcas', fechaInicio: '2026-08-20', fechaFin: '2026-09-10', tipoActividad: 'COSECHA', estadoFase: 'PENDIENTE', insumosRequeridos: ['Cosechadora Combinada', 'Sacos de Polipropileno 50kg'], observaciones: 'Cosecha en punto de humedad óptima (18-20%).' },
        { idFase: 105, nombreFase: 'Secado & Clasificación en Bodega Central', fechaInicio: '2026-09-11', fechaFin: '2026-09-15', tipoActividad: 'SECADO', estadoFase: 'PENDIENTE', insumosRequeridos: ['Silobolsas', 'Secadora de Grano Seco-500'], observaciones: 'Almacenamiento estable a 14% de humedad.' }
      ]
    },
    { 
      idTemporada: 2, 
      nombre: 'Cacao Invierno 2025', 
      cultivo: 'Cacao CCN-51 / Nacional', 
      fechaInicio: '2025-10-01', 
      fechaFinProyectada: '2026-03-31', 
      fechaFinReal: '2026-04-05', 
      estado: 'CERRADA', 
      progresoPorcentaje: 100, 
      observaciones: 'Rendimiento superior en 14% a proyecciones iniciales.',
      fases: [
        { idFase: 201, nombreFase: 'Poda Fitosanitaria & Defloración', fechaInicio: '2025-10-01', fechaFin: '2025-11-15', tipoActividad: 'PREPARACION', estadoFase: 'COMPLETADA', insumosRequeridos: ['Tijeras de Poda Felco', 'Pasta Cicatrizante Fúngica'], observaciones: 'Poda de ventilación en copas CCN-51.' },
        { idFase: 202, nombreFase: 'Control Preventivo Moniliasis / Cobre', fechaInicio: '2025-11-20', fechaFin: '2026-01-30', tipoActividad: 'FUMIGACION', estadoFase: 'COMPLETADA', insumosRequeridos: ['Oxicloruro de Cobre 50 WP', 'Bomba Mochila Motorizada'], observaciones: 'Aplicación cada 21 días en periodo lluvioso.' },
        { idFase: 203, nombreFase: 'Cosecha Selectiva de Mazorcas Maduras', fechaInicio: '2026-02-01', fechaFin: '2026-03-20', tipoActividad: 'COSECHA', estadoFase: 'COMPLETADA', insumosRequeridos: ['Media Luna Cacaotera', 'Gavetas de Cosecha'], observaciones: 'Recolección en lotes 1 a 6.' },
        { idFase: 204, nombreFase: 'Fermentación & Secado en Tendales', fechaInicio: '2026-03-21', fechaFin: '2026-04-05', tipoActividad: 'SECADO', estadoFase: 'COMPLETADA', insumosRequeridos: ['Cajones de Fermentación de Laurel', 'Tendales de Marquesina'], observaciones: 'Fermentación completa de 5 días e insolación controlada.' }
      ]
    },
    { 
      idTemporada: 3, 
      nombre: 'Soja Rotación Otoño 2026', 
      cultivo: 'Soja Variedad Tropical', 
      fechaInicio: '2026-10-01', 
      fechaFinProyectada: '2027-02-15', 
      estado: 'PLANIFICADA', 
      progresoPorcentaje: 0, 
      observaciones: 'Planificada en lotes de descanso post-cosecha de maíz.',
      fases: [
        { idFase: 301, nombreFase: 'Inoculación de Semilla & Siembra Directa', fechaInicio: '2026-10-01', fechaFin: '2026-10-20', tipoActividad: 'SIEMBRA', estadoFase: 'PENDIENTE', insumosRequeridos: ['Inoculante Bradyrhizobium', 'Semilla Soja Tropical Certificada'], observaciones: 'Fijación biológica de nitrógeno en lote sur.' }
      ]
    },
    { 
      idTemporada: 4, 
      nombre: 'Arroz Riego Verano 2025', 
      cultivo: 'Arroz SFL-11', 
      fechaInicio: '2025-04-01', 
      fechaFinProyectada: '2025-08-30', 
      fechaFinReal: '2025-08-28', 
      estado: 'CERRADA', 
      progresoPorcentaje: 100, 
      observaciones: 'Cierre normal sin incidencias de plagas significativas.' 
    }
  ];

  private mockAlertas: AlertaCaducidadDTO[] = [
    { idAlerta: 1, codigoLote: 'LT-2026-089', nombreProducto: 'Fertilizante Urea Agrícola 46% N', bodega: 'Bodega Central Quevedo', stockActual: 150, unidadMedida: 'Sacos (50kg)', fechaCaducidad: '2026-07-15', diasRestantes: 12, nivelPrioridad: 'URGENTE', estado: 'ACTIVA', sugerenciaDescuento: 20 },
    { idAlerta: 2, codigoLote: 'LT-2026-042', nombreProducto: 'Fungicida Carbendazim 500 SC', bodega: 'Almacén Agroquímicos Norte', stockActual: 45, unidadMedida: 'Litros', fechaCaducidad: '2026-07-18', diasRestantes: 15, nivelPrioridad: 'URGENTE', estado: 'ACTIVA', sugerenciaDescuento: 25 },
    { idAlerta: 3, codigoLote: 'LT-2026-112', nombreProducto: 'Semilla Híbrida Maíz Trueno', bodega: 'Bodega Climatizada Sur', stockActual: 80, unidadMedida: 'Bolsas (60k sem)', fechaCaducidad: '2026-08-10', diasRestantes: 38, nivelPrioridad: 'ALTA', estado: 'ACTIVA', sugerenciaDescuento: 15 },
    { idAlerta: 4, codigoLote: 'LT-2026-005', nombreProducto: 'Insecticida Cipermetrina 25 EC', bodega: 'Almacén Agroquímicos Norte', stockActual: 120, unidadMedida: 'Litros', fechaCaducidad: '2026-08-25', diasRestantes: 53, nivelPrioridad: 'MEDIA', estado: 'ACTIVA', sugerenciaDescuento: 10 },
    { idAlerta: 5, codigoLote: 'LT-2025-301', nombreProducto: 'Herbicida Glifosato 480 SL', bodega: 'Bodega Central Quevedo', stockActual: 30, unidadMedida: 'Litros', fechaCaducidad: '2026-09-15', diasRestantes: 74, nivelPrioridad: 'BAJA', estado: 'DESCARTADA', sugerenciaDescuento: 5 }
  ];

  private mockPromociones: PromocionIADTO[] = [
    { idPromocion: 101, titulo: 'Combo Liquidación Rápida Urea', codigoLote: 'LT-2026-089', nombreProducto: 'Fertilizante Urea Agrícola 46% N', descuentoSugerido: 20, precioOriginal: 32.50, precioPromocion: 26.00, justificacionIA: 'AgroSense detecta vencimiento en 12 días con alta elasticidad de demanda en campaña de Maíz actual.', estado: 'SUGERIDA', fechaCreacion: '2026-07-01', fechaVigencia: '2026-07-15' },
    { idPromocion: 102, titulo: 'Descuento Preventivo Fungicida', codigoLote: 'LT-2026-042', nombreProducto: 'Fungicida Carbendazim 500 SC', descuentoSugerido: 25, precioOriginal: 18.00, precioPromocion: 13.50, justificacionIA: 'Riesgo de pérdida de stock por caducidad en 15 días. Sugerencia de combo 4x3 para técnicos agroindustriales.', estado: 'SUGERIDA', fechaCreacion: '2026-07-02', fechaVigencia: '2026-07-18' },
    { idPromocion: 103, titulo: 'Promoción Semilla Campaña Maíz', codigoLote: 'LT-2026-112', nombreProducto: 'Semilla Híbrida Maíz Trueno', descuentoSugerido: 15, precioOriginal: 145.00, precioPromocion: 123.25, justificacionIA: 'Optimización de stock en bodega sur antes del pico de siembra rotativa.', estado: 'APROBADA', fechaCreacion: '2026-06-25', fechaVigencia: '2026-08-10' }
  ];

  private mockRegla: ReglaNegocioIADTO = {
    idRegla: 1,
    descuentoMaximo: 35.00,
    activarPromociones: true,
    diasAlertaAnticipada: 60,
    modeloIaActivo: 'AgroSense Predictor de Caducidad v2.4-PROD'
  };

  // ================= TEMPORADAS =================
  listarTemporadas(): Observable<TemporadaDTO[]> {
    return this.http.get<TemporadaDTO[]>(`${this.apiUrl}/temporadas`).pipe(
      catchError(err => {
        if (err.status === 0 || err.status === 404) return of([...this.mockTemporadas]);
        return throwError(() => err);
      })
    );
  }

  crearTemporada(datos: Partial<TemporadaDTO>): Observable<TemporadaDTO> {
    return this.http.post<TemporadaDTO>(`${this.apiUrl}/temporadas`, datos).pipe(
      catchError(err => {
        if (err.status === 0 || err.status === 404) {
          const newId = Math.max(...this.mockTemporadas.map(t => t.idTemporada), 0) + 1;
          const nueva: TemporadaDTO = {
            idTemporada: newId,
            nombre: datos.nombre || 'Nueva Temporada',
            cultivo: datos.cultivo || 'Cultivo General',
            fechaInicio: datos.fechaInicio || '2026-07-03',
            fechaFinProyectada: datos.fechaFinProyectada || '2026-11-30',
            estado: datos.estado || 'PLANIFICADA',
            progresoPorcentaje: 0,
            observaciones: datos.observaciones || ''
          };
          this.mockTemporadas.unshift(nueva);
          return of(nueva);
        }
        return throwError(() => err);
      })
    );
  }

  cambiarEstadoTemporada(id: number, estado: 'ACTIVA' | 'CERRADA' | 'PLANIFICADA'): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/temporadas/${id}/estado`, { estado }).pipe(
      catchError(err => {
        if (err.status === 0 || err.status === 404) {
          const t = this.mockTemporadas.find(x => x.idTemporada === id);
          if (t) {
            t.estado = estado;
            if (estado === 'CERRADA') t.progresoPorcentaje = 100;
            if (estado === 'ACTIVA') t.progresoPorcentaje = 10;
          }
          return of(undefined);
        }
        return throwError(() => err);
      })
    );
  }

  // ================= ALERTAS DE CADUCIDAD =================
  listarAlertas(): Observable<AlertaCaducidadDTO[]> {
    return this.http.get<AlertaCaducidadDTO[]>(`${this.apiUrl}/alertas`).pipe(
      catchError(err => {
        if (err.status === 0 || err.status === 404) return of([...this.mockAlertas]);
        return throwError(() => err);
      })
    );
  }

  descartarAlerta(idAlerta: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/alertas/${idAlerta}/descartar`, {}).pipe(
      catchError(err => {
        if (err.status === 0 || err.status === 404) {
          const a = this.mockAlertas.find(x => x.idAlerta === idAlerta);
          if (a) a.estado = 'DESCARTADA';
          return of(undefined);
        }
        return throwError(() => err);
      })
    );
  }

  solicitarPromocionAlerta(idAlerta: number): Observable<PromocionIADTO> {
    return this.http.post<PromocionIADTO>(`${this.apiUrl}/alertas/${idAlerta}/promover`, {}).pipe(
      catchError(err => {
        if (err.status === 0 || err.status === 404) {
          const a = this.mockAlertas.find(x => x.idAlerta === idAlerta);
          if (a) a.estado = 'EN_PROMOCION';
          const newId = Math.max(...this.mockPromociones.map(p => p.idPromocion), 100) + 1;
          const promo: PromocionIADTO = {
            idPromocion: newId,
            titulo: `Promo Liquidación Lote ${a?.codigoLote || 'LT'}`,
            codigoLote: a?.codigoLote || 'LT-000',
            nombreProducto: a?.nombreProducto || 'Producto Agrícola',
            descuentoSugerido: a?.sugerenciaDescuento || 15,
            precioOriginal: 40.00,
            precioPromocion: 34.00,
            justificacionIA: `Generado automáticamente por alerta urgente de caducidad en ${a?.diasRestantes} días.`,
            estado: 'SUGERIDA',
            fechaCreacion: '2026-07-03',
            fechaVigencia: a?.fechaCaducidad || '2026-07-30'
          };
          this.mockPromociones.unshift(promo);
          return of(promo);
        }
        return throwError(() => err);
      })
    );
  }

  // ================= PROMOCIONES & REGLAS IA =================
  listarPromociones(): Observable<PromocionIADTO[]> {
    return this.http.get<PromocionIADTO[]>(`${this.apiUrl}/promociones`).pipe(
      catchError(err => {
        if (err.status === 0 || err.status === 404) return of([...this.mockPromociones]);
        return throwError(() => err);
      })
    );
  }

  cambiarEstadoPromocion(idPromocion: number, estado: 'APROBADA' | 'RECHAZADA' | 'ACTIVA'): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/promociones/${idPromocion}/estado`, { estado }).pipe(
      catchError(err => {
        if (err.status === 0 || err.status === 404) {
          const p = this.mockPromociones.find(x => x.idPromocion === idPromocion);
          if (p) p.estado = estado;
          return of(undefined);
        }
        return throwError(() => err);
      })
    );
  }

  obtenerReglaNegocioIA(): Observable<ReglaNegocioIADTO> {
    return this.http.get<ReglaNegocioIADTO>(`${this.apiUrl}/ia/reglas`).pipe(
      catchError(err => {
        if (err.status === 0 || err.status === 404) return of({ ...this.mockRegla });
        return throwError(() => err);
      })
    );
  }

  actualizarReglaNegocioIA(regla: Partial<ReglaNegocioIADTO>): Observable<ReglaNegocioIADTO> {
    return this.http.put<ReglaNegocioIADTO>(`${this.apiUrl}/ia/reglas`, regla).pipe(
      catchError(err => {
        if (err.status === 0 || err.status === 404) {
          this.mockRegla = { ...this.mockRegla, ...regla };
          return of({ ...this.mockRegla });
        }
        return throwError(() => err);
      })
    );
  }
}
