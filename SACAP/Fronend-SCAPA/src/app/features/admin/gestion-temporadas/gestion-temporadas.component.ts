import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { TemporadaService, Temporada } from '../../../core/services/temporada.service';
import { ToastService } from '../../../shared/components/toast/toast.service';

@Component({
  selector: 'app-gestion-temporadas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  styleUrl: './gestion-temporadas.component.css',
  template: `
    <div class="temporadas-container">

      <!-- Panel Izquierdo: Formulario -->
      <div class="panel-form">
        <div class="panel-header">
          <h2 class="panel-title">Aperturar Temporada</h2>
          <p class="panel-desc">Al iniciar una nueva temporada, la anterior se cerrará automáticamente.</p>
        </div>

        <form [formGroup]="temporadaForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label class="form-label">Nombre de la Temporada</label>
            <input type="text" formControlName="nombre" class="form-input" placeholder="ej. Ciclo Costa 2026-A">
            @if (temporadaForm.get('nombre')?.invalid && temporadaForm.get('nombre')?.touched) {
              <span class="form-error">El nombre es requerido</span>
            }
          </div>

          <div class="form-group">
            <label class="form-label">ID Cultivo (Opcional)</label>
            <input type="number" formControlName="idCultivo" class="form-input" placeholder="Ej. 1 (Dejar vacío para general)">
          </div>

          <div class="form-group">
            <label class="form-label">Fecha de Inicio</label>
            <input type="date" formControlName="fechaInicio" class="form-input">
            @if (temporadaForm.get('fechaInicio')?.invalid && temporadaForm.get('fechaInicio')?.touched) {
              <span class="form-error">La fecha de inicio es requerida</span>
            }
          </div>

          <div class="form-group">
            <label class="form-label">Fecha de Fin Proyectada</label>
            <input type="date" formControlName="fechaFinProyectada" class="form-input">
            @if (temporadaForm.get('fechaFinProyectada')?.invalid && temporadaForm.get('fechaFinProyectada')?.touched) {
              <span class="form-error">La fecha de fin proyectada es requerida</span>
            }
          </div>

          <button type="submit" [disabled]="temporadaForm.invalid || isSubmitting()" class="btn-submit">
            @if (isSubmitting()) {
              <lucide-icon name="loader" class="w-4 h-4 animate-spin"></lucide-icon>
              <span>Procesando...</span>
            } @else {
              <lucide-icon name="play-circle" class="w-4 h-4"></lucide-icon>
              <span>Aperturar Temporada</span>
            }
          </button>
        </form>

        <div class="alert-warning">
          <p><strong>Aviso de Cierre:</strong> La temporada actualmente ACTIVA se marcará como CERRADA.</p>
        </div>
      </div>

      <!-- Panel Derecho: Tabla / Historial -->
      <div class="panel-table">
        <div class="table-header">
          <h3 class="table-title">Historial de Temporadas</h3>
          <button (click)="cargarTemporadas()" class="btn-icon" title="Actualizar" style="width: auto; padding: 0.25rem 0.5rem; border: none; background: transparent; color: var(--c-sage-border); cursor: pointer;">
            <lucide-icon name="refresh-cw" class="w-4 h-4"></lucide-icon>
          </button>
        </div>

        <div class="table-wrapper custom-scrollbar">
          @if (isLoading()) {
            <div class="empty-state">
              <lucide-icon name="loader" class="w-6 h-6 animate-spin mx-auto mb-2"></lucide-icon>
              <p>Cargando historial...</p>
            </div>
          } @else if (temporadas().length === 0) {
            <div class="empty-state">
              <lucide-icon name="calendar" class="w-6 h-6 mx-auto mb-2"></lucide-icon>
              <p>No hay temporadas registradas.</p>
            </div>
          } @else {
            <table class="data-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Cultivo</th>
                  <th>Inicio</th>
                  <th>Fin Proyectada</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                @for (temp of temporadas(); track temp.idTemporada) {
                  <tr>
                    <td class="text-stamped" style="font-size: 0.8125rem; font-family: var(--font-slab); font-weight: 600; color: var(--c-warm-black); letter-spacing: 0.05em; text-transform: uppercase;">{{ temp.nombre }}</td>
                    <td>{{ temp.nombreCultivo || 'General' }}</td>
                    <td>{{ temp.fechaInicio | date:'mediumDate' }}</td>
                    <td>{{ temp.fechaFinProyectada ? (temp.fechaFinProyectada | date:'mediumDate') : '—' }}</td>
                    <td>
                      <span class="badge" [ngClass]="temp.estado === 'ACTIVA' ? 'badge-active' : 'badge-inactive'">
                        {{ temp.estado }}
                      </span>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          }
        </div>
      </div>

    </div>
  `
})
export class GestionTemporadasComponent implements OnInit {
  private fb = inject(FormBuilder);
  private temporadaService = inject(TemporadaService);
  private toast = inject(ToastService);

  temporadaForm: FormGroup;
  temporadas = signal<Temporada[]>([]);
  isLoading = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);

  constructor() {
    this.temporadaForm = this.fb.group({
      nombre: ['', Validators.required],
      idCultivo: [null],
      fechaInicio: [new Date().toISOString().split('T')[0], Validators.required],
      fechaFinProyectada: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.cargarTemporadas();
  }

  cargarTemporadas(): void {
    this.isLoading.set(true);
    this.temporadaService.listarTemporadas().subscribe({
      next: (data) => {
        // Ordenar para que la activa o las más recientes salgan primero
        data.sort((a, b) => {
          if (a.estado === 'ACTIVA' && b.estado !== 'ACTIVA') return -1;
          if (a.estado !== 'ACTIVA' && b.estado === 'ACTIVA') return 1;
          return new Date(b.fechaInicio).getTime() - new Date(a.fechaInicio).getTime();
        });
        this.temporadas.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.toast.error('Error', 'No se pudieron cargar las temporadas.');
        this.isLoading.set(false);
      }
    });
  }

  onSubmit(): void {
    if (this.temporadaForm.invalid) return;

    this.isSubmitting.set(true);
    const formCultivo = this.temporadaForm.value.idCultivo;
    const activa = this.temporadas().find(t => t.estado === 'ACTIVA' && t.idCultivo === formCultivo);

    const crear = () => {
      this.temporadaService.crearTemporada({ ...this.temporadaForm.value, estado: 'ACTIVA' }).subscribe({
        next: (nuevaTemp) => {
          this.toast.success('Éxito', `Temporada "${nuevaTemp.nombre}" aperturada correctamente.`);
          this.temporadaForm.reset({ idCultivo: null, fechaInicio: new Date().toISOString().split('T')[0], fechaFinProyectada: '' });
          this.cargarTemporadas();
          this.isSubmitting.set(false);
        },
        error: (err) => {
          this.toast.error('Error', err.error?.message || 'No se pudo aperturar la temporada.');
          this.isSubmitting.set(false);
        }
      });
    };

    if (activa && activa.idTemporada) {
      this.temporadaService.cambiarEstado(activa.idTemporada, 'CERRADA').subscribe({
        next: crear,
        error: (err) => {
          this.toast.error('Error', err.error?.message || 'No se pudo cerrar la temporada activa anterior.');
          this.isSubmitting.set(false);
        }
      });
    } else {
      crear();
    }
  }
}
