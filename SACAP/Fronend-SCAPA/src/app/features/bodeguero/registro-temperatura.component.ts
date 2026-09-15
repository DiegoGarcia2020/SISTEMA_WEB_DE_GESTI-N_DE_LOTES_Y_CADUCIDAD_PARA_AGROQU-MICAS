import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { InventarioService, AlmacenDTO, ZonaDTO, RegistroTemperaturaDTO } from '../../core/services/inventario.service';
import { ToastService } from '../../shared/components/toast/toast.service';

/**
 * Bitácora de temperatura/humedad por zona (AGROCALIDAD Res. 0227, Anexo 1 punto 20):
 * "conservar la integridad e inocuidad de los plaguicidas" exige registrar lecturas
 * periódicas del área de almacenamiento, no solo declarar una "condición climática" fija.
 */
@Component({
  selector: 'app-registro-temperatura',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  styleUrls: ['./bodega-dashboard.component.css'],
  template: `
    <div class="dashboard-container">
      <div class="page-header">
        <span class="page-header__badge">Bodega Central</span>
        <h1 class="page-header__title">Control de Temperatura y Humedad</h1>
        <p class="page-header__subtitle">Registre lecturas periódicas por zona para conservar la integridad e inocuidad de los plaguicidas almacenados.</p>
      </div>

      <div class="table-card" style="margin-top: 1rem; padding: 1.25rem;">
        <h3 style="font-size: 1rem; font-weight: 600; color: var(--c-warm-black); margin: 0 0 1rem;">Nueva Lectura</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 0.875rem; align-items: end;">
          <div>
            <label style="display:block; font-size:0.75rem; font-weight:700; margin-bottom:0.25rem;">Almacén</label>
            <select class="form-control" [(ngModel)]="idAlmacenSeleccionado" (ngModelChange)="onAlmacenChange($event)" style="width:100%; padding:0.5rem; border:1px solid #d1d5db; border-radius:0.5rem;">
              <option [ngValue]="null" disabled>Seleccione...</option>
              @for (a of almacenes(); track a.idAlmacen) { <option [ngValue]="a.idAlmacen">{{ a.nombre }}</option> }
            </select>
          </div>
          <div>
            <label style="display:block; font-size:0.75rem; font-weight:700; margin-bottom:0.25rem;">Zona</label>
            <select class="form-control" [(ngModel)]="idZonaSeleccionada" style="width:100%; padding:0.5rem; border:1px solid #d1d5db; border-radius:0.5rem;">
              <option [ngValue]="null" disabled>Seleccione...</option>
              @for (z of zonas(); track z.idZona) { <option [ngValue]="z.idZona">{{ z.nombre }}</option> }
            </select>
          </div>
          <div>
            <label style="display:block; font-size:0.75rem; font-weight:700; margin-bottom:0.25rem;">Temperatura (°C) *</label>
            <input type="number" step="0.1" [(ngModel)]="temperatura" class="form-control" style="width:100%; padding:0.5rem; border:1px solid #d1d5db; border-radius:0.5rem;" />
          </div>
          <div>
            <label style="display:block; font-size:0.75rem; font-weight:700; margin-bottom:0.25rem;">Humedad relativa (%)</label>
            <input type="number" step="0.1" [(ngModel)]="humedadRelativa" class="form-control" style="width:100%; padding:0.5rem; border:1px solid #d1d5db; border-radius:0.5rem;" />
          </div>
          <div style="grid-column: 1 / -1;">
            <label style="display:block; font-size:0.75rem; font-weight:700; margin-bottom:0.25rem;">Observaciones</label>
            <input type="text" [(ngModel)]="observaciones" class="form-control" style="width:100%; padding:0.5rem; border:1px solid #d1d5db; border-radius:0.5rem;" />
          </div>
        </div>
        <button class="btn btn--primary" style="margin-top:1rem;" [disabled]="guardando()" (click)="registrar()">
          <lucide-icon name="thermometer" class="w-4 h-4"></lucide-icon>
          {{ guardando() ? 'Guardando...' : 'Registrar Lectura' }}
        </button>
      </div>

      <div class="table-card" style="margin-top: 1rem;">
        <div class="table-card__header">
          <h3 style="font-size: 1rem; font-weight: 600; color: var(--c-warm-black);">Historial de Lecturas</h3>
          <button (click)="cargarHistorial()" class="btn btn--ghost" title="Actualizar">
            <lucide-icon name="refresh-cw" class="w-4 h-4"></lucide-icon>
          </button>
        </div>
        <div class="table-scroll">
          <table class="data-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Zona</th>
                <th>Temperatura</th>
                <th>Humedad</th>
                <th>Registrado por</th>
                <th>Observaciones</th>
              </tr>
            </thead>
            <tbody>
              @for (r of historial(); track r.idRegistro) {
                <tr>
                  <td>{{ r.fechaHora | date:'short' }}</td>
                  <td>{{ r.nombreZona }}</td>
                  <td>
                    <span [style.color]="r.fueraDeRango ? '#dc2626' : 'inherit'" [style.fontWeight]="r.fueraDeRango ? '700' : '400'">
                      {{ r.temperatura }}°C @if (r.fueraDeRango) { ⚠ }
                    </span>
                  </td>
                  <td>{{ r.humedadRelativa != null ? r.humedadRelativa + '%' : '—' }}</td>
                  <td>{{ r.nombreUsuarioRegistro }}</td>
                  <td>{{ r.observaciones || '—' }}</td>
                </tr>
              } @empty {
                <tr><td colspan="6"><div class="empty-state"><p class="empty-state__title">Seleccione un almacén para ver el historial.</p></div></td></tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class RegistroTemperaturaComponent implements OnInit {
  private inventarioService = inject(InventarioService);
  private toast = inject(ToastService);

  almacenes = signal<AlmacenDTO[]>([]);
  zonas = signal<ZonaDTO[]>([]);
  historial = signal<RegistroTemperaturaDTO[]>([]);
  guardando = signal(false);

  idAlmacenSeleccionado: number | null = null;
  idZonaSeleccionada: number | null = null;
  temperatura: number | null = null;
  humedadRelativa: number | null = null;
  observaciones = '';

  ngOnInit(): void {
    this.inventarioService.getAlmacenes().subscribe(a => this.almacenes.set(a || []));
  }

  onAlmacenChange(idAlmacen: number): void {
    this.idZonaSeleccionada = null;
    this.zonas.set([]);
    this.historial.set([]);
    if (!idAlmacen) return;
    this.inventarioService.getZonas(idAlmacen).subscribe(z => this.zonas.set(z || []));
    this.cargarHistorial();
  }

  cargarHistorial(): void {
    if (!this.idAlmacenSeleccionado) return;
    this.inventarioService.historialTemperaturaPorAlmacen(this.idAlmacenSeleccionado).subscribe({
      next: pagina => this.historial.set(pagina.content || []),
      error: () => this.historial.set([])
    });
  }

  registrar(): void {
    if (!this.idZonaSeleccionada || this.temperatura === null || this.temperatura === undefined) {
      this.toast.warning('Datos incompletos', 'Seleccione una zona e ingrese la temperatura.');
      return;
    }
    this.guardando.set(true);
    this.inventarioService.registrarTemperatura({
      idZona: this.idZonaSeleccionada,
      temperatura: this.temperatura,
      humedadRelativa: this.humedadRelativa ?? undefined,
      observaciones: this.observaciones || undefined
    }).subscribe({
      next: registro => {
        this.guardando.set(false);
        this.temperatura = null;
        this.humedadRelativa = null;
        this.observaciones = '';
        if (registro.fueraDeRango) {
          this.toast.warning('Fuera de rango', `La lectura de ${registro.nombreZona} está fuera del rango aceptable configurado para la zona.`);
        } else {
          this.toast.success('Registrado', 'Lectura de temperatura guardada.');
        }
        this.cargarHistorial();
      },
      error: e => {
        this.guardando.set(false);
        this.toast.error('Error', e?.error?.message || 'No se pudo registrar la lectura.');
      }
    });
  }
}
