import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { OperacionesService } from '../../../core/services/operaciones.service';
import { AlertaCaducidadDTO, ReglaNegocioIADTO } from '../../../core/models/operaciones.model';
import { SectionHeaderComponent } from '../../../shared/components/section-header/section-header.component';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-alertas-caducidad',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, SectionHeaderComponent],
  styleUrl: './alertas-caducidad.component.css',
  template: `
    <div class="alertas-container">
      <!-- Cabecera -->
      <app-section-header title="Alertas Inteligentes de Caducidad e Inventario" 
                          subtitle="Monitoreo predictivo AgroSense de agroquímicos, fertilizantes y semillas próximas a vencer para evitar pérdidas en bodega.">
        @if (esAdmin) {
          <button (click)="openConfigModal()" class="btn btn--ghost">
            <lucide-icon name="sliders"></lucide-icon>
            <span>Configurar Umbrales IA</span>
          </button>
        }
      </app-section-header>

      <!-- Barra de Filtros -->
      <div class="filters-bar">
        <div class="filters-bar__group">
          <lucide-icon name="filter" class="filters-bar__icon"></lucide-icon>
          <span class="filters-bar__label">Prioridad:</span>
          <div class="segmented">
            <button (click)="filterPrioridad.set('TODAS')" [class.segmented__btn--active]="filterPrioridad() === 'TODAS'" class="segmented__btn">Todas</button>
            <button (click)="filterPrioridad.set('URGENTE')" [class.segmented__btn--active-urgente]="filterPrioridad() === 'URGENTE'" class="segmented__btn">Urgentes</button>
            <button (click)="filterPrioridad.set('ALTA')" [class.segmented__btn--active-alta]="filterPrioridad() === 'ALTA'" class="segmented__btn">Altas</button>
            <button (click)="filterPrioridad.set('MEDIA')" [class.segmented__btn--active-media]="filterPrioridad() === 'MEDIA'" class="segmented__btn">Medias</button>
          </div>
        </div>

        <div class="field-inline">
          <span class="filters-bar__label">Estado:</span>
          <select [(ngModel)]="filterEstado" class="field-inline__select">
            <option value="ACTIVA">Solo Activas</option>
            <option value="TODAS">Ver Todas</option>
            <option value="EN_PROMOCION">En Promoción IA</option>
            <option value="DESCARTADA">Descartadas</option>
          </select>
        </div>
      </div>

      <!-- Grid de Alertas -->
      <div class="alertas-grid">
        @for (a of filteredAlertas(); track a.idAlerta) {
          <div class="alert-card" [class]="getBorderClass(a)">
            
            @if (a.nivelPrioridad === 'URGENTE' && a.estado === 'ACTIVA') {
              <div class="alert-card__stamp">
                Crítico
              </div>
            }

            <div>
              <div class="alert-card__head">
                <span class="lote-code">{{ a.codigoLote }}</span>
                <span class="badge" [class]="getPriorityBadge(a)">
                  {{ a.nivelPrioridad }}
                </span>
              </div>

              <h3 class="alert-card__title">{{ a.nombreProducto }}</h3>
              
              <div class="spec-sheet">
                <div class="spec-row">
                  <span class="spec-row__label">Bodega / Almacén:</span>
                  <span class="spec-row__value">{{ a.bodega }}</span>
                </div>
                <div class="spec-row">
                  <span class="spec-row__label">Stock disponible:</span>
                  <span class="spec-row__value spec-row__value--stock">{{ a.stockActual }} {{ a.unidadMedida }}</span>
                </div>
                <div class="spec-row">
                  <span class="spec-row__label">Fecha vencimiento:</span>
                  <span class="spec-row__value spec-row__value--fecha">{{ a.fechaCaducidad }}</span>
                </div>
              </div>
            </div>

            <!-- Días restantes y Botones de Acción -->
            <div class="alert-card__foot">
              <div class="countdown" [class.countdown--critico]="a.diasRestantes <= 15" [class.countdown--alto]="a.diasRestantes > 15">
                <lucide-icon name="clock" class="countdown__icon"></lucide-icon>
                <span>
                  Vence en {{ a.diasRestantes }} días
                </span>
              </div>

              <div class="card-actions">
                @if (a.estado === 'ACTIVA' && puedeGestionarAlertas) {
                  <button (click)="solicitarPromo(a)"
                          class="btn btn--promo"
                          title="Generar combo o descuento IA automático para liquidar">
                    <lucide-icon name="zap"></lucide-icon>
                    <span>Promo IA</span>
                  </button>
                  <button (click)="descartar(a)"
                          class="btn--icon"
                          title="Descartar alerta">
                    <lucide-icon name="trash-2"></lucide-icon>
                  </button>
                } @else if (a.estado === 'ACTIVA') {
                  <span class="status-tag status-tag--activa">
                    <lucide-icon name="alert-triangle" class="w-3.5 h-3.5"></lucide-icon>
                    <span>Activa</span>
                  </span>
                } @else if (a.estado === 'EN_PROMOCION') {
                  <span class="status-tag status-tag--promo">
                    <lucide-icon name="tag"></lucide-icon>
                    <span>En Promo</span>
                  </span>
                } @else {
                  <span class="status-tag status-tag--descartada">
                    Descartada
                  </span>
                }
              </div>
            </div>

          </div>
        } @empty {
          <div class="empty-state">
            <div class="empty-state__icon">
              <lucide-icon name="check-circle"></lucide-icon>
            </div>
            <h3 class="empty-state__title">Excelente: No hay lotes en riesgo inminente</h3>
            <p class="empty-state__text">Todos los agroquímicos y fertilizantes se encuentran dentro de los parámetros de frescura óptimos.</p>
          </div>
        }
      </div>

      <!-- Paginación -->
      <div class="pagination" style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--c-sage-border);">
        <span style="font-size: 0.85rem; color: var(--c-mid-green);">Mostrando página {{ page() + 1 }} de {{ totalPages() || 1 }} ({{ totalElements() }} resultados)</span>
        <div style="display: flex; gap: 0.5rem;">
          <button class="btn btn--ghost" (click)="prevPage()" [disabled]="page() === 0">
            <lucide-icon name="chevron-left" class="w-4 h-4"></lucide-icon> Anterior
          </button>
          <button class="btn btn--ghost" (click)="nextPage()" [disabled]="page() >= totalPages() - 1">
            Siguiente <lucide-icon name="chevron-right" class="w-4 h-4"></lucide-icon>
          </button>
        </div>
      </div>

      <!-- MODAL CONFIGURACIÓN DE UMBRALES -->
      @if (isModalOpen()) {
        <div class="modal-overlay">
          <div class="modal">
            <div class="modal__header">
              <div class="modal__title-group">
                <lucide-icon name="sliders"></lucide-icon>
                <h3 class="modal__title">Umbrales y Modelo de Inteligencia Artificial</h3>
              </div>
              <button (click)="isModalOpen.set(false)" class="modal__close">
                <lucide-icon name="x"></lucide-icon>
              </button>
            </div>

            <div class="modal__body">
              <div>
                <label class="field__label">Días de Anticipación para Alerta</label>
                <div class="range-row">
                  <input type="range" [(ngModel)]="regla.diasAlertaAnticipada" min="15" max="120" step="5" class="range-row__input">
                  <span class="range-row__value">{{ regla.diasAlertaAnticipada }} días</span>
                </div>
                <p class="field__hint">AgroSense disparará alertas rojas automáticamente cuando un lote entre en este periodo de gracia antes de vencer.</p>
              </div>

              <div>
                <label class="field__label">Descuento Máximo en Promociones Automáticas</label>
                <div class="range-row">
                  <input type="range" [(ngModel)]="regla.descuentoMaximo" min="5" max="50" step="5" class="range-row__input range-row__input--accent">
                  <span class="range-row__value range-row__value--accent">{{ regla.descuentoMaximo }}% max</span>
                </div>
              </div>

              <div class="toggle-row">
                <div>
                  <span class="toggle-row__title">Autogenerar Sugerencias IA</span>
                  <span class="toggle-row__text">Crear borrador de combo al detectar urgencias</span>
                </div>
                <input type="checkbox" [(ngModel)]="regla.activarPromociones" class="toggle-row__input">
              </div>

              <div>
                <label class="field__label">Motor IA Activo en Servidor</label>
                <input type="text" [(ngModel)]="regla.modeloIaActivo" readonly class="input--readonly">
              </div>
            </div>

            <div class="modal__footer">
              <button (click)="isModalOpen.set(false)" class="btn btn--ghost">
                Cancelar
              </button>
              <button (click)="saveRegla()" class="btn btn--primary">
                <lucide-icon name="save"></lucide-icon>
                <span>Guardar Parámetros</span>
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class AlertasCaducidadComponent implements OnInit {
  private opService = inject(OperacionesService);
  private toast = inject(ToastService);
  private authService = inject(AuthService);

  alertas = signal<AlertaCaducidadDTO[]>([]);
  filterPrioridad = signal<string>('TODAS');
  filterEstado = 'ACTIVA';

  page = signal(0);
  size = signal(10);
  totalPages = signal(0);
  totalElements = signal(0);

  isModalOpen = signal<boolean>(false);
  regla: ReglaNegocioIADTO = { idRegla: 1, descuentoMaximo: 35, activarPromociones: true, diasAlertaAnticipada: 60, modeloIaActivo: 'AgroSense Predictor v2.4' };

  /** Los umbrales del motor IA son configuración de negocio — solo el Administrador puede leerlos/editarlos (backend: /api/ia/reglas → ADMINISTRADOR). */
  get esAdmin(): boolean {
    return this.authService.currentRole()?.toUpperCase() === 'ADMINISTRADOR';
  }

  /** Promover a promoción / descartar alerta son decisiones de negocio (backend: /api/alertas/** → solo ADMINISTRADOR/SUPERVISOR). El Bodeguero solo tiene lectura. */
  get puedeGestionarAlertas(): boolean {
    const rol = this.authService.currentRole()?.toUpperCase();
    return rol === 'ADMINISTRADOR' || rol === 'SUPERVISOR';
  }

  ngOnInit(): void {
    this.loadData();
    if (this.esAdmin) {
      this.opService.obtenerReglaNegocioIA().subscribe({
        next: r => this.regla = { ...r },
        error: () => this.toast.error('Error', 'No se pudieron cargar las reglas de negocio')
      });
    }
  }

  loadData(): void {
    this.opService.listarAlertas(this.page(), this.size()).subscribe({
      next: res => {
        this.alertas.set(res.content);
        this.totalPages.set(res.totalPages);
        this.totalElements.set(res.totalElements);
      },
      error: () => this.toast.error('Error de conexión', 'No se pudieron cargar las alertas.')
    });
  }

  nextPage(): void {
    if (this.page() < this.totalPages() - 1) {
      this.page.set(this.page() + 1);
      this.loadData();
    }
  }

  prevPage(): void {
    if (this.page() > 0) {
      this.page.set(this.page() - 1);
      this.loadData();
    }
  }

  filteredAlertas = computed(() => {
    return this.alertas().filter(a => {
      const matchPrio = this.filterPrioridad() === 'TODAS' || a.nivelPrioridad === this.filterPrioridad();
      const matchEst = this.filterEstado === 'TODAS' || a.estado === this.filterEstado;
      return matchPrio && matchEst;
    });
  });

  getBorderClass(a: AlertaCaducidadDTO): string {
    if (a.estado !== 'ACTIVA') return 'alert-card--inactiva';
    if (a.nivelPrioridad === 'URGENTE') return 'alert-card--urgente';
    if (a.nivelPrioridad === 'ALTA') return 'alert-card--alta';
    if (a.nivelPrioridad === 'MEDIA') return 'alert-card--media';
    return '';
  }

  getPriorityBadge(a: AlertaCaducidadDTO): string {
    if (a.nivelPrioridad === 'URGENTE') return 'badge--urgente';
    if (a.nivelPrioridad === 'ALTA') return 'badge--alta';
    if (a.nivelPrioridad === 'MEDIA') return 'badge--media';
    return 'badge--neutral';
  }

  solicitarPromo(a: AlertaCaducidadDTO): void {
    this.opService.solicitarPromocionAlerta(a.idAlerta).subscribe({
      next: (promo) => {
        this.toast.success('Sugerencia IA Generada', `Se creó el combo "${promo.titulo}" con ${promo.descuentoSugerido}% de descuento sugerido. Revisa la pestaña Combos & IA.`);
        this.loadData();
      },
      error: () => this.toast.error('Error', 'No se pudo generar la promoción para esta alerta.')
    });
  }

  descartar(a: AlertaCaducidadDTO): void {
    this.opService.descartarAlerta(a.idAlerta).subscribe({
      next: () => {
        this.toast.info('Alerta Descartada', `El lote ${a.codigoLote} fue removido del monitoreo activo.`);
        this.loadData();
      },
      error: () => this.toast.error('Error', 'No se pudo descartar la alerta.')
    });
  }

  openConfigModal(): void {
    this.isModalOpen.set(true);
  }

  saveRegla(): void {
    this.opService.actualizarReglaNegocioIA(this.regla).subscribe({
      next: () => {
        this.toast.success('Parámetros actualizados', 'Los umbrales de alerta e inteligencia artificial fueron aplicados.');
        this.isModalOpen.set(false);
      },
      error: () => this.toast.error('Error', 'No se pudieron actualizar los parámetros.')
    });
  }
}
