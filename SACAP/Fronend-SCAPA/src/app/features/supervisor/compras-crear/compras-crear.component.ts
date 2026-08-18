import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { OperacionesService } from '../../../core/services/operaciones.service';
import { ProveedorService } from '../../../core/services/proveedor.service';
import { ProductoService } from '../../../core/services/producto.service';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { ProductoSimple, ProveedorSimple, ProductoDeProveedor } from '../../../core/models/compras.model';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { ProveedorProductosModalComponent } from '../proveedores/proveedor-productos-modal/proveedor-productos-modal.component';

@Component({
  selector: 'app-compras-crear',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule, ProveedorProductosModalComponent],
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
                <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 0.5rem;">
                  <label class="form-group__label" style="margin-bottom: 0;">Proveedor *</label>
                  <button type="button" class="btn--action" style="font-size: 0.75rem; padding: 0.1rem 0.25rem; color: var(--c-dark-green);" (click)="abrirModalProductos()" [disabled]="!ordenForm.get('idProveedor')?.value" title="Añadir producto al catálogo del proveedor">
                    <lucide-icon name="plus-circle" class="w-3.5 h-3.5"></lucide-icon> Añadir producto
                  </button>
                </div>
                <select class="form-group__select" formControlName="idProveedor" 
                        [class.form-group__input--error]="campoInvalido('idProveedor')">
                  <option [ngValue]="null" disabled>Seleccione un proveedor</option>
                  @for (prov of proveedores; track prov.idProveedor) {
                    <option [ngValue]="prov.idProveedor">{{ prov.nombre || prov.nombreRepresentante }}</option>
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
                <label class="form-group__label">Fecha Estimada Llegada *</label>
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
              <div class="form-group">
                <label class="form-group__label">Factura del proveedor (opcional)</label>
                <div style="display: flex; gap: 0.5rem; align-items: center;">
                  <input type="file" id="archivoFactura" class="form-group__input" accept=".pdf,.jpg,.jpeg,.png" (change)="onArchivoSeleccionado($event)" style="padding: 0.35rem;">
                  @if (archivoFactura) {
                    <button type="button" class="btn--danger-sm" (click)="removerArchivo()" title="Quitar archivo adjunto">
                      <lucide-icon name="x" class="w-4 h-4"></lucide-icon>
                    </button>
                  }
                </div>
                <small style="color: var(--text-muted); font-size: 0.75rem; margin-top: 0.25rem; display: block;">PDF, JPG, PNG. Máx 10MB.</small>
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
              }
            </div>
            <div class="detalles-actions">
               <button type="button" class="btn btn--gift btn--sm" (click)="agregarRegalo()" [disabled]="!ordenForm.get('idProveedor')?.value" title="Seleccione un proveedor primero">
                <lucide-icon name="gift" class="w-3.5 h-3.5"></lucide-icon> Añadir Regalo
              </button>
              <button type="button" class="btn btn--outline btn--sm" (click)="agregarDetalle()" [disabled]="!ordenForm.get('idProveedor')?.value" title="Seleccione un proveedor primero">
                <lucide-icon name="plus" class="w-3.5 h-3.5"></lucide-icon> Añadir Producto
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
                      <div style="margin-top: 0.25rem; display: flex; gap: 0.5rem; flex-wrap: wrap;">
                        @if (detalle.get('idProducto')?.value) {
                          @if (detalle.get('_aplicaIva')?.value) {
                            <span style="font-size: 0.7rem; padding: 0.1rem 0.4rem; border-radius: 9999px; background-color: var(--c-cacao-accent); color: white;">
                              IVA {{ detalle.get('_porcentajeIva')?.value }}%
                            </span>
                          } @else {
                            <span style="font-size: 0.7rem; padding: 0.1rem 0.4rem; border-radius: 9999px; border: 1px solid var(--c-sage-border); color: var(--gray-600);">
                              Exento
                            </span>
                          }
                        }
                        @if (detalle.get('esBonificacion')?.value) {
                           <span class="badge-regalo">BONIFICACIÓN</span>
                        }
                      </div>
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
                <span class="total-row__label">IVA Aplicado</span>
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
        </div>
      </form>
    </div>

    @if (isModalProductosOpen()) {
      <app-proveedor-productos-modal
        [idProveedor]="ordenForm.get('idProveedor')?.value"
        [nombreProveedor]="nombreProveedorSeleccionado()"
        (close)="cerrarModalProductos($event)">
      </app-proveedor-productos-modal>
    }
  `
})
export class ComprasCrearComponent implements OnInit {

  private fb = inject(FormBuilder);
  private operacionesService = inject(OperacionesService);
  private proveedorService = inject(ProveedorService);
  private productoService = inject(ProductoService);
  private toast = inject(ToastService);
  private router = inject(Router);

  ordenForm!: FormGroup;
  proveedores: ProveedorSimple[] = [];
  productosProveedor: ProductoDeProveedor[] = [];
  archivoFactura: File | null = null;

  totalesCalculados = {
    subtotalBruto: 0,
    totalDescuentos: 0,
    baseImponible: 0,
    iva: 0,
    granTotal: 0
  };

  isModalProductosOpen = signal<boolean>(false);

  ngOnInit(): void {
    this.inicializarFormulario();
    this.cargarDatosMaestros();
    this.suscribirseACambios();
  }



  private inicializarFormulario(): void {
    this.ordenForm = this.fb.group({
      idProveedor: [null, Validators.required],
      numeroFactura: ['', Validators.required],
      fechaEmision: [new Date().toISOString().substring(0, 10), Validators.required],
      fechaLlegadaEstimada: [null, Validators.required],
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
      esBonificacion: [esBonificacion],
      _aplicaIva: [false],
      _porcentajeIva: [0]
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
    this.proveedorService.listarTodos().subscribe({
      next: (data) => this.proveedores = data as unknown as ProveedorSimple[],
      error: () => this.toast.error('Error', 'No se pudieron cargar los proveedores')
    });
  }

  private cargarProductosDelProveedor(idProveedor: number): void {
    this.proveedorService.listarProductos(idProveedor).subscribe({
      next: (data) => this.productosProveedor = data as unknown as ProductoDeProveedor[],
      error: () => this.toast.error('Error', 'No se pudieron cargar los productos del proveedor')
    });
  }

  nombreProveedorSeleccionado(): string {
    const id = this.ordenForm.get('idProveedor')?.value;
    if (!id) return '';
    const prov = this.proveedores.find(p => p.idProveedor === id);
    return prov ? (prov.nombre || prov.nombreRepresentante) : '';
  }

  abrirModalProductos(): void {
    if (this.ordenForm.get('idProveedor')?.value) {
      this.isModalProductosOpen.set(true);
    }
  }

  cerrarModalProductos(huboCambios: boolean): void {
    this.isModalProductosOpen.set(false);
    if (huboCambios) {
      const id = this.ordenForm.get('idProveedor')?.value;
      if (id) {
        this.cargarProductosDelProveedor(id);
      }
    }
  }

  /**
   * MEMORIA DE PRECIOS
   * Al seleccionar un producto, busca su último precio pagado.
   */
  onProductoSeleccionado(index: number): void {
    const detalleControl = this.detallesFormArray.at(index);
    const idProducto = detalleControl.get('idProducto')?.value;
    const esBonificacion = detalleControl.get('esBonificacion')?.value;

    if (idProducto) {
      const productoCatalogo = this.productosProveedor.find(p => p.idProducto === idProducto);
      if (productoCatalogo) {
        detalleControl.patchValue({
          _aplicaIva: productoCatalogo.aplicaIva,
          _porcentajeIva: productoCatalogo.porcentajeIva
        }, { emitEvent: false });
      }
    }

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
      debounceTime(150)
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
    let ivaTotal = 0;

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
        
        const baseLinea = brutoFila - descFila;
        ivaTotal += d._aplicaIva ? (baseLinea * (d._porcentajeIva || 0) / 100) : 0;
      }
    });

    const baseImponible = subtotal - descuentos;
    const costoTransporte = this.ordenForm.get('costoTransporte')?.value || 0;
    const granTotal = baseImponible + ivaTotal + costoTransporte;

    this.totalesCalculados = {
      subtotalBruto: subtotal,
      totalDescuentos: descuentos,
      baseImponible,
      iva: ivaTotal,
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
      fechaLlegadaEstimada: formValue.fechaLlegadaEstimada,
      ventanaHoraria: formValue.ventanaHoraria,
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
        if (this.archivoFactura) {
          // Subir el documento
          this.operacionesService.subirDocumentoOrdenCompra(res.idOrden, this.archivoFactura).subscribe({
            next: () => {
              this.toast.success('Orden Guardada', `La orden y la factura fueron guardadas exitosamente con ID: ${res.idOrden}`);
              this.router.navigate(['/supervisor/compras']);
            },
            error: () => {
              this.toast.error('Atención', 'La orden se guardó, pero hubo un error al subir la factura adjunta.');
              this.router.navigate(['/supervisor/compras']);
            }
          });
        } else {
          this.toast.success('Orden Guardada', `La orden fue creada exitosamente con ID: ${res.idOrden}`);
          this.router.navigate(['/supervisor/compras']);
        }
      },
      error: () => this.toast.error('Error', 'No se pudo guardar la orden de compra.')
    });
  }

  onArchivoSeleccionado(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const extensionesPermitidas = ['application/pdf', 'image/jpeg', 'image/png'];
      if (!extensionesPermitidas.includes(file.type)) {
        this.toast.error('Archivo no válido', 'Solo se permiten archivos PDF, JPG y PNG.');
        (event.target as HTMLInputElement).value = '';
        this.archivoFactura = null;
        return;
      }
      
      // Validar tamaño (10MB)
      if (file.size > 10 * 1024 * 1024) {
        this.toast.error('Archivo demasiado grande', 'El tamaño máximo permitido es 10MB.');
        (event.target as HTMLInputElement).value = '';
        this.archivoFactura = null;
        return;
      }
      
      this.archivoFactura = file;
    }
  }

  removerArchivo(): void {
    this.archivoFactura = null;
    const fileInput = document.getElementById('archivoFactura') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }
}
