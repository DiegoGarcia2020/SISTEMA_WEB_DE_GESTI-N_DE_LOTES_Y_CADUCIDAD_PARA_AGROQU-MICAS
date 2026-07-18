import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  InventarioService,
  LoteDTO, LoteValidacionRequest,
  AlmacenDTO, ZonaDTO, EstanteriaDTO, UbicacionDTO
} from '../../../core/services/inventario.service';

@Component({
  selector: 'app-recepcion-lote',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './recepcion-lote.component.html',
  styleUrl:    './recepcion-lote.component.css'
})
export class RecepcionLoteComponent implements OnInit {

  // Lista de lotes pendientes
  lotesPendientes  = signal<LoteDTO[]>([]);
  loteSeleccionado = signal<LoteDTO | null>(null);
  cargandoLotes    = signal(false);

  // Cascada de ubicación
  almacenes   = signal<AlmacenDTO[]>([]);
  zonas       = signal<ZonaDTO[]>([]);
  estanterias = signal<EstanteriaDTO[]>([]);
  ubicaciones = signal<UbicacionDTO[]>([]);

  cargandoZonas       = signal(false);
  cargandoEstanterias = signal(false);
  cargandoUbicaciones = signal(false);

  // Formulario de validación
  form: LoteValidacionRequest = { cantidadValidada: 0, idUbicacion: 0, observaciones: '' };

  validando = signal(false);
  exito     = signal<LoteDTO | null>(null);
  error     = signal('');

  constructor(private inventario: InventarioService) {}

  ngOnInit() {
    this.cargarPendientes();
    this.inventario.getAlmacenes().subscribe({ next: a => this.almacenes.set(a) });
  }

  cargarPendientes() {
    this.cargandoLotes.set(true);
    this.inventario.getLotesPendientes().subscribe({
      next:  l  => { this.lotesPendientes.set(l); this.cargandoLotes.set(false); },
      error: _e => { this.error.set('Error al cargar lotes pendientes.'); this.cargandoLotes.set(false); }
    });
  }

  seleccionarLote(lote: LoteDTO) {
    this.loteSeleccionado.set(lote);
    this.form.cantidadValidada = lote.cantidadInicial;
    this.form.idUbicacion = 0;
    // Limpiar selección de ubicación
    this.zonas.set([]); this.estanterias.set([]); this.ubicaciones.set([]);
  }

  // Cascada de ubicación ──────────────────────────────────────

  onAlmacenChange(evt: Event) {
    const id = Number((evt.target as HTMLSelectElement).value);
    if (!id) return;
    this.cargandoZonas.set(true);
    this.zonas.set([]); this.estanterias.set([]); this.ubicaciones.set([]);
    this.inventario.getZonas(id).subscribe({
      next:  z  => { this.zonas.set(z); this.cargandoZonas.set(false); },
      error: _e => this.cargandoZonas.set(false)
    });
  }

  onZonaChange(evt: Event) {
    const id = Number((evt.target as HTMLSelectElement).value);
    if (!id) return;
    this.cargandoEstanterias.set(true);
    this.estanterias.set([]); this.ubicaciones.set([]);
    this.inventario.getEstanterias(id).subscribe({
      next:  e  => { this.estanterias.set(e); this.cargandoEstanterias.set(false); },
      error: _e => this.cargandoEstanterias.set(false)
    });
  }

  onEstanteriaChange(evt: Event) {
    const id = Number((evt.target as HTMLSelectElement).value);
    if (!id) return;
    this.cargandoUbicaciones.set(true);
    this.ubicaciones.set([]);
    this.inventario.getUbicaciones(id).subscribe({
      next:  u  => { this.ubicaciones.set(u); this.cargandoUbicaciones.set(false); },
      error: _e => this.cargandoUbicaciones.set(false)
    });
  }

  onUbicacionChange(evt: Event) {
    this.form.idUbicacion = Number((evt.target as HTMLSelectElement).value);
  }

  // Validar ───────────────────────────────────────────────────

  confirmarRecepcion() {
    if (!this.loteSeleccionado() || !this.form.cantidadValidada || !this.form.idUbicacion) {
      this.error.set('Complete la cantidad y seleccione una ubicación.');
      return;
    }
    this.validando.set(true);
    this.error.set('');
    this.inventario.validarLote(this.loteSeleccionado()!.idLote, this.form).subscribe({
      next:  loteActivo => {
        this.exito.set(loteActivo);
        this.loteSeleccionado.set(null);
        this.validando.set(false);
        this.cargarPendientes();
      },
      error: _e => {
        this.error.set('Error al validar el lote. Intente nuevamente.');
        this.validando.set(false);
      }
    });
  }

  cerrarExito() { this.exito.set(null); }
}
