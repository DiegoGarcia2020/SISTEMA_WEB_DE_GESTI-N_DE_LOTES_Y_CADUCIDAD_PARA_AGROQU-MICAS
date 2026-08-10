import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { OperacionesService } from '../../../core/services/operaciones.service';
import { ProveedorService } from '../../../core/services/proveedor.service';
import { ProductoService, ProductoDTO } from '../../../core/services/producto.service';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { ProductoSimple, ProveedorSimple, ProductoDeProveedor } from '../../../core/models/compras.model';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-compras-crear',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  styleUrl: './compras-crear.component.css',
  template: `
    <div class="crear-container">
      <!-- Cabecera -->
      <div class="page-header">
        <div class="page-header__info">
          <div class="page-header__icon">
            <lucide-icon name="file-plus" class="w-7 h-7"></lucide-icon>
          </div>
          <div>
            <h1 class="page-header__title">Nueva Orden de Compra</h1>
            <p class="page-header__subtitle">Transcriba la factura física del proveedor al sistema</p>
          </div>
        </div>
      </div>

      <form [formGroup]="ordenForm" (ngSubmit)="guardarOrden()">
        <!-- Sección 1: Datos de la Factura -->
        <div class="section-card">
          <div class="section-card__header">
            <div class="section-card__icon section-card__icon--green">
              <lucide-icon name="file-text" class="w-5 h-5"></lucide-icon>
            </div>
            <div>
              <h2 class="section-card__title">Datos de la Factura</h2>
              <p class="section-card__subtitle">Información general del documento emitido por el proveedor</p>
            </div>
          </div>
          <div class="section-card__body">
            <div class="form-grid form-grid--3">
              <div class="form-group">
                <label class="form-group__label">Proveedor *</label>
                <select class="form-group__select" formControlName="idProveedor" 
                        [class.form-group__input--error]="campoInvalido('idProveedor')">
                  <option [ngValue]="null" disabled>Seleccione un proveedor</option>
                  @for (prov of proveedores; track prov.idProveedor) {
                    <option [ngValue]="prov.idProveedor">{{ prov.nombreRepresentante }}</option>
                  }
                </select>
              </div>
              <div class="form-group">
                <label class="form-group__label">N° de Factura *</label>
                <input type="text" class="form-group__input" formControlName="numeroFactura" 
                       placeholder="Ej: FAC-001-002345"
                       [class.form-group__input--error]="campoInvalido('numeroFactura')">
              </div>
              <div class="form-group">
                <label class="form-group__label">Fecha de Emisión *</label>
                <input type="date" class="form-group__input" formControlName="fechaEmision"
                       [class.form-group__input--error]="campoInvalido('fechaEmision')">
              </div>
              <div class="form-group">
                <label class="form-group__label">Fecha Estimada Llegada</label>
                <input type="date" class="form-group__input" formControlName="fechaLlegadaEstimada"
                       [class.form-group__input--error]="campoInvalido('fechaLlegadaEstimada')">
              </div>
              <div class="form-group">
                <label class="form-group__label">Ventana Horaria</label>
                <select class="form-group__select" formControlName="ventanaHoraria"
                        [class.form-group__input--error]="campoInvalido('ventanaHoraria')">
                  <option [ngValue]="null" disabled>Seleccione ventana...</option>
                  <option value="08:00 - 10:00">08:00 - 10:00</option>
                  <option value="10:00 - 12:00">10:00 - 12:00</option>
                  <option value="14:00 - 16:00">14:00 - 16:00</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- Sección 2: Detalle de Productos -->
        <div class="section-card">
          <div class="section-card__header">
            <div class="section-card__icon section-card__icon--amber">
              <lucide-icon name="package-plus" class="w-5 h-5"></lucide-icon>
            </div>
            <div style="flex-grow: 1">
              <h2 class="section-card__title">Productos Facturados</h2>
              <p class="section-card__subtitle">Agregue los ítems comprados y las bonificaciones (regalos)</p>
              @if (!ordenForm.get('idProveedor')?.value) {
                <p class="text-amber-600 text-sm mt-1" style="color: #d97706; font-size: 0.875rem; margin-top: 0.25rem;">Seleccione un proveedor para ver los productos de su catálogo.</p>
              } @else if (productosProveedor.length === 0) {
                <p class="text-amber-600 text-sm mt-1" style="color: #d97706; font-size: 0.875rem; margin-top: 0.25rem;">Este proveedor aún no tiene productos registrados. Use "Registrar Producto Nuevo" para agregar el primero.</p>
              }
            </div>
            <div class="detalles-actions">
               <button type="button" class="btn btn--gift btn--sm" (click)="agregarRegalo()" [disabled]="!ordenForm.get('idProveedor')?.value">
                <lucide-icon name="gift" class="w-3.5 h-3.5"></lucide-icon> Añadir Regalo
              </button>
              <button type="button" class="btn btn--outline btn--sm" (click)="agregarDetalle()" [disabled]="!ordenForm.get('idProveedor')?.value || productosProveedor.length === 0" title="Agrega una línea con un producto ya registrado para este proveedor">
                <lucide-icon name="plus" class="w-3.5 h-3.5"></lucide-icon> Añadir Producto
              </button>
              <button type="button" class="btn btn--primary btn--sm" (click)="abrirModalNuevoProducto()" [disabled]="!ordenForm.get('idProveedor')?.value" title="Registra un producto del catálogo general en el catálogo de este proveedor">
                <lucide-icon name="package-plus" class="w-3.5 h-3.5"></lucide-icon> Registrar Producto Nuevo
              </button>
            </div>
          </div>
          
          <div class="detalles-table-wrapper" formArrayName="detalles">
            <table class="detalles-table">
              <thead>
                <tr>
                  <th style="width: 30%">Producto</th>
                  <th style="width: 10%">Cant.</th>
                  <th style="width: 15%">Precio Unit. ($)</th>
                  <th style="width: 15%">Dscto. (%)</th>
                  <th style="width: 20%; text-align: right">Subtotal ($)</th>
                  <th style="width: 10%; text-align: center">Acción</th>
                </tr>
              </thead>
              <tbody>
                @for (detalle of detallesFormArray.controls; track detalle; let i = $index) {
                  <tr [formGroupName]="i" [class.row--bonificacion]="detalle.get('esBonificacion')?.value">
                    <td>
                      <select class="detalles-table__input" formControlName="idProducto" (change)="onProductoSeleccionado(i)">
                        <option [ngValue]="null" disabled>Seleccione producto...</option>
                        @for (prod of productosProveedor; track prod.idProducto) {
                          <option [ngValue]="prod.idProducto">{{ prod.nombreProducto }}</option>
                        }
                      </select>
                      @if (detalle.get('esBonificacion')?.value) {
                        <div style="margin-top: 0.25rem;">
                           <span class="badge-regalo">BONIFICACIÓN</span>
                        </div>
                      }
                    </td>
                    <td>
                      <input type="number" class="detalles-table__input detalles-table__input--number" 
                             formControlName="cantidad" min="1">
                    </td>
                    <td>
                      <input type="number" class="detalles-table__input detalles-table__input--number" 
                             formControlName="precioUnitario" step="0.01" min="0"
                             [class.detalles-table__input--readonly]="detalle.get('esBonificacion')?.value"
                             [readonly]="detalle.get('esBonificacion')?.value">
                    </td>
                    <td>
                      <input type="number" class="detalles-table__input detalles-table__input--number" 
                             formControlName="porcentajeDescuento" step="0.01" min="0" max="100"
                             [class.detalles-table__input--readonly]="detalle.get('esBonificacion')?.value"
                             [readonly]="detalle.get('esBonificacion')?.value">
                    </td>
                    <td>
                      <div class="detalles-table__subtotal">
                        {{ calcularSubtotalFila(i) | number:'1.2-2' }}
                      </div>
                    </td>
                    <td style="text-align: center">
                      <button type="button" class="btn--danger-sm" (click)="eliminarDetalle(i)" title="Eliminar fila">
                        <lucide-icon name="trash-2" class="w-4 h-4"></lucide-icon>
                      </button>
                    </td>
                  </tr>
                }
                @if (detallesFormArray.length === 0) {
                  <tr>
                    <td colspan="6" style="text-align: center; padding: 2rem; color: var(--gray-400)">
                      No hay productos agregados. Utilice los botones superiores para añadir.
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        <!-- Sección 3: Totales y Envío -->
        <div class="totals-card">
          <div class="totals-grid">
            
            <!-- Transporte e Impuestos -->
            <div>
              <div class="form-group" style="margin-bottom: 1rem">
                <label class="form-group__label">Costo de Transporte / Flete ($)</label>
                <input type="number" class="form-group__input" formControlName="costoTransporte" step="0.01" min="0">
              </div>
              <div class="form-group">
                <label class="form-group__label">IVA (15%) Aplicado</label>
                <div class="readonly-value">
                  \${{ totalesCalculados.iva | number:'1.2-2' }}
                </div>
              </div>
            </div>

            <!-- Resumen Financiero -->
            <div class="totals-right">
              <div class="total-row">
                <span class="total-row__label">Subtotal Bruto (sin dscto)</span>
                <span class="total-row__value">\${{ totalesCalculados.subtotalBruto | number:'1.2-2' }}</span>
              </div>
              <div class="total-row total-row--discount">
                <span class="total-row__label">Total Descuentos</span>
                <span class="total-row__value">-\${{ totalesCalculados.totalDescuentos | number:'1.2-2' }}</span>
              </div>
              <div class="total-row">
                <span class="total-row__label">Base Imponible</span>
                <span class="total-row__value">\${{ totalesCalculados.baseImponible | number:'1.2-2' }}</span>
              </div>
              <div class="total-row">
                <span class="total-row__label">IVA (15%)</span>
                <span class="total-row__value">\${{ totalesCalculados.iva | number:'1.2-2' }}</span>
              </div>
              <div class="total-row">
                <span class="total-row__label">Transporte</span>
                <span class="total-row__value">\${{ ordenForm.get('costoTransporte')?.value || 0 | number:'1.2-2' }}</span>
              </div>
              <div class="total-row total-row--grand">
                <span class="total-row__label">TOTAL A PAGAR</span>
                <span class="total-row__value">\${{ totalesCalculados.granTotal | number:'1.2-2' }}</span>
              </div>
            </div>

          </div>
        </div>

        <!-- Botonera -->
        <div class="action-footer">
          <button type="button" class="btn btn--back" (click)="cancelar()">
            Cancelar
          </button>
          <button type="submit" class="btn btn--primary btn--lg" [disabled]="ordenForm.invalid || detallesFormArray.length === 0">
            <lucide-icon name="save" class="w-4 h-4"></lucide-icon>
            Guardar Orden de Compra
          </button>
        </div>
      </form>

      @if (mostrarModalNuevoProducto) {
        <div class="modal-overlay" (click)="cerrarModalNuevoProducto()">
          <div class="modal-box" (click)="$event.stopPropagation()" [formGroup]="nuevoProductoForm">
            <div class="modal-box__header">
              <h3>Registrar Producto Nuevo para el Proveedor</h3>
              <button type="button" class="modal-box__close" (click)="cerrarModalNuevoProducto()">&times;</button>
            </div>
            <div class="modal-box__body">
              <div class="form-group">
                <label class="form-group__label">Producto del catálogo general *</label>
                <select class="form-group__select" formControlName="idProducto">
                  <option [ngValue]="null" disabled>Seleccione producto...</option>
                  @for (prod of productosDisponiblesParaRegistrar; track prod.idProducto) {
                    <option [ngValue]="prod.idProducto">{{ prod.nombre }} ({{ prod.unidadMedida }})</option>
                  }
                </select>
                @if (productosDisponiblesParaRegistrar.length === 0) {
                  <p class="text-amber-600 text-sm mt-1" style="color: #d97706; font-size: 0.875rem; margin-top: 0.25rem;">Todos los productos del catálogo ya están registrados para este proveedor.</p>
                }
              </div>
              <div class="form-group">
                <label class="form-group__label">Precio Referencial ($)</label>
                <input type="number" class="form-group__input" formControlName="precioReferencial" step="0.01" min="0">
              </div>
              <div class="form-group">
                <label class="form-group__label">Código del producto en el proveedor</label>
                <input type="text" class="form-group__input" formControlName="codigoProductoProveedor" placeholder="Opcional">
              </div>
            </div>
            <div class="modal-box__footer">
              <button type="button" class="btn btn--back" (click)="cerrarModalNuevoProducto()">Cancelar</button>
              <button type="button" class="btn btn--primary" [disabled]="nuevoProductoForm.invalid" (click)="registrarNuevoProducto()">
                Registrar y Agregar a la Orden
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,0.5);
      display: flex; align-items: center; justify-content: center; z-index: 1000;
    }
    .modal-box {
      background: var(--bg-card, #fff); border-radius: 0.5rem; width: 100%; max-width: 28rem;
      box-shadow: 0 10px 25px rgba(0,0,0,0.2);
    }
    .modal-box__header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 1rem 1.25rem; border-bottom: 1px solid var(--gray-200, #e5e7eb);
    }
    .modal-box__header h3 { margin: 0; font-size: 1rem; font-weight: 600; }
    .modal-box__close { background: none; border: none; font-size: 1.5rem; line-height: 1; cursor: pointer; }
    .modal-box__body { padding: 1.25rem; display: flex; flex-direction: column; gap: 1rem; }
    .modal-box__footer { display: flex; justify-content: flex-end; gap: 0.5rem; padding: 1rem 1.25rem; border-top: 1px solid var(--gray-200, #e5e7eb); }
  `]
})
export class ComprasCrearComponent implements OnInit {
  
  readonly IVA_RATE = 0.15;

  private fb = inject(FormBuilder);
  private operacionesService = inject(OperacionesService);
  private proveedorService = inject(ProveedorService);
  private productoService = inject(ProductoService);
  private toast = inject(ToastService);
  private router = inject(Router);

  ordenForm!: FormGroup;
  proveedores: ProveedorSimple[] = [];
  productosProveedor: ProductoDeProveedor[] = [];

  catalogoGeneral: ProductoDTO[] = [];
  mostrarModalNuevoProducto = false;
  nuevoProductoForm!: FormGroup;

  totalesCalculados = {
    subtotalBruto: 0,
    totalDescuentos: 0,
    baseImponible: 0,
    iva: 0,
    granTotal: 0
  };

  ngOnInit(): void {
    this.inicializarFormulario();
    this.nuevoProductoForm = this.fb.group({
      idProducto: [null, Validators.required],
      precioReferencial: [0, [Validators.required, Validators.min(0)]],
      codigoProductoProveedor: ['']
    });
    this.cargarDatosMaestros();
    this.suscribirseACambios();
  }

  get productosDisponiblesParaRegistrar(): ProductoDTO[] {
    const idsYaRegistrados = new Set(this.productosProveedor.map(p => p.idProducto));
    return this.catalogoGeneral.filter(p => !idsYaRegistrados.has(p.idProducto));
  }

  abrirModalNuevoProducto(): void {
    this.nuevoProductoForm.reset({ idProducto: null, precioReferencial: 0, codigoProductoProveedor: '' });
    this.mostrarModalNuevoProducto = true;
  }

  cerrarModalNuevoProducto(): void {
    this.mostrarModalNuevoProducto = false;
  }

  registrarNuevoProducto(): void {
    if (this.nuevoProductoForm.invalid) {
      this.nuevoProductoForm.markAllAsTouched();
      return;
    }

    const idProveedor = this.ordenForm.get('idProveedor')?.value;
    const { idProducto, precioReferencial, codigoProductoProveedor } = this.nuevoProductoForm.getRawValue();

    this.proveedorService.asociarProducto(idProveedor, {
      idProveedor,
      idProducto,
      precioReferencial,
      codigoProductoProveedor: codigoProductoProveedor || undefined
    }).subscribe({
      next: () => {
        const productoCatalogo = this.catalogoGeneral.find(p => p.idProducto === idProducto);
        this.productosProveedor = [...this.productosProveedor, {
          idProducto,
          nombreProducto: productoCatalogo?.nombre || '',
          unidadMedida: productoCatalogo?.unidadMedida,
          precioReferencial
        }];

        this.agregarDetalle();
        const nuevaFila = this.detallesFormArray.at(this.detallesFormArray.length - 1);
        nuevaFila.patchValue({ idProducto, precioUnitario: precioReferencial });

        this.toast.success('Producto registrado', 'El producto se agregó al catálogo del proveedor y a la orden.');
        this.mostrarModalNuevoProducto = false;
      },
      error: (err) => {
        this.toast.error('Error', err?.error?.mensaje || 'No se pudo registrar el producto para este proveedor.');
      }
    });
  }



  private inicializarFormulario(): void {
    this.ordenForm = this.fb.group({
      idProveedor: [null, Validators.required],
      numeroFactura: ['', Validators.required],
      fechaEmision: [new Date().toISOString().substring(0, 10), Validators.required],
      fechaLlegadaEstimada: [null],
      ventanaHoraria: [null],
      costoTransporte: [0, [Validators.required, Validators.min(0)]],
      detalles: this.fb.array([], Validators.required)
    });
  }

  get detallesFormArray(): FormArray {
    return this.ordenForm.get('detalles') as FormArray;
  }

  agregarDetalle(esBonificacion: boolean = false): void {
    const detalleGroup = this.fb.group({
      idProducto: [null, Validators.required],
      cantidad: [1, [Validators.required, Validators.min(1)]],
      precioUnitario: [{ value: 0, disabled: esBonificacion }, [Validators.required, Validators.min(0)]],
      porcentajeDescuento: [{ value: 0, disabled: esBonificacion }, [Validators.required, Validators.min(0), Validators.max(100)]],
      esBonificacion: [esBonificacion]
    });

    this.detallesFormArray.push(detalleGroup);
  }

  agregarRegalo(): void {
    this.agregarDetalle(true);
  }

  eliminarDetalle(index: number): void {
    this.detallesFormArray.removeAt(index);
  }

  private cargarDatosMaestros(): void {
    // Proveedores
    this.proveedorService.listarProveedores().subscribe({
      next: (data) => this.proveedores = data as unknown as ProveedorSimple[],
      error: () => this.toast.error('Error', 'No se pudieron cargar los proveedores')
    });

    // Catálogo general de productos (para registrar productos nuevos en el proveedor)
    this.productoService.listarTodos().subscribe({
      next: (data) => this.catalogoGeneral = data,
      error: () => this.toast.error('Error', 'No se pudo cargar el catálogo de productos')
    });
  }

  private cargarProductosDelProveedor(idProveedor: number): void {
    this.proveedorService.listarProductos(idProveedor).subscribe({
      next: (data) => this.productosProveedor = data as unknown as ProductoDeProveedor[],
      error: () => this.toast.error('Error', 'No se pudieron cargar los productos del proveedor')
    });
  }

  /**
   * MEMORIA DE PRECIOS
   * Al seleccionar un producto, busca su último precio pagado.
   */
  onProductoSeleccionado(index: number): void {
    const detalleControl = this.detallesFormArray.at(index);
    const idProducto = detalleControl.get('idProducto')?.value;
    const esBonificacion = detalleControl.get('esBonificacion')?.value;

    if (idProducto && !esBonificacion) {
      this.operacionesService.obtenerUltimoPrecioProducto(idProducto).subscribe({
        next: (response) => {
          if (response.encontrado) {
            detalleControl.patchValue({ precioUnitario: response.precioUnitario }, { emitEvent: false });
            this.toast.info('Precio recuperado', `Se aplicó el último precio pagado: $${response.precioUnitario}`);
            this.recalcularTotales(); // Forzar recálculo
          } else {
            // Si no hay compras previas, usar el precio de catálogo como sugerencia
            const productoCatalogo = this.productosProveedor.find(p => p.idProducto === idProducto);
            if (productoCatalogo && productoCatalogo.precioReferencial) {
              detalleControl.patchValue({ precioUnitario: productoCatalogo.precioReferencial }, { emitEvent: false });
            }
          }
        }
      });
    }
  }

  private suscribirseACambios(): void {
    // Escuchar cambios de proveedor para recargar productos
    this.ordenForm.get('idProveedor')?.valueChanges.subscribe(idProveedor => {
      if (idProveedor) {
        if (this.detallesFormArray.length > 0) {
          this.detallesFormArray.clear();
          this.toast.info('Atención', 'Se limpió la lista de productos al cambiar de proveedor.');
          this.recalcularTotales();
        }
        this.cargarProductosDelProveedor(idProveedor);
      } else {
        this.productosProveedor = [];
      }
    });

    // Escuchar cambios profundos en el FormArray para recalcular
    this.detallesFormArray.valueChanges.pipe(
      debounceTime(300)
    ).subscribe(() => {
      this.recalcularTotales();
    });

    // Escuchar cambios en transporte
    this.ordenForm.get('costoTransporte')?.valueChanges.pipe(
      debounceTime(300)
    ).subscribe(() => {
      this.recalcularTotales();
    });
  }

  calcularSubtotalFila(index: number): number {
    const detalle = this.detallesFormArray.at(index).getRawValue(); // getRawValue para leer disabled
    if (detalle.esBonificacion) return 0;
    
    const cantidad = detalle.cantidad || 0;
    const precio = detalle.precioUnitario || 0;
    const descuento = detalle.porcentajeDescuento || 0;
    
    const bruto = cantidad * precio;
    const valorDscto = bruto * (descuento / 100);
    return bruto - valorDscto;
  }

  private recalcularTotales(): void {
    let subtotal = 0;
    let descuentos = 0;

    const detalles = this.detallesFormArray.getRawValue();
    detalles.forEach((d: any) => {
      if (!d.esBonificacion) {
        const cant = d.cantidad || 0;
        const precio = d.precioUnitario || 0;
        const porcDesc = d.porcentajeDescuento || 0;
        
        const brutoFila = cant * precio;
        const descFila = brutoFila * (porcDesc / 100);
        
        subtotal += brutoFila;
        descuentos += descFila;
      }
    });

    const baseImponible = subtotal - descuentos;
    const iva = baseImponible * this.IVA_RATE;
    const costoTransporte = this.ordenForm.get('costoTransporte')?.value || 0;
    const granTotal = baseImponible + iva + costoTransporte;

    this.totalesCalculados = {
      subtotalBruto: subtotal,
      totalDescuentos: descuentos,
      baseImponible,
      iva,
      granTotal
    };
  }

  campoInvalido(campo: string): boolean {
    const control = this.ordenForm.get(campo);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  cancelar(): void {
    this.router.navigate(['/supervisor/compras']);
  }

  guardarOrden(): void {
    if (this.ordenForm.invalid) {
      this.ordenForm.markAllAsTouched();
      this.toast.error('Formulario inválido', 'Revise los campos obligatorios.');
      return;
    }

    if (this.detallesFormArray.length === 0) {
      this.toast.error('Sin productos', 'Debe agregar al menos un producto a la orden.');
      return;
    }

    // Extraer datos usando getRawValue() para incluir los campos disabled (precio de bonificaciones)
    const formValue = this.ordenForm.getRawValue();
    
    // El backend se encarga de calcular los totales financieros, solo enviamos los inputs
    const payload = {
      idProveedor: formValue.idProveedor,
      numeroFactura: formValue.numeroFactura,
      fechaEmision: formValue.fechaEmision,
      fechaLlegadaEstimada: formValue.fechaLlegadaEstimada || null,
      ventanaHoraria: formValue.ventanaHoraria || null,
      costoTransporte: formValue.costoTransporte,
      impuestos: this.totalesCalculados.iva,
      detalles: formValue.detalles.map((d: any) => ({
        idProducto: d.idProducto,
        cantidad: d.cantidad,
        precioUnitario: d.esBonificacion ? 0 : d.precioUnitario,
        porcentajeDescuento: d.esBonificacion ? 0 : d.porcentajeDescuento,
        esBonificacion: d.esBonificacion
      }))
    };

    this.operacionesService.crearOrdenCompra(payload).subscribe({
      next: (res) => {
        this.toast.success('Orden Guardada', `La orden fue creada exitosamente con ID: ${res.idOrden}`);
        this.router.navigate(['/supervisor/compras']);
      },
      error: () => this.toast.error('Error', 'No se pudo guardar la orden de compra.')
    });
  }
}
