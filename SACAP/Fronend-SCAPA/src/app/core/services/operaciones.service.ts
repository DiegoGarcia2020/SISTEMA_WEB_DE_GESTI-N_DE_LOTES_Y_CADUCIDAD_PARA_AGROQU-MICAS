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

  // ================= MOCKS DE OPERACIONES (DESPACHOS, USO EN CAMPO, DEVOLUCIONES) =================
  private mockLotesFefo: any[] = [
    { idLote: 101, numeroLote: 'LT-2026-089', idProducto: 1, nombreProducto: 'Fertilizante Urea Agrícola 46% N', cantidadActual: 150, fechaVencimiento: '2026-07-15', nombreProveedor: 'Agroquímicos del Pacífico', ubicacionAlmacen: 'Bodega Central Quevedo - Pasillo 2' },
    { idLote: 102, numeroLote: 'LT-2026-042', idProducto: 2, nombreProducto: 'Fungicida Carbendazim 500 SC', cantidadActual: 45, fechaVencimiento: '2026-07-18', nombreProveedor: 'Bayer CropScience', ubicacionAlmacen: 'Almacén Agroquímicos Norte - Estante A' },
    { idLote: 103, numeroLote: 'LT-2026-112', idProducto: 3, nombreProducto: 'Semilla Híbrida Maíz Trueno', cantidadActual: 80, fechaVencimiento: '2026-08-10', nombreProveedor: 'Semillas Certificadas S.A.', ubicacionAlmacen: 'Bodega Climatizada Sur' },
    { idLote: 104, numeroLote: 'LT-2026-005', idProducto: 4, nombreProducto: 'Insecticida Cipermetrina 25 EC', cantidadActual: 120, fechaVencimiento: '2026-08-25', nombreProveedor: 'Syngenta Ecuador', ubicacionAlmacen: 'Almacén Agroquímicos Norte - Estante B' }
  ];

  private mockDespachos: any[] = [
    { idMovimiento: 501, cantidad: 20, observacion: 'Despacho FEFO para campaña Maíz Verano', idLote: 101, idTipoMovimiento: 2, idUsuario: 3, idEstadoAprobacion: 2, fechaMovimiento: '2026-07-18', lote: { numeroLote: 'LT-2026-089', producto: { nombre: 'Fertilizante Urea Agrícola 46% N' } } },
    { idMovimiento: 502, cantidad: 10, observacion: 'Urgente para control de hongos en lote 4', idLote: 102, idTipoMovimiento: 2, idUsuario: 3, idEstadoAprobacion: 1, fechaMovimiento: '2026-07-17', lote: { numeroLote: 'LT-2026-042', producto: { nombre: 'Fungicida Carbendazim 500 SC' } } }
  ];

  private mockUsosCampo: any[] = [
    { idUsoCampo: 701, parcela: 'Parcela Norte - Lote A', cultivo: 'Maíz Híbrido INIAP', fechaAplicacion: '2026-07-16', cantidadUsada: 15, observacion: 'Aplicación foliar en etapa V8', idLote: 101, lote: { numeroLote: 'LT-2026-089', producto: { nombre: 'Fertilizante Urea Agrícola 46% N' } } },
    { idUsoCampo: 702, parcela: 'Parcela Sur - Cacao CCN51', cultivo: 'Cacao CCN-51', fechaAplicacion: '2026-07-15', cantidadUsada: 5, observacion: 'Control preventivo moniliasis', idLote: 102, lote: { numeroLote: 'LT-2026-042', producto: { nombre: 'Fungicida Carbendazim 500 SC' } } }
  ];

  private mockDevoluciones: any[] = [
    { idDevolucion: 901, motivo: 'Envases con filtración / sello dañado de fábrica', cantidadDevuelta: 12, idLote: 104, idProveedor: 4, idEstadoAprobacion: 2, fechaDevolucion: '2026-07-18', lote: { numeroLote: 'LT-2026-005', producto: { nombre: 'Insecticida Cipermetrina 25 EC' } }, proveedor: { nombre: 'Syngenta Ecuador' } },
    { idDevolucion: 902, motivo: 'Cristalización parcial del producto líquido', cantidadDevuelta: 8, idLote: 102, idProveedor: 2, idEstadoAprobacion: 1, fechaDevolucion: '2026-07-14', lote: { numeroLote: 'LT-2026-042', producto: { nombre: 'Fungicida Carbendazim 500 SC' } }, proveedor: { nombre: 'Bayer CropScience' } }
  ];

  // ================= MOCKS DE VENTAS: CLIENTES, PEDIDOS, COMBOS =================
  private mockClientes: any[] = [
    { idCliente: 1, nombreFinca: 'Hacienda El Paraíso - Cacao & Maíz', cedula: '1204567890', telefono: '0987654321', direccion: 'Vía Quevedo - San Carlos Km 4', idEstado: 1, idTecnico: 1 },
    { idCliente: 2, nombreFinca: 'Finca La Esperanza - Agrícola del Río', cedula: '1712345678', telefono: '0991122334', direccion: 'Recinto La Virginia', idEstado: 1, idTecnico: 1 },
    { idCliente: 3, nombreFinca: 'Agropecuaria Santa Rosa S.A.', cedula: '0923456781', telefono: '0988776655', direccion: 'Mocache Centro - Sector 3', idEstado: 1, idTecnico: 1 }
  ];

  private mockPedidos: any[] = [
    {
      idUso: 801,
      idCliente: 1,
      cliente: { nombreFinca: 'Hacienda El Paraíso - Cacao & Maíz', cedula: '1204567890' },
      descripcionPlaga: 'Brote moderado de moniliasis en mazorcas jóvenes por exceso de humedad',
      idLote: 102,
      lote: { numeroLote: 'LT-2026-042', nombreProducto: 'Fungicida Carbendazim 500 SC', ubicacionAlmacen: 'Almacén Agroquímicos Norte - Estante A' },
      cantidadUsada: 10,
      cantidadReservada: 10,
      observacion: 'Receta preventivo-curativa de ciclo rápido (Combo IA aplicado #102)',
      idEstadoPedido: 1, // 1: PENDIENTE_BODEGA
      idComboAplicado: 102,
      fechaAplicacion: '2026-07-18',
      tipoRegistro: 'ORDEN_PEDIDO'
    },
    {
      idUso: 802,
      idCliente: 2,
      cliente: { nombreFinca: 'Finca La Esperanza - Agrícola del Río', cedula: '1712345678' },
      descripcionPlaga: 'Deficiencia severa de nitrógeno en hojas de maíz en floración',
      idLote: 101,
      lote: { numeroLote: 'LT-2026-089', nombreProducto: 'Fertilizante Urea Agrícola 46% N', ubicacionAlmacen: 'Bodega Central Quevedo - Pasillo 2' },
      cantidadUsada: 25,
      cantidadReservada: 0,
      observacion: 'Despacho completado en bodega para aplicación en fertilizadora',
      idEstadoPedido: 2, // 2: DESPACHADO
      idComboAplicado: 101,
      fechaAplicacion: '2026-07-17',
      tipoRegistro: 'ORDEN_PEDIDO'
    }
  ];

  private mockCombosKit: any[] = [
    {
      idPromocion: 101,
      nombrePromocion: 'Combo Liquidación Rápida Urea + Bioestimulante',
      descripcion: 'Promo especial para empujar lote LT-2026-089 por caducidad cercana (12 días). Descuento del 20% al llevar más de 10 sacos.',
      descuentoGlobal: 20.0,
      fechaInicio: '2026-07-01',
      fechaFin: '2026-07-15',
      idEstado: 1, // 1: ACTIVO
      codigoLoteRef: 'LT-2026-089',
      productoRef: 'Fertilizante Urea Agrícola 46% N',
      stockLote: 150
    },
    {
      idPromocion: 102,
      nombrePromocion: 'Kit Antifúngico Preventivo Cacao (Carbendazim 4x3)',
      descripcion: 'Combo diseñado por IA AgroSense para rotar Carbendazim antes de fecha crítica. Descuento del 25% por compra en combo o receta.',
      descuentoGlobal: 25.0,
      fechaInicio: '2026-07-02',
      fechaFin: '2026-07-18',
      idEstado: 1, // 1: ACTIVO
      codigoLoteRef: 'LT-2026-042',
      productoRef: 'Fungicida Carbendazim 500 SC',
      stockLote: 45
    },
    {
      idPromocion: 103,
      nombrePromocion: 'Pack Semilla Maíz Trueno + Arranque Fosfatado',
      descripcion: 'Descuento preventivo por rotación de bodega sur. 15% de rebaja en semilla certificada combinada con abono.',
      descuentoGlobal: 15.0,
      fechaInicio: '2026-06-25',
      fechaFin: '2026-08-10',
      idEstado: 2, // 2: SUGERIDA / PENDIENTE DE APROBACIÓN SUPERVISOR
      codigoLoteRef: 'LT-2026-112',
      productoRef: 'Semilla Híbrida Maíz Trueno',
      stockLote: 80
    }
  ];

  // ================= ENDPOINTS DE DESPACHOS FEFO & LOTES =================
  listarLotesDisponiblesFefo(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/movimientos/lotes-disponibles`).pipe(
      catchError(err => {
        if (err.status === 0 || err.status === 404) return of([...this.mockLotesFefo]);
        return throwError(() => err);
      })
    );
  }

  despacharFefo(payload: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/movimientos/despachos-fefo`, payload).pipe(
      catchError(err => {
        if (err.status === 0 || err.status === 404) {
          const newId = Math.max(...this.mockDespachos.map(d => d.idMovimiento), 500) + 1;
          const prod = this.mockLotesFefo.find(l => l.idProducto === payload.idProducto);
          const nuevo = {
            idMovimiento: newId,
            cantidad: payload.cantidad,
            observacion: payload.observacion || 'Despacho FEFO registrado',
            idLote: prod ? prod.idLote : 101,
            idTipoMovimiento: 2,
            idUsuario: payload.idUsuario || 1,
            idEstadoAprobacion: 2,
            fechaMovimiento: new Date().toISOString().split('T')[0],
            lote: { numeroLote: prod ? prod.numeroLote : 'LT-2026-089', producto: { nombre: prod ? prod.nombreProducto : 'Producto Agrícola' } }
          };
          this.mockDespachos.unshift(nuevo);
          return of({ mensaje: 'Despacho FEFO registrado offline (simulado)' });
        }
        return throwError(() => err);
      })
    );
  }

  listarDespachosPendientes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/movimientos/pendientes`).pipe(
      catchError(err => {
        if (err.status === 0 || err.status === 404) return of(this.mockDespachos.filter(d => d.idEstadoAprobacion === 2));
        return throwError(() => err);
      })
    );
  }

  listarTodosMovimientos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/movimientos`).pipe(
      catchError(err => {
        if (err.status === 0 || err.status === 404) return of([...this.mockDespachos]);
        return throwError(() => err);
      })
    );
  }

  aprobarDespacho(idMovimiento: number, observacion?: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/movimientos/${idMovimiento}/aprobar`, {}, { params: { observacion: observacion || 'Aprobado' } }).pipe(
      catchError(err => {
        if (err.status === 0 || err.status === 404) {
          const d = this.mockDespachos.find(x => x.idMovimiento === idMovimiento);
          if (d) d.idEstadoAprobacion = 1;
          return of({ mensaje: 'Aprobado offline' });
        }
        return throwError(() => err);
      })
    );
  }

  rechazarDespacho(idMovimiento: number, observacion?: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/movimientos/${idMovimiento}/rechazar`, {}, { params: { observacion: observacion || 'Rechazado' } }).pipe(
      catchError(err => {
        if (err.status === 0 || err.status === 404) {
          const d = this.mockDespachos.find(x => x.idMovimiento === idMovimiento);
          if (d) d.idEstadoAprobacion = 3;
          return of({ mensaje: 'Rechazado offline' });
        }
        return throwError(() => err);
      })
    );
  }

  // ================= ENDPOINTS DE USO EN CAMPO =================
  crearUsoCampo(payload: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/uso-campo`, payload).pipe(
      catchError(err => {
        if (err.status === 0 || err.status === 404) {
          const newId = Math.max(...this.mockUsosCampo.map(u => u.idUsoCampo), 700) + 1;
          const lote = this.mockLotesFefo.find(l => l.idLote === payload.idLote);
          const nuevo = {
            idUsoCampo: newId,
            parcela: payload.cultivoParcela || 'Parcela General',
            cultivo: payload.cultivoParcela || 'Cultivo Agrícola',
            fechaAplicacion: payload.fechaUso || new Date().toISOString().split('T')[0],
            cantidadUsada: payload.cantidadUsada,
            observacion: payload.observaciones || 'Aplicación en campo',
            idLote: payload.idLote,
            lote: { numeroLote: lote ? lote.numeroLote : 'LT-2026-089', producto: { nombre: lote ? lote.nombreProducto : 'Insumo Agrícola' } }
          };
          this.mockUsosCampo.unshift(nuevo);
          if (lote) lote.cantidadActual = Math.max(0, lote.cantidadActual - payload.cantidadUsada);
          return of({ mensaje: 'Uso en campo registrado offline (simulado)' });
        }
        return throwError(() => err);
      })
    );
  }

  listarUsoCampo(fechaInicio?: string, fechaFin?: string, cultivo?: string): Observable<any[]> {
    let params: any = {};
    if (fechaInicio) params.fechaInicio = fechaInicio;
    if (fechaFin) params.fechaFin = fechaFin;
    if (cultivo) params.cultivo = cultivo;

    return this.http.get<any[]>(`${this.apiUrl}/uso-campo/filtrado`, { params }).pipe(
      catchError(err => {
        if (err.status === 0 || err.status === 404) {
          return of(this.mockUsosCampo.filter(u => {
            const matchIn = !fechaInicio || u.fechaAplicacion >= fechaInicio;
            const matchFi = !fechaFin || u.fechaAplicacion <= fechaFin;
            const matchCu = !cultivo || u.cultivo.toLowerCase().includes(cultivo.toLowerCase()) || u.parcela.toLowerCase().includes(cultivo.toLowerCase());
            return matchIn && matchFi && matchCu;
          }));
        }
        return throwError(() => err);
      })
    );
  }

  // ================= ENDPOINTS DE DEVOLUCIONES =================
  crearDevolucion(payload: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/devoluciones`, payload).pipe(
      catchError(err => {
        if (err.status === 0 || err.status === 404) {
          const newId = Math.max(...this.mockDevoluciones.map(d => d.idDevolucion), 900) + 1;
          const lote = this.mockLotesFefo.find(l => l.idLote === payload.idLote);
          const nuevo = {
            idDevolucion: newId,
            motivo: payload.motivo || 'Devolución por defectos',
            cantidadDevuelta: payload.cantidadDevuelta,
            idLote: payload.idLote,
            idProveedor: payload.idProveedor,
            idEstadoAprobacion: 2,
            fechaDevolucion: new Date().toISOString().split('T')[0],
            lote: { numeroLote: lote ? lote.numeroLote : 'LT-2026-005', producto: { nombre: lote ? lote.nombreProducto : 'Insumo' } },
            proveedor: { nombre: lote ? lote.nombreProveedor : 'Proveedor Registrado' }
          };
          this.mockDevoluciones.unshift(nuevo);
          return of({ mensaje: 'Devolución registrada offline (simulado)' });
        }
        return throwError(() => err);
      })
    );
  }

  listarDevolucionesPendientes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/devoluciones/pendientes`).pipe(
      catchError(err => {
        if (err.status === 0 || err.status === 404) return of(this.mockDevoluciones.filter(d => d.idEstadoAprobacion === 2));
        return throwError(() => err);
      })
    );
  }

  listarTodasDevoluciones(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/devoluciones`).pipe(
      catchError(err => {
        if (err.status === 0 || err.status === 404) return of([...this.mockDevoluciones]);
        return throwError(() => err);
      })
    );
  }

  cambiarEstadoDevolucion(idDevolucion: number, payload: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/devoluciones/${idDevolucion}/cambiar-estado`, payload).pipe(
      catchError(err => {
        if (err.status === 0 || err.status === 404) {
          const dev = this.mockDevoluciones.find(x => x.idDevolucion === idDevolucion);
          if (dev) dev.idEstadoAprobacion = payload.idEstadoAprobacion;
          return of({ mensaje: 'Estado de devolución actualizado offline' });
        }
        return throwError(() => err);
      })
    );
  }

  // ================= ENDPOINTS DE VENTAS: CLIENTES =================
  listarClientes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/clientes`).pipe(
      catchError(err => {
        if (err.status === 0 || err.status === 404) return of([...this.mockClientes]);
        return throwError(() => err);
      })
    );
  }

  crearCliente(payload: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/clientes`, payload).pipe(
      catchError(err => {
        if (err.status === 0 || err.status === 404) {
          const newId = Math.max(...this.mockClientes.map(c => c.idCliente), 0) + 1;
          const nuevo = {
            idCliente: newId,
            nombreFinca: payload.nombreFinca,
            cedula: payload.cedula,
            telefono: payload.telefono || '',
            direccion: payload.direccion || '',
            idEstado: 1,
            idTecnico: payload.idTecnico || 1
          };
          this.mockClientes.push(nuevo);
          return of({ mensaje: 'Cliente creado offline (simulado)', cliente: nuevo });
        }
        return throwError(() => err);
      })
    );
  }

  // ================= ENDPOINTS DE VENTAS: ÓRDENES DE PEDIDO =================
  crearOrdenPedido(payload: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/operaciones/pedidos`, payload).pipe(
      catchError(err => {
        if (err.status === 0 || err.status === 404) {
          const newId = Math.max(...this.mockPedidos.map(p => p.idUso), 800) + 1;
          const cliente = this.mockClientes.find(c => c.idCliente === Number(payload.idCliente));
          const lote = this.mockLotesFefo.find(l => l.idLote === Number(payload.idLote));
          const nuevo = {
            idUso: newId,
            idCliente: payload.idCliente,
            cliente: cliente ? { nombreFinca: cliente.nombreFinca, cedula: cliente.cedula } : { nombreFinca: 'Finca General', cedula: '9999999999' },
            descripcionPlaga: payload.descripcionPlaga,
            idLote: payload.idLote,
            lote: lote ? { numeroLote: lote.numeroLote, nombreProducto: lote.nombreProducto, ubicacionAlmacen: lote.ubicacionAlmacen } : { numeroLote: 'LT-000', nombreProducto: 'Producto Agrícola' },
            cantidadUsada: payload.cantidad,
            cantidadReservada: payload.cantidad,
            observacion: payload.observacion || 'Pedido generado por Técnico',
            idEstadoPedido: 1, // 1: PENDIENTE_BODEGA
            idComboAplicado: payload.idComboAplicado,
            fechaAplicacion: new Date().toISOString().split('T')[0],
            tipoRegistro: 'ORDEN_PEDIDO'
          };
          this.mockPedidos.unshift(nuevo);
          if (lote) {
            lote.cantidadReservada = (lote.cantidadReservada || 0) + payload.cantidad;
          }
          return of({ mensaje: 'Orden de pedido creada exitosamente (simulado)' });
        }
        return throwError(() => err);
      })
    );
  }

  listarPedidosPorTecnico(idTecnico: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/operaciones/pedidos/tecnico/${idTecnico}`).pipe(
      catchError(err => {
        if (err.status === 0 || err.status === 404) return of([...this.mockPedidos]);
        return throwError(() => err);
      })
    );
  }

  listarPedidosPendientesBodega(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/operaciones/pedidos/bodega/pendientes`).pipe(
      catchError(err => {
        if (err.status === 0 || err.status === 404) {
          return of(this.mockPedidos.filter(p => p.idEstadoPedido === 1));
        }
        return throwError(() => err);
      })
    );
  }

  despacharPedido(idOrden: number, idUsuarioBodeguero: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/operaciones/pedidos/${idOrden}/despachar`, {}, { params: { idUsuarioBodeguero } }).pipe(
      catchError(err => {
        if (err.status === 0 || err.status === 404) {
          const p = this.mockPedidos.find(x => x.idUso === idOrden);
          if (p) {
            p.idEstadoPedido = 2; // DESPACHADO
            const lote = this.mockLotesFefo.find(l => l.idLote === p.idLote);
            if (lote) {
              lote.cantidadActual = Math.max(0, (lote.cantidadActual || 0) - p.cantidadUsada);
              lote.cantidadReservada = Math.max(0, (lote.cantidadReservada || 0) - p.cantidadUsada);
            }
          }
          return of({ mensaje: 'Pedido despachado offline' });
        }
        return throwError(() => err);
      })
    );
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
    }).pipe(
      catchError(err => {
        if (err.status === 0 || err.status === 404) {
          const lote = this.mockLotesFefo.find(l => l.idLote === Number(payload.idLote));
          if (lote) {
            lote.cantidadActual = (lote.cantidadActual || 0) + Number(payload.cantidad);
          }
          if (payload.idPedidoOriginal) {
            const p = this.mockPedidos.find(x => x.idUso === Number(payload.idPedidoOriginal));
            if (p) p.idEstadoPedido = 5; // DEVUELTO
          }
          return of({ mensaje: 'Devolución de cliente registrada y stock sumado al lote (simulado)' });
        }
        return throwError(() => err);
      })
    );
  }

  // ================= ENDPOINTS DE COMBOS / KITTING =================
  listarCombosActivos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/ia/promociones/activas`).pipe(
      catchError(err => {
        if (err.status === 0 || err.status === 404) {
          return of(this.mockCombosKit.filter(c => c.idEstado === 1));
        }
        return throwError(() => err);
      })
    );
  }

  crearComboKit(payload: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/ia/promociones`, payload).pipe(
      catchError(err => {
        if (err.status === 0 || err.status === 404) {
          const newId = Math.max(...this.mockCombosKit.map(c => c.idPromocion), 100) + 1;
          const lote = this.mockLotesFefo.find(l => l.numeroLote === payload.codigoLoteRef || l.idLote === payload.idLoteRef);
          const nuevo = {
            idPromocion: newId,
            nombrePromocion: payload.nombrePromocion || payload.titulo,
            descripcion: payload.descripcion,
            descuentoGlobal: payload.descuentoGlobal || payload.porcentajeDescuento || 15,
            fechaInicio: payload.fechaInicio || new Date().toISOString().split('T')[0],
            fechaFin: payload.fechaFin || '2026-08-30',
            idEstado: 1, // ACTIVO
            codigoLoteRef: lote ? lote.numeroLote : (payload.codigoLoteRef || 'LT-GEN'),
            productoRef: lote ? lote.nombreProducto : (payload.productoRef || 'Insumo en Combo'),
            stockLote: lote ? lote.cantidadActual : 100
          };
          this.mockCombosKit.unshift(nuevo);
          return of({ mensaje: 'Combo/Kit creado offline', combo: nuevo });
        }
        return throwError(() => err);
      })
    );
  }

  // ================= MÓDULO COMPRAS: ÓRDENES DE COMPRA =================

  private mockOrdenesCompra: any[] = [
    {
      id: 1,
      idProveedor: 1,
      nombreProveedor: 'Agroquímicos del Pacífico',
      numeroFactura: 'FAC-001-2026-0045',
      fechaEmision: '2026-07-15',
      subtotalBruto: 3250.00,
      totalDescuentos: 325.00,
      costoTransporte: 50.00,
      impuestos: 351.00,
      totalNeto: 3326.00,
      estado: 'PENDIENTE',
      fechaRegistro: '2026-07-15T10:30:00',
      detalles: [
        { id: 1, idProducto: 1, nombreProducto: 'Fertilizante Urea Agrícola 46% N', unidadMedida: 'Sacos (50kg)', cantidad: 100, precioUnitario: 32.50, porcentajeDescuento: 10.00, valorDescuento: 325.00, subtotal: 2925.00, esBonificacion: false },
        { id: 2, idProducto: 1, nombreProducto: 'Fertilizante Urea Agrícola 46% N', unidadMedida: 'Sacos (50kg)', cantidad: 10, precioUnitario: 0.00, porcentajeDescuento: 0.00, valorDescuento: 0.00, subtotal: 0.00, esBonificacion: true }
      ]
    },
    {
      id: 2,
      idProveedor: 2,
      nombreProveedor: 'Bayer CropScience',
      numeroFactura: 'FAC-BAY-2026-1122',
      fechaEmision: '2026-07-10',
      subtotalBruto: 900.00,
      totalDescuentos: 0.00,
      costoTransporte: 25.00,
      impuestos: 108.00,
      totalNeto: 1033.00,
      estado: 'RECEPCIONADA',
      fechaRegistro: '2026-07-10T14:20:00',
      detalles: [
        { id: 3, idProducto: 2, nombreProducto: 'Fungicida Carbendazim 500 SC', unidadMedida: 'Litros', cantidad: 50, precioUnitario: 18.00, porcentajeDescuento: 0.00, valorDescuento: 0.00, subtotal: 900.00, esBonificacion: false }
      ]
    }
  ];

  crearOrdenCompra(payload: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/ordenes-compra`, payload).pipe(
      catchError(err => {
        if (err.status === 0 || err.status === 404) {
          const newId = Math.max(...this.mockOrdenesCompra.map(o => o.id), 0) + 1;
          const nueva = {
            id: newId,
            ...payload,
            nombreProveedor: 'Proveedor (Simulado)',
            subtotalBruto: 0,
            totalDescuentos: 0,
            totalNeto: 0,
            estado: 'PENDIENTE',
            fechaRegistro: new Date().toISOString(),
            detalles: payload.detalles || []
          };
          this.mockOrdenesCompra.unshift(nueva);
          return of({ mensaje: 'Orden de compra registrada exitosamente (simulado)', idOrden: newId, totalNeto: 0 });
        }
        return throwError(() => err);
      })
    );
  }

  listarOrdenesCompra(estado?: string, idProveedor?: number, desde?: string, hasta?: string): Observable<any[]> {
    let params: any = {};
    if (estado) params.estado = estado;
    if (idProveedor) params.idProveedor = idProveedor;
    if (desde) params.desde = desde;
    if (hasta) params.hasta = hasta;

    return this.http.get<any[]>(`${this.apiUrl}/ordenes-compra`, { params }).pipe(
      catchError(err => {
        if (err.status === 0 || err.status === 404) {
          return of(this.mockOrdenesCompra.filter(o => {
            const matchEst = !estado || o.estado === estado;
            const matchProv = !idProveedor || o.idProveedor === idProveedor;
            const matchDesde = !desde || o.fechaEmision >= desde;
            const matchHasta = !hasta || o.fechaEmision <= hasta;
            return matchEst && matchProv && matchDesde && matchHasta;
          }));
        }
        return throwError(() => err);
      })
    );
  }

  obtenerOrdenCompra(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/ordenes-compra/${id}`).pipe(
      catchError(err => {
        if (err.status === 0 || err.status === 404) {
          const orden = this.mockOrdenesCompra.find(o => o.id === id);
          if (orden) return of(orden);
          return throwError(() => new Error('Orden no encontrada'));
        }
        return throwError(() => err);
      })
    );
  }

  recepcionarOrden(id: number, payload: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/ordenes-compra/${id}/recepcionar`, payload).pipe(
      catchError(err => {
        if (err.status === 0 || err.status === 404) {
          const orden = this.mockOrdenesCompra.find(o => o.id === id);
          if (orden) orden.estado = 'RECEPCIONADA';
          return of({ mensaje: 'Orden recepcionada exitosamente. Lotes generados en estado FLOTANTE. (simulado)' });
        }
        return throwError(() => err);
      })
    );
  }

  anularOrdenCompra(id: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/ordenes-compra/${id}/anular`, {}).pipe(
      catchError(err => {
        if (err.status === 0 || err.status === 404) {
          const orden = this.mockOrdenesCompra.find(o => o.id === id);
          if (orden) orden.estado = 'ANULADA';
          return of({ mensaje: 'Orden anulada exitosamente (simulado)' });
        }
        return throwError(() => err);
      })
    );
  }

  obtenerUltimoPrecioProducto(idProducto: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/ordenes-compra/ultimo-precio/${idProducto}`).pipe(
      catchError(err => {
        if (err.status === 0 || err.status === 404) {
          // Mock: devolver precio del producto si existe
          const producto = this.mockLotesFefo.find(l => l.idProducto === idProducto);
          return of({ precioUnitario: producto ? 32.50 : 0, encontrado: !!producto });
        }
        return throwError(() => err);
      })
    );
  }
}

