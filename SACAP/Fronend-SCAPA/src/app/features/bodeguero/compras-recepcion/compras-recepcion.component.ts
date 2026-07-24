import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { OperacionesService } from '../../../core/services/operaciones.service';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { OrdenCompra } from '../../../core/models/compras.model';

@Component({
  selector: 'app-compras-recepcion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  styleUrl: './compras-recepcion.component.css',
  template: `
    <div class="recepcion-container">
      
      @if (cargando()) {
        <div class="loading-state">
          <lucide-icon name="loader" class="w-10 h-10 spinner"></lucide-icon>
          <p>Cargando información de la orden...</p>
        </div>
      } @else if (error()) {
        <div class="error-state">
          <lucide-icon name="alert-triangle" class="w-12 h-12" style="color: var(--red-600)"></lucide-icon>
          <p>{{ error() }}</p>
          <button class="btn btn--back" (click)="volver()">Volver al Listado</button>
        </div>
      } @else if (orden()) {
        <div class="grid-layout">
          
          <!-- Columna Izquierda: Resumen -->
          <aside class="summary-panel">
            <div class="summary-header">
              <lucide-icon name="file-text" class="summary-header__icon w-8 h-8"></lucide-icon>
              <h2 class="summary-header__title">Orden de Compra</h2>
              <p class="summary-header__subtitle">OC-{{ orden()!.id | number:'3.0-0' }}</p>
            </div>
            <div class="summary-body">
              <div>
                <p class="info-block__label">Proveedor</p>
                <p class="info-block__value">{{ orden()!.nombreProveedor }}</p>
              </div>
              <div>
                <p class="info-block__label">N° Factura</p>
                <p class="info-block__value info-block__value--mono">{{ orden()!.numeroFactura }}</p>
              </div>
              <div>
                <p class="info-block__label">Fecha Emisión</p>
                <p class="info-block__value">{{ orden()!.fechaEmision }}</p>
              </div>
              <div>
                <p class="info-block__label">Total Unidades</p>
                <p class="info-block__value" style="font-size: 1.125rem; font-weight: 800; color: var(--green-700)">
                  {{ totalUnidades() }}
                </p>
              </div>
            </div>
          </aside>

          <!-- Columna Derecha: Formulario -->
          <main class="main-panel">
            <div class="main-header">
              <div class="main-header__icon">
                <lucide-icon name="package" class="w-6 h-6"></lucide-icon>
              </div>
              <div>
                <h1 class="main-header__title">Recepción de Productos</h1>
                <p class="main-header__desc">Verifique la mercancía física e ingrese los datos de lote impresos en la caja.</p>
              </div>
            </div>

            <div class="instruction-banner">
              <lucide-icon name="info" class="w-5 h-5 flex-shrink-0"></lucide-icon>
              <p class="instruction-banner__text">
                <strong>Importante:</strong> Los productos de regalo (bonificaciones) también deben registrarse físicamente como lotes para asegurar el cálculo correcto del costo promedio y control de caducidad.
              </p>
            </div>

            <form [formGroup]="recepcionForm" (ngSubmit)="confirmarRecepcion()">
              <div formArrayName="lotes" style="display: flex; flex-direction: column; gap: 1rem;">
                
                @for (item of lotesFormArray.controls; track item; let i = $index) {
                  <div class="lote-card" [formGroupName]="i" [class.lote-card--bonificacion]="esBonificacion(i)">
                    
                    <div class="lote-card__header">
                      <div class="product-info">
                        <div class="product-info__quantity">{{ getCantidad(i) }}x</div>
                        <div>
                          <p class="product-info__name">{{ getNombreProducto(i) }}</p>
                          <span class="product-info__unit">{{ getUnidadMedida(i) }}</span>
                        </div>
                      </div>
                      @if (esBonificacion(i)) {
                        <span class="badge-regalo">
                          <lucide-icon name="gift" class="w-3.5 h-3.5 inline-block mr-1"></lucide-icon> Bonificación
                        </span>
                      }
                    </div>

                    <div class="lote-card__body">
                      <div class="lote-grid">
                        <div class="form-group">
                          <label class="form-group__label">N° de Lote *</label>
                          <input type="text" class="form-group__input" formControlName="numeroLote" 
                                 placeholder="Impreso en caja"
                                 [class.form-group__input--error]="campoInvalido(i, 'numeroLote')">
                        </div>
                        <div class="form-group">
                          <label class="form-group__label">Fecha Fabricación</label>
                          <input type="date" class="form-group__input" formControlName="fechaFabricacion">
                        </div>
                        <div class="form-group">
                          <label class="form-group__label">Fecha Caducidad *</label>
                          <input type="date" class="form-group__input" formControlName="fechaVencimiento"
                                 [class.form-group__input--error]="campoInvalido(i, 'fechaVencimiento')"
                                 (change)="validarCaducidad(i)">
                        </div>
                      </div>

                      <!-- Warning no bloqueante de caducidad corta -->
                      @if (advertenciasCaducidad[i]) {
                        <div class="caducidad-warning">
                          <lucide-icon name="alert-triangle" class="caducidad-warning__icon w-5 h-5"></lucide-icon>
                          <span><strong>Atención:</strong> Este lote caduca en menos de 30 días. Verifique si es correcto antes de confirmar.</span>
                        </div>
                      }
                    </div>

                  </div>
                }

              </div>

              <!-- Action Bar pegajosa -->
              <div class="action-bar">
                <button type="button" class="btn btn--back" (click)="volver()">Cancelar</button>
                <button type="submit" class="btn btn--primary" [disabled]="recepcionForm.invalid || procesando()">
                  @if (procesando()) {
                    <lucide-icon name="loader" class="w-4 h-4 spinner"></lucide-icon> Procesando...
                  } @else {
                    <lucide-icon name="check" class="w-4 h-4"></lucide-icon> Confirmar Ingreso a FLOTANTE
                  }
                </button>
              </div>
            </form>
          </main>
        </div>
      }
    </div>
  `
})
export class ComprasRecepcionComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private operacionesService = inject(OperacionesService);
  private toast = inject(ToastService);

  cargando = signal(true);
  procesando = signal(false);
  error = signal<string | null>(null);
  orden = signal<OrdenCompra | null>(null);
  totalUnidades = signal(0);

  recepcionForm!: FormGroup;
  advertenciasCaducidad: { [key: number]: boolean } = {};

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('idOrden');
    if (!idParam) {
      this.error.set('No se especificó la orden de compra.');
      this.cargando.set(false);
      return;
    }

    const idOrden = parseInt(idParam, 10);
    this.cargarOrden(idOrden);
  }

  private cargarOrden(id: number): void {
    this.operacionesService.obtenerOrdenCompra(id).subscribe({
      next: (data) => {
        if (data.estado !== 'PENDIENTE') {
          this.error.set(`Esta orden ya no se encuentra en estado PENDIENTE. Estado actual: ${data.estado}`);
          this.cargando.set(false);
          return;
        }

        this.orden.set(data);
        this.construirFormulario(data);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar la información de la orden de compra.');
        this.cargando.set(false);
      }
    });
  }

  private construirFormulario(orden: OrdenCompra): void {
    const lotesGroups = orden.detalles.map(detalle => {
      return this.fb.group({
        idDetalleCompra: [detalle.id],
        numeroLote: ['', Validators.required],
        fechaFabricacion: [null],
        fechaVencimiento: [null, Validators.required],
        // Metadatos ocultos para la vista
        _nombreProducto: [detalle.nombreProducto],
        _unidadMedida: [detalle.unidadMedida],
        _cantidad: [detalle.cantidad],
        _esBonificacion: [detalle.esBonificacion]
      });
    });

    this.recepcionForm = this.fb.group({
      lotes: this.fb.array(lotesGroups)
    });

    const total = orden.detalles.reduce((acc, curr) => acc + curr.cantidad, 0);
    this.totalUnidades.set(total);
  }

  get lotesFormArray(): FormArray {
    return this.recepcionForm.get('lotes') as FormArray;
  }

  // Helpers para la vista
  getNombreProducto(index: number): string { return this.lotesFormArray.at(index).get('_nombreProducto')?.value; }
  getUnidadMedida(index: number): string { return this.lotesFormArray.at(index).get('_unidadMedida')?.value; }
  getCantidad(index: number): number { return this.lotesFormArray.at(index).get('_cantidad')?.value; }
  esBonificacion(index: number): boolean { return this.lotesFormArray.at(index).get('_esBonificacion')?.value; }

  campoInvalido(index: number, campo: string): boolean {
    const control = this.lotesFormArray.at(index).get(campo);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  /**
   * REQUISITO DEL USUARIO: Warning no bloqueante si caduca en < 30 días.
   */
  validarCaducidad(index: number): void {
    const fechaControl = this.lotesFormArray.at(index).get('fechaVencimiento');
    if (!fechaControl?.value) {
      this.advertenciasCaducidad[index] = false;
      return;
    }

    const fechaVencimiento = new Date(fechaControl.value);
    const hoy = new Date();
    const diffTime = fechaVencimiento.getTime() - hoy.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    this.advertenciasCaducidad[index] = diffDays <= 30;
  }

  confirmarRecepcion(): void {
    if (this.recepcionForm.invalid) {
      this.recepcionForm.markAllAsTouched();
      this.toast.error('Formulario incompleto', 'Debe ingresar el N° de Lote y Fecha de Caducidad para todos los productos.');
      return;
    }

    this.procesando.set(true);
    const formValue = this.recepcionForm.value;
    const idOrden = this.orden()!.id;

    const payload = {
      lotes: formValue.lotes.map((l: any) => ({
        idDetalleCompra: l.idDetalleCompra,
        numeroLote: l.numeroLote,
        fechaFabricacion: l.fechaFabricacion || null,
        fechaVencimiento: l.fechaVencimiento
      }))
    };

    this.operacionesService.recepcionarOrden(idOrden, payload).subscribe({
      next: (res) => {
        this.toast.success('Recepción Exitosa', res.mensaje || 'Lotes generados en estado FLOTANTE.');
        // Navegar a alguna vista del bodeguero, ej. dashboard
        this.router.navigate(['/supervisor/compras']); // Ajustar a ruta de bodega si existe
      },
      error: () => {
        this.toast.error('Error', 'No se pudo procesar la recepción.');
        this.procesando.set(false);
      }
    });
  }

  volver(): void {
    this.router.navigate(['/supervisor/compras']);
  }
}
