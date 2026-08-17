import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventarioService, LoteDTO, AlmacenDTO, ZonaDTO, EstanteriaDTO, UbicacionDTO } from '../../../core/services/inventario.service';

@Component({
  selector: 'app-asignacion-ubicacion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './asignacion-ubicacion.component.html',
  styleUrl:    './asignacion-ubicacion.component.css'
})
export class AsignacionUbicacionComponent implements OnInit {

  private inventario = inject(InventarioService);

  // Lotes Flotantes / Por ubicar
  lotesFlotantes = signal<LoteDTO[]>([]);
  cargandoLotes  = signal(true);
  loteSeleccionado = signal<LoteDTO | null>(null);

  // Cascada de ubicación
  almacenes   = signal<AlmacenDTO[]>([]);
  zonas       = signal<ZonaDTO[]>([]);
  estanterias = signal<EstanteriaDTO[]>([]);
  ubicaciones = signal<UbicacionDTO[]>([]);

  idAlmacenSel   = signal<number | null>(null);
  idZonaSel      = signal<number | null>(null);
  idEstanteriaSel = signal<number | null>(null);
  ubicacionSel   = signal<UbicacionDTO | null>(null);

  // Formulario
  cantidadAUbicar = 0;
  observaciones   = '';
  guardando       = signal(false);
  error           = signal('');
  exito           = signal('');

  ngOnInit() {
    this.cargarLotesFlotantes();
    this.cargarAlmacenes();
  }

  cargarLotesFlotantes() {
    this.cargandoLotes.set(true);
    this.inventario.getLotesPendientes().subscribe({
      next: data => {
        this.lotesFlotantes.set(data || []);
        if (data?.length && !this.loteSeleccionado()) {
          this.seleccionarLote(data[0]);
        }
        this.cargandoLotes.set(false);
      },
      error: () => {
        this.cargandoLotes.set(false);
      }
    });
  }

  seleccionarLote(lote: LoteDTO) {
    this.loteSeleccionado.set(lote);
    this.cantidadAUbicar = lote.cantidadActual || lote.cantidadInicial || 0;
    this.error.set('');
    this.exito.set('');
  }

  /** Cantidad que quedó registrada al recepcionar el lote — referencia para detectar diferencias al contar físicamente. */
  cantidadRegistrada(): number | null {
    const lote = this.loteSeleccionado();
    if (!lote) return null;
    return lote.cantidadActual || lote.cantidadInicial || 0;
  }

  // Cascada seleccion
  cargarAlmacenes() {
    this.inventario.getAlmacenes().subscribe({ next: a => this.almacenes.set(a) });
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
      this.inventario.getZonas(id).subscribe({ next: z => this.zonas.set(z) });
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
      this.inventario.getEstanterias(id).subscribe({ next: est => this.estanterias.set(est) });
    }
  }

  onEstanteriaChange(event: Event) {
    const id = Number((event.target as HTMLSelectElement).value);
    this.idEstanteriaSel.set(id || null);
    this.ubicacionSel.set(null);
    this.ubicaciones.set([]);

    if (id) {
      this.inventario.getUbicaciones(id).subscribe({ next: u => this.ubicaciones.set(u) });
    }
  }

  onUbicacionChange(event: Event) {
    const id = Number((event.target as HTMLSelectElement).value);
    const found = this.ubicaciones().find(u => u.idUbicacion === id) || null;
    this.ubicacionSel.set(found);
    this.error.set('');
  }

  // Asignar
  asignarUbicacion() {
    const lote = this.loteSeleccionado();
    const ubic = this.ubicacionSel();

    if (!lote) {
      this.error.set('Seleccione un lote flotante.');
      return;
    }
    if (!ubic) {
      this.error.set('Seleccione la ubicación física de destino.');
      return;
    }
    if (!this.cantidadAUbicar || this.cantidadAUbicar < 1) {
      this.error.set('Ingrese una cantidad válida a ubicar.');
      return;
    }

    // Validar contra la cantidad que quedó registrada al recepcionar el lote
    const cantidadRegistrada = this.cantidadRegistrada() ?? 0;
    if (this.cantidadAUbicar > cantidadRegistrada) {
      this.error.set(`No puede ubicar más unidades (${this.cantidadAUbicar}) que las registradas en el lote (${cantidadRegistrada}).`);
      return;
    }
    if (this.cantidadAUbicar !== cantidadRegistrada && !this.observaciones.trim()) {
      this.error.set(`Contó ${this.cantidadAUbicar} de ${cantidadRegistrada} unidades registradas. Explique la diferencia en Observaciones antes de confirmar.`);
      return;
    }

    // Validar capacidad local antes de enviar
    const capMax = ubic.capacidadMaxima ?? 100;
    const capAct = ubic.capacidadActual ?? 0;
    const capDisp = Math.max(0, capMax - capAct);

    if (this.cantidadAUbicar > capDisp) {
      this.error.set(`Capacidad física excedida. La ubicación solo tiene espacio para ${capDisp} unidades.`);
      return;
    }

    this.guardando.set(true);
    this.error.set('');
    this.exito.set('');

    this.inventario.validarLote(lote.idLote, {
      cantidadValidada: this.cantidadAUbicar,
      idUbicacion: ubic.idUbicacion,
      observaciones: this.observaciones
    }).subscribe({
      next: () => {
        this.exito.set(`Lote ${lote.numeroLote} asignado exitosamente a la ubicación ${ubic.descripcionCompleta}. Pasa a estado DISPONIBLE.`);
        this.guardando.set(false);
        this.loteSeleccionado.set(null);
        this.observaciones = '';
        this.cargarLotesFlotantes();
      },
      error: err => {
        this.guardando.set(false);
        const msg = err.error?.message || err.error || err.message || 'Error al ubicar el lote.';
        this.error.set(msg);
      }
    });
  }
}
