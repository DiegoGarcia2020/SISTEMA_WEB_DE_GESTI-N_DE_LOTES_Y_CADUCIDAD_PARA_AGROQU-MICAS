import { Component, EventEmitter, Input, OnInit, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { ProductoService, ProductoDTO } from '../../../../core/services/producto.service';
import { ProveedorService } from '../../../../core/services/proveedor.service';
import { ToastService } from '../../../../shared/components/toast/toast.service';
import { SistemaService } from '../../../../core/services/sistema.service';

@Component({
  selector: 'app-producto-form-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  templateUrl: './producto-form-modal.component.html',
  styleUrl: './producto-form-modal.component.css'
})
export class ProductoFormModalComponent implements OnInit {
  @Input() producto: ProductoDTO | null = null;
  @Input() idProveedor: number | null = null;
  @Output() close = new EventEmitter<boolean>();

  private fb = inject(FormBuilder);
  private productoService = inject(ProductoService);
  private proveedorService = inject(ProveedorService);
  private toast = inject(ToastService);
  private http = inject(HttpClient);

  form!: FormGroup;
  isEditing = false;
  guardando = false;

  private sistemaService = inject(SistemaService);

  // Catálogos
  categorias = signal<any[]>([]);
  formulaciones = signal<any[]>([]);
  toxicidades = signal<any[]>([]);
  estados = signal<any[]>([]);
  ivaGlobal = signal<number>(15);

  ngOnInit(): void {
    this.isEditing = !!this.producto;
    
    this.form = this.fb.group({
      nombre: [this.producto?.nombre || '', Validators.required],
      descripcion: [this.producto?.descripcion || ''],
      unidadMedida: [this.producto?.unidadMedida || 'UND-LIT', Validators.required],
      precio: [this.producto?.precio || 0, [Validators.required, Validators.min(0.01)]],
      idEstado: [this.producto?.idEstado || 1, Validators.required],
      idCategoria: [this.producto?.categoria?.idCategoria || null, Validators.required],
      idFormulacion: [this.producto?.formulacion?.idFormulacion || null],
      idToxicidad: [this.producto?.toxicidad?.idToxicidad || null],
      ingredienteActivo: [this.producto?.ingredienteActivo || ''],
      periodoCarenciaDias: [this.producto?.periodoCarenciaDias || 0, [Validators.min(0)]],
      aplicaIva: [this.producto?.aplicaIva ?? false],
      porcentajeIva: [this.producto?.porcentajeIva ?? 0, [Validators.min(0)]]
    });

    this.cargarCatalogos();
  }

  cargarCatalogos() {
    this.http.get<any[]>(`${environment.apiUrl}/catalogos/categorias`).subscribe(res => this.categorias.set(res));
    this.http.get<any[]>(`${environment.apiUrl}/catalogos/formulaciones`).subscribe(res => this.formulaciones.set(res));
    this.http.get<any[]>(`${environment.apiUrl}/catalogos/toxicidades`).subscribe(res => this.toxicidades.set(res));
    
    // Podría haber un catálogo de estados, pero comúnmente 1=Activo, 2=Inactivo
    this.estados.set([
      { idEstado: 1, nombre: 'Activo' },
      { idEstado: 2, nombre: 'Inactivo' }
    ]);

    // Cargar IVA global del sistema
    this.http.get<any>(`${environment.apiUrl}/configuracion/iva-global`).subscribe({
      next: (res) => {
        const iva = res?.porcentajeIvaGlobal ?? 15;
        this.ivaGlobal.set(iva);
        // Si es producto nuevo y no tiene porcentaje, poner el global
        if (!this.isEditing && this.form.get('aplicaIva')?.value && !this.form.get('porcentajeIva')?.value) {
          this.form.patchValue({ porcentajeIva: iva });
        }
      }
    });
  }

  onToggleIva() {
    const aplica = this.form.get('aplicaIva')?.value;
    if (aplica) {
      // Al activar IVA, autocompletar con el porcentaje global
      this.form.patchValue({ porcentajeIva: this.ivaGlobal() });
    } else {
      // Al desactivar, poner en 0
      this.form.patchValue({ porcentajeIva: 0 });
    }
  }

  validarMaxIva() {
    const valor = this.form.get('porcentajeIva')?.value || 0;
    if (valor > this.ivaGlobal()) {
      this.form.patchValue({ porcentajeIva: this.ivaGlobal() });
      this.toast.warning('Límite de IVA', `El porcentaje no puede superar el IVA global del sistema (${this.ivaGlobal()}%).`);
    }
  }

  guardar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.guardando = true;
    const formValue = this.form.value;
    // Mapear al DTO del backend (precioSugerido en vez de precio)
    const datos: any = {
      ...formValue,
      precioSugerido: formValue.precio,
      aplicaIva: formValue.aplicaIva ?? false,
      porcentajeIva: formValue.aplicaIva ? (formValue.porcentajeIva || 0) : 0
    };

    if (this.isEditing && this.producto) {
      this.productoService.actualizarProducto(this.producto.idProducto, datos).subscribe({
        next: () => {
          this.toast.success('Éxito', 'Producto actualizado correctamente');
          this.guardando = false;
          this.close.emit(true);
        },
        error: () => {
          this.toast.error('Error', 'No se pudo actualizar el producto');
          this.guardando = false;
        }
      });
    } else {
      this.productoService.crearProducto(datos).subscribe({
        next: (res) => {
          if (this.idProveedor) {
            // Asociar al proveedor
            this.proveedorService.asociarProducto(this.idProveedor, {
              idProveedor: this.idProveedor,
              idProducto: res.idProducto,
              precioReferencial: 0,
              codigoProductoProveedor: ''
            }).subscribe({
              next: () => {
                this.toast.success('Éxito', 'Producto creado y asociado al proveedor');
                this.guardando = false;
                this.close.emit(true);
              },
              error: () => {
                this.toast.warning('Atención', 'El producto se creó pero no se pudo asociar automáticamente al proveedor.');
                this.guardando = false;
                this.close.emit(true);
              }
            });
          } else {
            this.toast.success('Éxito', 'Producto creado correctamente');
            this.guardando = false;
            this.close.emit(true);
          }
        },
        error: () => {
          this.toast.error('Error', 'No se pudo crear el producto');
          this.guardando = false;
        }
      });
    }
  }

  cerrar() {
    this.close.emit(false);
  }
}
