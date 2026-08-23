import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { LucideAngularModule } from 'lucide-angular';
import { OperacionesService } from '../../../core/services/operaciones.service';
import { PromocionIADTO } from '../../../core/models/operaciones.model';
import { SectionHeaderComponent } from '../../../shared/components/section-header/section-header.component';
import { ToastService } from '../../../shared/components/toast/toast.service';

@Component({
  selector: 'app-promociones-ia',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, SectionHeaderComponent],
  styleUrl: './promociones-ia.component.css',
  template: `
    <div class="promos-container">
      <!-- Cabecera -->
      <app-section-header title="Sugerencias IA y Combos Automáticos" 
                          subtitle="Descuentos sugeridos por el motor de reglas para liquidar lotes con prioridad alta o próxima caducidad.">
        <button (click)="openCreateModal()" class="btn btn--primary">
          <lucide-icon name="plus"></lucide-icon>
          <span>Crear Combo Manual</span>
        </button>
      </app-section-header>

      <!-- Barra de Filtros -->
      <div class="filters-bar">
        <div class="filters-bar__group">
          <lucide-icon name="filter" class="filters-bar__icon"></lucide-icon>
          <span class="filters-bar__label">Estado del Combo:</span>
          <div class="segmented">
            <button (click)="filterEstado.set('TODAS')" [class.segmented__btn--active]="filterEstado() === 'TODAS'" class="segmented__btn">Todas</button>
            <button (click)="filterEstado.set('SUGERIDA')" [class.segmented__btn--active-sugerida]="filterEstado() === 'SUGERIDA'" class="segmented__btn">
              <span>Sugeridas IA</span>
            </button>
            <button (click)="filterEstado.set('APROBADA')" [class.segmented__btn--active-aprobada]="filterEstado() === 'APROBADA'" class="segmented__btn">Aprobadas</button>
            <button (click)="filterEstado.set('ACTIVA')" [class.segmented__btn--active]="filterEstado() === 'ACTIVA'" class="segmented__btn">Activas</button>
          </div>
        </div>

        <div class="engine-status">
          <span class="engine-status__dot"></span>
          <span>Motor de sugerencias activo</span>
        </div>
      </div>

      <!-- Grid de Promociones y Combos -->
      <div class="promos-grid">
        @for (p of filteredPromociones(); track p.idPromocion) {
          <div class="promo-card" [class]="getCardClass(p)">
            
            <!-- Insignia de Estado -->
            <div class="promo-card__head">
              <span class="lote-code">{{ p.codigoLote }}</span>
              @if (p.estado === 'SUGERIDA') {
                <span class="badge badge--sugerida">
                  <span>Sugerencia IA</span>
                </span>
              } @else if (p.estado === 'APROBADA') {
                <span class="badge badge--aprobada">
                  Aprobado (Listo para POS)
                </span>
              } @else if (p.estado === 'ACTIVA') {
                <span class="badge badge--activa">
                  ● Vigente en Portal
                </span>
              } @else {
                <span class="badge badge--rechazada">
                  Rechazado
                </span>
              }
            </div>

            <div>
              <h3 class="promo-card__title">{{ p.titulo }}</h3>
              <p class="promo-card__product">{{ p.nombreProducto }}</p>

              <!-- Precio y Descuento -->
              <div class="price-box">
                <div class="price-box__col">
                  <span class="price-box__label">Precio Original</span>
                  <span class="price-box__original">\${{ p.precioOriginal | number:'1.2-2' }}</span>
                </div>
                <div class="price-box__col">
                  <span class="price-box__label">Precio Promocional</span>
                  <span class="price-box__final">\${{ p.precioPromocion | number:'1.2-2' }}</span>
                </div>
                <span class="price-box__off">
                  -{{ p.descuentoSugerido }}% OFF
                </span>
              </div>

              <!-- Justificación Algorítmica IA -->
              <div class="rationale">
                <div class="rationale__title">
                  <lucide-icon name="activity" class="rationale__icon"></lucide-icon>
                  <span>Cálculo del motor</span>
                </div>
                <p class="rationale__text">{{ p.justificacionIA }}</p>
              </div>
            </div>

            <!-- Botones de Decisión -->
            <div class="promo-card__foot">
              @if (p.estado === 'SUGERIDA') {
                <button (click)="cambiarEstado(p, 'RECHAZADA')" class="btn btn--discard">
                  <lucide-icon name="x" class="w-3.5 h-3.5"></lucide-icon>
                  <span>Descartar</span>
                </button>
                <button (click)="cambiarEstado(p, 'APROBADA')" class="btn btn--approve">
                  <lucide-icon name="check" class="w-3.5 h-3.5"></lucide-icon>
                  <span>Aprobar Descuento</span>
                </button>
              } @else if (p.estado === 'APROBADA') {
                <button (click)="cambiarEstado(p, 'ACTIVA')" class="btn btn--publish">
                  <lucide-icon name="play" class="w-3.5 h-3.5"></lucide-icon>
                  <span>Publicar e Iniciar Vigencia</span>
                </button>
              } @else if (p.estado === 'ACTIVA') {
                <span class="status-line">
                  <lucide-icon name="check-circle"></lucide-icon>
                  <span>Disponible para Venta</span>
                </span>
              }
            </div>

          </div>
        } @empty {
          <div class="empty-state">
            <div class="empty-state__icon">
              <lucide-icon name="gift"></lucide-icon>
            </div>
            <h3 class="empty-state__title">No hay promociones ni sugerencias pendientes</h3>
            <p class="empty-state__text">El motor AgroSense generará automáticamente nuevas sugerencias cuando un lote agrícola cumpla las reglas de anticipación.</p>
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
        }
      </div>

      <!-- MODAL CREAR COMBO MANUAL -->
      @if (isModalOpen()) {
        <div class="modal-overlay">
          <div class="modal">
            <div class="modal__header">
              <div class="modal__title-group">
                <lucide-icon name="gift"></lucide-icon>
                <h3 class="modal__title">Crear Combo / Promoción Manual</h3>
              </div>
              <button (click)="isModalOpen.set(false)" class="modal__close">
                <lucide-icon name="x"></lucide-icon>
              </button>
            </div>

            <div class="modal__body">
              <div>
                <label class="field__label">Título de la Promoción</label>
                <input type="text" [(ngModel)]="form.titulo" placeholder="Ej: Combo Semilla Maíz + Fertilizante"
                       class="field__input">
              </div>

              <div>
                <label class="field__label">Producto / Lote Agrícola</label>
                <div style="display: flex; gap: 0.5rem; margin-bottom: 0.5rem;">
                  <input type="text" [(ngModel)]="searchLoteText" (ngModelChange)="onSearchLote()" placeholder="Buscar por número o producto..." class="field__input">
                </div>
                <div class="lotes-list" style="max-height: 150px; overflow-y: auto; border: 1px solid var(--c-sage-border); border-radius: var(--radius-input); margin-bottom: 1rem;">
                  @for (l of lotes(); track l.idLote) {
                    <div (click)="seleccionarLote(l)" [style.background]="form.idLote === l.idLote ? 'var(--c-sage-border)' : 'transparent'" style="padding: 0.5rem; cursor: pointer; border-bottom: 1px solid var(--c-sage-border); font-size: 0.85rem;">
                      <strong>{{ l.numeroLote }}</strong> - {{ l.nombreProducto }}
                      <div style="color: var(--c-dark-green)">Vence: {{ l.fechaVencimiento }} ({{ l.cantidadActual }} {{ l.unidadMedida }})</div>
                    </div>
                  } @empty {
                    <div style="padding: 0.5rem; text-align: center; color: var(--c-mid-green); font-size: 0.85rem;">No se encontraron lotes.</div>
                  }
                </div>
              </div>

              <div class="field-grid">
                <div>
                  <label class="field__label">Precio Normal ($)</label>
                  <input type="number" [(ngModel)]="form.precioOriginal" (ngModelChange)="calcPromo()" step="0.5" readonly
                         class="field__input field__input--num" style="background-color: var(--c-bone-bg); cursor: not-allowed;">
                </div>
                <div>
                  <label class="field__label">Descuento (%)</label>
                  <input type="number" [(ngModel)]="form.descuentoSugerido" (ngModelChange)="calcPromo()" min="5" max="50"
                         class="field__input field__input--num">
                </div>
              </div>

              <div class="calc-row">
                <span class="calc-row__label">Precio Final Calculado:</span>
                <span class="calc-row__value">\${{ form.precioPromocion | number:'1.2-2' }}</span>
              </div>

              <div>
                <label class="field__label">Justificación o Motivo</label>
                <textarea [(ngModel)]="form.justificacionIA" rows="2" placeholder="Motivo de la promoción para autorización gerencial..."
                          class="field__textarea"></textarea>
              </div>
            </div>

            <div class="modal__footer">
              <button (click)="isModalOpen.set(false)" class="btn btn--ghost">
                Cancelar
              </button>
              <button (click)="saveManual()" class="btn btn--primary">
                <lucide-icon name="save"></lucide-icon>
                <span>Crear Promoción</span>
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class PromocionesIAComponent implements OnInit {
  private opService = inject(OperacionesService);
  private toast = inject(ToastService);

  promociones = signal<PromocionIADTO[]>([]);
  filterEstado = signal<string>('TODAS');

  isModalOpen = signal<boolean>(false);
  form = { titulo: '', idLote: null as number | null, nombreProducto: '', codigoLote: '', precioOriginal: 0, descuentoSugerido: 15, precioPromocion: 0, fechaFin: '', justificacionIA: 'Promoción creada manualmente por la gerencia para impulso de ventas.' };

  lotes = signal<any[]>([]);
  searchLoteText = '';
  searchSubject = new Subject<string>();

  page = signal(0);
  size = signal(10);
  totalPages = signal(0);
  totalElements = signal(0);

  ngOnInit(): void {
    this.loadData();
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(q => {
      this.opService.listarLotesProximosVencer(0, 10, q).subscribe({
        next: (res) => this.lotes.set(res.content),
        error: () => this.toast.error('Error', 'No se pudieron cargar los lotes')
      });
    });
  }

  loadData(): void {
    this.opService.listarPromociones(this.page(), this.size()).subscribe({
      next: res => {
        this.promociones.set(res.content);
        this.totalPages.set(res.totalPages);
        this.totalElements.set(res.totalElements);
      },
      error: () => this.toast.error('Error', 'No se pudieron cargar las promociones.')
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

  filteredPromociones = computed(() => {
    return this.promociones().filter(p => {
      return this.filterEstado() === 'TODAS' || p.estado === this.filterEstado();
    });
  });

  calcPromo(): void {
    const orig = Number(this.form.precioOriginal) || 0;
    const desc = Number(this.form.descuentoSugerido) || 0;
    this.form.precioPromocion = Number((orig * (1 - desc / 100)).toFixed(2));
  }

  cambiarEstado(p: PromocionIADTO, nuevoEstado: 'APROBADA' | 'RECHAZADA' | 'ACTIVA'): void {
    this.opService.cambiarEstadoPromocion(p.idPromocion, nuevoEstado).subscribe({
      next: () => {
        const txt = nuevoEstado === 'APROBADA' ? 'aprobada' : nuevoEstado === 'ACTIVA' ? 'activada en POS' : 'rechazada';
        this.toast.success('Estado modificado', `La promoción "${p.titulo}" fue ${txt}.`);
        this.loadData();
      },
      error: () => this.toast.error('Error', 'No se pudo cambiar el estado de la promoción.')
    });
  }

  onSearchLote(): void {
    this.searchSubject.next(this.searchLoteText);
  }

  seleccionarLote(lote: any): void {
    this.form.idLote = lote.idLote;
    this.form.nombreProducto = lote.nombreProducto;
    this.form.codigoLote = lote.numeroLote;
    this.form.precioOriginal = lote.precioOriginal;
    this.calcPromo();
  }

  openCreateModal(): void {
    const hoy = new Date();
    const fin = new Date(hoy);
    fin.setDate(hoy.getDate() + 30);

    this.form = { titulo: '', idLote: null, nombreProducto: '', codigoLote: '', precioOriginal: 0, descuentoSugerido: 15, precioPromocion: 0, fechaFin: fin.toISOString().substring(0, 10), justificacionIA: 'Promoción creada manualmente por la gerencia para impulso de ventas.' };
    this.searchLoteText = '';
    this.lotes.set([]);
    this.isModalOpen.set(true);
    this.searchSubject.next('');
  }

  saveManual(): void {
    if (!this.form.titulo.trim()) {
      this.toast.warning('Validación', 'Ingresa un título para el combo.');
      return;
    }
    if (!this.form.idLote) {
      this.toast.warning('Validación', 'Selecciona el lote al que aplica el combo.');
      return;
    }
    const hoy = new Date().toISOString().substring(0, 10);
    this.opService.crearPromocionManual({
      nombre: this.form.titulo.trim(),
      descripcion: this.form.justificacionIA,
      fechaInicio: hoy,
      fechaFin: this.form.fechaFin,
      porcentajeDescuento: Number(this.form.descuentoSugerido),
      idEstado: 2,                       // APROBADA — creado manualmente por el Administrador
      idLote: this.form.idLote
    }).subscribe({
      next: () => {
        this.toast.success('Combo creado', `El combo "${this.form.titulo}" fue registrado.`);
        this.isModalOpen.set(false);
        this.loadData();
      },
      error: () => this.toast.error('Error', 'No se pudo crear el combo. Revisa los datos e intenta de nuevo.')
    });
  }

  getCardClass(p: PromocionIADTO): string {
    if (p.estado === 'SUGERIDA') return 'promo-card--sugerida';
    if (p.estado === 'APROBADA') return 'promo-card--aprobada';
    if (p.estado === 'ACTIVA') return 'promo-card--activa';
    return 'promo-card--rechazada';
  }
}
