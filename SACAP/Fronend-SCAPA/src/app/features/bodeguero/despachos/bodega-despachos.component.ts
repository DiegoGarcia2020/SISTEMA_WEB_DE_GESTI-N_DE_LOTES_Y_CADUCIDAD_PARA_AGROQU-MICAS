import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { environment } from '../../../../environments/environment';

export interface OrdenPendienteDTO {
  id: number;
  numeroComprobante: string;
  tecnico: string;
  fechaEstimadaEntrega: string;
  ventanaHoraria: string;
  estado: string;
}

export interface DesgloseLoteDespachoDTO {
  nombreProducto: string;
  numeroLote: string;
  fechaVencimiento: string;
  cantidad: number;
  nombreAlmacen: string;
  nombreZona: string;
  codigoEstanteria: string;
  codigoUbicacion: string;
}

export interface DevolucionTransitoDTO {
  id: number;
  idVenta: number;
  numeroComprobante: string;
  nombreCliente: string;
  nombreTecnico: string;
  idProducto: number;
  nombreProducto: string;
  cantidadDevuelta: number;
  motivo: string;
  fechaSolicitud: string;
  estadoLogistico: string;
  estadoInventario: string;
  fechaRecepcion: string;
}

import { ComprobanteService } from '../../../core/services/comprobante.service';
import { InventarioService, AlmacenDTO, ZonaDTO, EstanteriaDTO, UbicacionDTO } from '../../../core/services/inventario.service';

@Component({
  selector: 'app-bodega-despachos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bodega-despachos.component.html',
  styleUrls: ['./bodega-despachos.component.css']
})
export class BodegaDespachosComponent implements OnInit {
  private http = inject(HttpClient);
  private toast = inject(ToastService);
  private comprobanteService = inject(ComprobanteService);

  activeTab = signal<'preparar' | 'devoluciones'>('preparar');
  ordenesPendientes = signal<OrdenPendienteDTO[]>([]);
  devolucionesEnTransito = signal<DevolucionTransitoDTO[]>([]);
  paginaDevoluciones = signal<number>(0);
  totalPaginasDevoluciones = signal<number>(0);
  totalDevoluciones = signal<number>(0);
  tamanoPaginaDevoluciones = 20;
  processingIds = signal<Set<number>>(new Set());
  textoBusqueda = signal('');

  // Modal de Preparación FEFO
  modalAbierto = signal(false);
  lotesADespachar = signal<DesgloseLoteDespachoDTO[]>([]);
  cargandoLotes = signal(false);
  idVentaSeleccionada = signal<number | null>(null);

  // Modal de Reintegro
  private inventarioService = inject(InventarioService);
  modalReintegroAbierto = signal(false);
  devolucionSeleccionada = signal<DevolucionTransitoDTO | null>(null);
  opcionReintegro = signal<'ORIGINAL' | 'NUEVA'>('ORIGINAL');
  isProcessingReintegro = signal(false);

  // Cascada de ubicación (Reintegro)
  almacenes = signal<AlmacenDTO[]>([]);
  zonas = signal<ZonaDTO[]>([]);
  estanterias = signal<EstanteriaDTO[]>([]);
  ubicaciones = signal<UbicacionDTO[]>([]);

  idAlmacenSel = signal<number | null>(null);
  idZonaSel = signal<number | null>(null);
  idEstanteriaSel = signal<number | null>(null);
  ubicacionSel = signal<UbicacionDTO | null>(null);

  ngOnInit(): void {
    this.cargarOrdenesPendientes();
    this.cargarDevoluciones();
    this.cargarAlmacenes();
  }

  setActiveTab(tab: 'preparar' | 'devoluciones') {
    this.activeTab.set(tab);
    if (tab === 'preparar') this.cargarOrdenesPendientes();
    if (tab === 'devoluciones') this.cargarDevoluciones();
  }

  isProcessing(id: number): boolean {
    return this.processingIds().has(id);
  }

  setProcessing(id: number, status: boolean) {
    const newSet = new Set(this.processingIds());
    if (status) newSet.add(id);
    else newSet.delete(id);
    this.processingIds.set(newSet);
  }

  cargarOrdenesPendientes() {
    const texto = this.textoBusqueda().trim();
    const params: Record<string, string> = texto ? { busqueda: texto } : {};
    this.http.get<OrdenPendienteDTO[]>(`${environment.apiUrl}/operaciones/despachos/pendientes`, { params })
      .subscribe({
        next: (data) => this.ordenesPendientes.set(data || []),
        error: () => this.toast.error('Error', 'No se pudieron cargar las órdenes pendientes de preparación')
      });
  }

  cargarDevoluciones() {
    const params = { page: this.paginaDevoluciones().toString(), size: this.tamanoPaginaDevoluciones.toString() };
    this.http.get<{ content: DevolucionTransitoDTO[]; totalElements: number; totalPages: number }>(
      `${environment.apiUrl}/operaciones/devoluciones-venta/pendientes-bodega`, { params })
      .subscribe({
        next: (pagina) => {
          this.devolucionesEnTransito.set(pagina.content);
          this.totalPaginasDevoluciones.set(pagina.totalPages);
          this.totalDevoluciones.set(pagina.totalElements);
        },
        error: () => this.toast.error('Error', 'No se pudieron cargar las devoluciones pendientes')
      });
  }

  irAPaginaDevoluciones(pagina: number) {
    this.paginaDevoluciones.set(pagina);
    this.cargarDevoluciones();
  }

  abrirModalPreparacion(idVenta: number) {
    this.idVentaSeleccionada.set(idVenta);
    this.lotesADespachar.set([]);
    this.cargandoLotes.set(true);
    this.modalAbierto.set(true);

    this.http.get<DesgloseLoteDespachoDTO[]>(`${environment.apiUrl}/operaciones/despachos/${idVenta}/lotes-a-despachar`)
      .subscribe({
        next: (lotes) => {
          this.lotesADespachar.set(lotes || []);
          this.cargandoLotes.set(false);
        },
        error: () => {
          this.toast.error('Error', 'No se pudieron cargar los lotes de la orden.');
          this.cerrarModalPreparacion();
        }
      });
  }

  cerrarModalPreparacion() {
    this.modalAbierto.set(false);
    this.idVentaSeleccionada.set(null);
    this.lotesADespachar.set([]);
  }

  confirmarPreparacion() {
    const idVenta = this.idVentaSeleccionada();
    if (!idVenta) return;

    this.setProcessing(idVenta, true);
    this.cerrarModalPreparacion();

    this.http.put(`${environment.apiUrl}/operaciones/despachos/${idVenta}/preparar`, {})
      .subscribe({
        next: () => {
          this.toast.success('Paquete Preparado', `La orden #${idVenta} está lista para despacho.`);
          this.ordenesPendientes.update(ords => ords.filter(o => o.id !== idVenta));
          this.setProcessing(idVenta, false);
        },
        error: (err) => {
          this.toast.error('Error', 'No se pudo preparar la orden.');
          this.setProcessing(idVenta, false);
        }
      });
  }

  recibirDevolucion(idDevolucion: number, estadoInventario: 'CUARENTENA' | 'DISPONIBLE' | 'DESECHADO') {
    if (estadoInventario === 'DISPONIBLE') {
      const dev = this.devolucionesEnTransito().find(d => d.id === idDevolucion);
      if (dev) this.abrirModalReintegro(dev);
      return;
    }

    this.enviarRecepcionFisica(idDevolucion, { estadoInventario });
  }

  abrirModalReintegro(dev: DevolucionTransitoDTO) {
    this.devolucionSeleccionada.set(dev);
    this.opcionReintegro.set('ORIGINAL');
    this.modalReintegroAbierto.set(true);
    
    // Reset cascada
    this.idAlmacenSel.set(null);
    this.idZonaSel.set(null);
    this.idEstanteriaSel.set(null);
    this.ubicacionSel.set(null);
    this.zonas.set([]);
    this.estanterias.set([]);
    this.ubicaciones.set([]);
  }

  cerrarModalReintegro() {
    this.modalReintegroAbierto.set(false);
    this.devolucionSeleccionada.set(null);
    this.isProcessingReintegro.set(false);
  }

  confirmarReintegro() {
    const dev = this.devolucionSeleccionada();
    if (!dev) return;

    const payload: any = { estadoInventario: 'DISPONIBLE' };
    
    if (this.opcionReintegro() === 'NUEVA') {
      const u = this.ubicacionSel();
      if (!u) {
        this.toast.error('Error', 'Debe seleccionar una ubicación destino');
        return;
      }
      payload.idUbicacionDestino = u.idUbicacion;
    }

    this.isProcessingReintegro.set(true);
    this.enviarRecepcionFisica(dev.id, payload, true);
  }

  private enviarRecepcionFisica(idDevolucion: number, payload: any, fromModal: boolean = false) {
    this.http.put(`${environment.apiUrl}/operaciones/devoluciones-venta/${idDevolucion}/recibir-fisica`, payload)
      .subscribe({
        next: () => {
          this.toast.success('Devolución Recibida', `El producto ha sido ingresado a ${payload.estadoInventario}.`);
          this.devolucionesEnTransito.update(devs => devs.map(d => 
            d.id === idDevolucion 
              ? { ...d, estadoLogistico: 'RECIBIDO_BODEGA', estadoInventario: payload.estadoInventario, fechaRecepcion: new Date().toISOString() }
              : d
          ));
          if (fromModal) this.cerrarModalReintegro();
        },
        error: (err) => {
          const msg = err.error?.message || err.error || err.message || 'No se pudo procesar la recepción física.';
          this.toast.error('Error', msg);
          if (fromModal) this.isProcessingReintegro.set(false); // No cerramos el modal, permitimos corregir
        }
      });
  }

  // Cascada de ubicaciones
  cargarAlmacenes() {
    this.inventarioService.getAlmacenes().subscribe({ next: a => this.almacenes.set(a) });
  }

  onAlmacenChange(event: Event) {
    const id = Number((event.target as HTMLSelectElement).value);
    this.idAlmacenSel.set(id || null);
    this.idZonaSel.set(null);
    this.idEstanteriaSel.set(null);
    this.ubicacionSel.set(null);
    this.zonas.set([]);
    this.estanterias.set([]);
    this.ubicaciones.set([]);

    if (id) {
      this.inventarioService.getZonas(id).subscribe({ next: z => this.zonas.set(z) });
    }
  }

  onZonaChange(event: Event) {
    const id = Number((event.target as HTMLSelectElement).value);
    this.idZonaSel.set(id || null);
    this.idEstanteriaSel.set(null);
    this.ubicacionSel.set(null);
    this.estanterias.set([]);
    this.ubicaciones.set([]);

    if (id) {
      this.inventarioService.getEstanterias(id).subscribe({ next: est => this.estanterias.set(est) });
    }
  }

  onEstanteriaChange(event: Event) {
    const id = Number((event.target as HTMLSelectElement).value);
    this.idEstanteriaSel.set(id || null);
    this.ubicacionSel.set(null);
    this.ubicaciones.set([]);

    if (id) {
      this.inventarioService.getUbicaciones(id).subscribe({ next: u => this.ubicaciones.set(u) });
    }
  }

  onUbicacionChange(event: Event) {
    const id = Number((event.target as HTMLSelectElement).value);
    const found = this.ubicaciones().find(u => u.idUbicacion === id) || null;
    this.ubicacionSel.set(found);
  }

  descargarNotaDevolucion(dev: DevolucionTransitoDTO) {
    this.comprobanteService.generarNotaDevolucion(dev as any);
  }

  calcularDiasRestantes(fechaVencimiento: string): number | null {
    if (!fechaVencimiento) return null;
    const fv = new Date(fechaVencimiento);
    const hoy = new Date();
    // Normalizar a medianoche para evitar diferencias por hora
    fv.setHours(0, 0, 0, 0);
    hoy.setHours(0, 0, 0, 0);
    const diffTime = fv.getTime() - hoy.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}
