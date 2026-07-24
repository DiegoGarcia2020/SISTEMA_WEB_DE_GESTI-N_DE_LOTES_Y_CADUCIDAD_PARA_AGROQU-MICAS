import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { OperacionesService } from '../../../core/services/operaciones.service';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { ProductoSimple, ProveedorSimple } from '../../../core/models/compras.model';
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
        <div class="page-header__blur"></div>
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
                    <option [ngValue]="prov.idProveedor">{{ prov.nombre }}</option>
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
            </div>
            <div class="detalles-actions">
               <button type="button" class="btn btn--gift btn--sm" (click)="agregarDetalle(true)">
                <lucide-icon name="gift" class="w-3.5 h-3.5"></lucide-icon> Añadir Regalo
              </button>
              <button type="button" class="btn btn--outline btn--sm" (click)="agregarDetalle()">
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
                        @for (prod of productos; track prod.idProducto) {
                          <option [ngValue]="prod.idProducto">{{ prod.nombre }}</option>
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
                <label class="form-group__label">Impuestos Aplicados ($)</label>
                <input type="number" class="form-group__input" formControlName="impuestos" step="0.01" min="0">
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
                <span class="total-row__label">Transporte e Impuestos</span>
                <span class="total-row__value">\${{ (ordenForm.get('costoTransporte')?.value || 0) + (ordenForm.get('impuestos')?.value || 0) | number:'1.2-2' }}</span>
              </div>
              <div class="total-row total-row--grand">
                <span class="total-row__label">TOTAL A PAGAR</span>
                <span class="total-row__value">\${{ calcularTotalNeto() | number:'1.2-2' }}</span>
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
    </div>
  `
})
export class ComprasCrearComponent implements OnInit {
  
  private fb = inject(FormBuilder);
  private operacionesService = inject(OperacionesService);
  private toast = inject(ToastService);
  private router = inject(Router);

  ordenForm!: FormGroup;
  proveedores: ProveedorSimple[] = [];
  productos: ProductoSimple[] = [];

  totalesCalculados = {
    subtotalBruto: 0,
    totalDescuentos: 0
  };

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
      costoTransporte: [0, [Validators.required, Validators.min(0)]],
      impuestos: [0, [Validators.required, Validators.min(0)]],
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

  eliminarDetalle(index: number): void {
    this.detallesFormArray.removeAt(index);
  }

  private cargarDatosMaestros(): void {
    // Proveedores (usando fallback si falla)
    this.operacionesService['http'].get<any[]>(`${this.operacionesService['apiUrl']}/proveedores`).subscribe({
      next: (data) => this.proveedores = data,
      error: () => {
        this.proveedores = [
          { idProveedor: 1, nombre: 'Agroquímicos del Pacífico', ruc: '0991234567001' },
          { idProveedor: 2, nombre: 'Bayer CropScience', ruc: '1791234567001' }
        ];
      }
    });

    // Productos (usando fallback si falla)
    this.operacionesService['http'].get<any[]>(`${this.operacionesService['apiUrl']}/productos`).subscribe({
      next: (data) => this.productos = data,
      error: () => {
        this.productos = [
          { idProducto: 1, nombre: 'Fertilizante Urea Agrícola 46% N', unidadMedida: 'Sacos', precio: 35.00 },
          { idProducto: 2, nombre: 'Fungicida Carbendazim 500 SC', unidadMedida: 'Litros', precio: 18.50 },
          { idProducto: 3, nombre: 'Insecticida Cipermetrina 20 EC', unidadMedida: 'Litros', precio: 12.00 }
        ];
      }
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
            const productoCatalogo = this.productos.find(p => p.idProducto === idProducto);
            if (productoCatalogo) {
              detalleControl.patchValue({ precioUnitario: productoCatalogo.precio }, { emitEvent: false });
            }
          }
        }
      });
    }
  }

  private suscribirseACambios(): void {
    // Escuchar cambios profundos en el FormArray para recalcular
    this.detallesFormArray.valueChanges.pipe(
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

    this.totalesCalculados.subtotalBruto = subtotal;
    this.totalesCalculados.totalDescuentos = descuentos;
  }

  calcularTotalNeto(): number {
    const transporte = this.ordenForm.get('costoTransporte')?.value || 0;
    const impuestos = this.ordenForm.get('impuestos')?.value || 0;
    
    return this.totalesCalculados.subtotalBruto 
         - this.totalesCalculados.totalDescuentos 
         + transporte 
         + impuestos;
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
      costoTransporte: formValue.costoTransporte,
      impuestos: formValue.impuestos,
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
