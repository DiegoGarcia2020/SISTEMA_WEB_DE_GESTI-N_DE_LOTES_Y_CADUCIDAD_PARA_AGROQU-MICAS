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
              <div formArrayName="productos" style="display: flex; flex-direction: column; gap: 1rem;">
                
                @for (prod of productosFormArray.controls; track prod; let i = $index) {
                  <div class="lote-card" [formGroupName]="i" [class.lote-card--bonificacion]="esBonificacion(i)">
                    
                    <div class="lote-card__header">
                      <div class="product-info">
                        <div class="product-info__quantity">{{ getCantidadTotal(i) }}x</div>
                        <div>
                          <p class="product-info__name">{{ getNombreProducto(i) }}</p>
                          <span class="product-info__unit">{{ getUnidadMedida(i) }}</span>
                        </div>
                      </div>
                      <div style="display: flex; align-items: center; gap: 1rem;">
                        @if (esBonificacion(i)) {
                          <span class="badge-regalo">
                            <lucide-icon name="gift" class="w-3.5 h-3.5 inline-block mr-1"></lucide-icon> Bonificación
                          </span>
                        }
                        <span class="restantes-badge" 
                              [class.restantes-badge--ok]="calcularRestantes(i) === 0"
                              [class.restantes-badge--error]="calcularRestantes(i) !== 0">
                          Restantes: {{ calcularRestantes(i) }}
                        </span>
                      </div>
                    </div>

                    <div class="lote-card__body">
                      <div style="overflow-x: auto;">
                        <table class="lotes-table">
                          <thead>
                            <tr>
                              <th>N° de Lote *</th>
                              <th style="width: 100px;">Cantidad *</th>
                              <th>Fabricación</th>
                              <th>Caducidad *</th>
                              <th style="width: 40px; text-align: center;"></th>
                            </tr>
                          </thead>
                          <tbody formArrayName="lotes">
                            @for (lote of getLotesDeProducto(i).controls; track lote; let j = $index) {
                              <tr [formGroupName]="j">
                                <td>
                                  <input type="text" class="form-group__input" formControlName="numeroLote" 
                                         placeholder="Impreso en caja"
                                         [class.form-group__input--error]="campoInvalido(i, j, 'numeroLote')">
                                </td>
                                <td>
                                  <input type="number" class="form-group__input" formControlName="cantidad" min="1"
                                         [class.form-group__input--error]="campoInvalido(i, j, 'cantidad')">
                                </td>
                                <td>
                                  <input type="date" class="form-group__input" formControlName="fechaFabricacion">
                                </td>
                                <td>
                                  <input type="date" class="form-group__input" formControlName="fechaVencimiento"
                                         [class.form-group__input--error]="campoInvalido(i, j, 'fechaVencimiento')"
                                         (change)="validarCaducidad(i, j)">
                                </td>
                                <td style="text-align: center; vertical-align: middle;">
                                  <button type="button" class="btn--remove-lote" (click)="eliminarLote(i, j)" 
                                          [disabled]="getLotesDeProducto(i).length <= 1" title="Eliminar fila">
                                    <lucide-icon name="x" class="w-4 h-4"></lucide-icon>
                                  </button>
                                </td>
                              </tr>
                              @if (advertenciasCaducidad[i + '_' + j]) {
                                <tr>
                                  <td colspan="5" style="padding: 0; border-bottom: none;">
                                    <div class="caducidad-warning" style="margin-top: 0; margin-bottom: 0.5rem; border-top: none;">
                                      <lucide-icon name="alert-triangle" class="caducidad-warning__icon w-5 h-5"></lucide-icon>
                                      <span><strong>Atención:</strong> Este lote caduca en menos de 30 días. Verifique si es correcto.</span>
                                    </div>
                                  </td>
                                </tr>
                              }
                            }
                          </tbody>
                        </table>
                      </div>
                      
                      <div style="margin-top: 1rem; text-align: right;">
                        <button type="button" class="btn--add-lote" (click)="agregarLote(i)" 
                                [disabled]="calcularRestantes(i) <= 0">
                          <lucide-icon name="plus" class="w-4 h-4"></lucide-icon> Añadir lote
                        </button>
                      </div>
                    </div>

                  </div>
                }

              </div>

              <!-- Action Bar pegajosa -->
              <div class="action-bar">
                <button type="button" class="btn btn--back" (click)="volver()">Cancelar</button>
                <button type="submit" class="btn btn--primary" [disabled]="recepcionForm.invalid || procesando() || !todosProductosCuadran()">
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
  advertenciasCaducidad: { [key: string]: boolean } = {};

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
    const productosGroups = orden.detalles.map(detalle => {
      // Creamos el FormGroup del producto
      return this.fb.group({
        idDetalleCompra: [detalle.id],
        // Metadatos
        _nombreProducto: [detalle.nombreProducto],
        _unidadMedida: [detalle.unidadMedida],
        _cantidadTotal: [detalle.cantidad],
        _esBonificacion: [detalle.esBonificacion],
        // Lotes
        lotes: this.fb.array([
          this.fb.group({
            numeroLote: ['', Validators.required],
            cantidad: [detalle.cantidad, [Validators.required, Validators.min(1)]],
            fechaFabricacion: [null],
            fechaVencimiento: [null, Validators.required]
          })
        ])
      });
    });

    this.recepcionForm = this.fb.group({
      productos: this.fb.array(productosGroups)
    });

    const total = orden.detalles.reduce((acc, curr) => acc + curr.cantidad, 0);
    this.totalUnidades.set(total);
  }

  get productosFormArray(): FormArray {
    return this.recepcionForm.get('productos') as FormArray;
  }

  getLotesDeProducto(productoIndex: number): FormArray {
    return this.productosFormArray.at(productoIndex).get('lotes') as FormArray;
  }

  // Helpers para la vista
  getNombreProducto(index: number): string { return this.productosFormArray.at(index).get('_nombreProducto')?.value; }
  getUnidadMedida(index: number): string { return this.productosFormArray.at(index).get('_unidadMedida')?.value; }
  getCantidadTotal(index: number): number { return this.productosFormArray.at(index).get('_cantidadTotal')?.value; }
  esBonificacion(index: number): boolean { return this.productosFormArray.at(index).get('_esBonificacion')?.value; }

  calcularRestantes(productoIndex: number): number {
    const cantidadTotal = this.getCantidadTotal(productoIndex);
    const lotes = this.getLotesDeProducto(productoIndex).value;
    const sumaLotes = lotes.reduce((acc: number, lote: any) => acc + (Number(lote.cantidad) || 0), 0);
    return cantidadTotal - sumaLotes;
  }

  todosProductosCuadran(): boolean {
    if (!this.recepcionForm) return false;
    const len = this.productosFormArray.length;
    for (let i = 0; i < len; i++) {
      if (this.calcularRestantes(i) !== 0) {
        return false;
      }
    }
    return true;
  }

  agregarLote(productoIndex: number): void {
    const restantes = this.calcularRestantes(productoIndex);
    if (restantes <= 0) return;

    const lotesArray = this.getLotesDeProducto(productoIndex);
    lotesArray.push(this.fb.group({
      numeroLote: ['', Validators.required],
      cantidad: [restantes, [Validators.required, Validators.min(1)]],
      fechaFabricacion: [null],
      fechaVencimiento: [null, Validators.required]
    }));
  }

  eliminarLote(productoIndex: number, loteIndex: number): void {
    const lotesArray = this.getLotesDeProducto(productoIndex);
    if (lotesArray.length > 1) {
      lotesArray.removeAt(loteIndex);
      // Limpiar posibles advertencias para esta fila
      delete this.advertenciasCaducidad[`${productoIndex}_${loteIndex}`];
    }
  }

  campoInvalido(productoIndex: number, loteIndex: number, campo: string): boolean {
    const control = this.getLotesDeProducto(productoIndex).at(loteIndex).get(campo);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  /**
   * REQUISITO DEL USUARIO: Warning no bloqueante si caduca en < 30 días.
   * Ahora aplica por fila de lote (p_l).
   */
  validarCaducidad(productoIndex: number, loteIndex: number): void {
    const fechaControl = this.getLotesDeProducto(productoIndex).at(loteIndex).get('fechaVencimiento');
    const key = `${productoIndex}_${loteIndex}`;
    
    if (!fechaControl?.value) {
      this.advertenciasCaducidad[key] = false;
      return;
    }

    const fechaVencimiento = new Date(fechaControl.value);
    const hoy = new Date();
    const diffTime = fechaVencimiento.getTime() - hoy.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    this.advertenciasCaducidad[key] = diffDays <= 30;
  }

  confirmarRecepcion(): void {
    if (this.recepcionForm.invalid) {
      this.recepcionForm.markAllAsTouched();
      this.toast.error('Formulario incompleto', 'Complete todos los campos obligatorios (*).');
      return;
    }

    // Doble validación de cuadre por seguridad
    const productos = this.productosFormArray.value;
    for (let i = 0; i < productos.length; i++) {
      const restantes = this.calcularRestantes(i);
      if (restantes !== 0) {
        const diffMsg = restantes > 0 ? `faltan ${restantes}` : `sobran ${Math.abs(restantes)}`;
        this.toast.error('Cantidades no cuadran', `El producto ${this.getNombreProducto(i)} no cuadra: ${diffMsg} unidades.`);
        return;
      }
    }

    this.procesando.set(true);
    const idOrden = this.orden()!.id;
    const payloadLotes: any[] = [];

    // Aplanar la estructura de productos -> lotes a un solo array de lotes
    productos.forEach((producto: any) => {
      producto.lotes.forEach((lote: any) => {
        payloadLotes.push({
          idDetalleCompra: producto.idDetalleCompra,
          numeroLote: lote.numeroLote,
          cantidad: lote.cantidad,
          fechaFabricacion: lote.fechaFabricacion || null,
          fechaVencimiento: lote.fechaVencimiento
        });
      });
    });

    const payload = {
      idOrdenCompra: idOrden,
      lotes: payloadLotes
    };

    this.operacionesService.recepcionarOrden(idOrden, payload).subscribe({
      next: (res) => {
        this.toast.success('Recepción Exitosa', res.mensaje || 'Lotes generados en estado FLOTANTE.');
        this.router.navigate(['/bodega/recepciones-hoy']);
      },
      error: () => {
        this.toast.error('Error', 'No se pudo procesar la recepción.');
        this.procesando.set(false);
      }
    });
  }

  volver(): void {
    this.router.navigate(['/bodega/recepciones-hoy']);
  }
}
