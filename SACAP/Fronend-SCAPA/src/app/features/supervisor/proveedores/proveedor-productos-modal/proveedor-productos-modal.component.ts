import { Component, EventEmitter, Input, OnInit, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { ProveedorService, ProveedorProductoDTO } from '../../../../core/services/proveedor.service';
import { ToastService } from '../../../../shared/components/toast/toast.service';

@Component({
  selector: 'app-proveedor-productos-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  templateUrl: './proveedor-productos-modal.component.html',
  styleUrls: ['./proveedor-productos-modal.component.css']
})
export class ProveedorProductosModalComponent implements OnInit {
  @Input({ required: true }) idProveedor!: number;
  @Input() nombreProveedor: string = '';
  @Output() close = new EventEmitter<boolean>();

  private fb = inject(FormBuilder);
  private proveedorService = inject(ProveedorService);
  private toast = inject(ToastService);
  private http = inject(HttpClient);

  asociarForm!: FormGroup;

  productosMaestros = signal<any[]>([]);
  productosFiltrados = signal<any[]>([]);
  productosAsociados = signal<ProveedorProductoDTO[]>([]);
  
  huboCambios = false;
  mostrarDropdownProducto = false;
  textoBusquedaProducto = '';

  idEdicionActiva: number | null = null;
  formEdicion!: FormGroup;

  ngOnInit() {
    this.asociarForm = this.fb.group({
      idProducto: [null, Validators.required],
      precioReferencial: [0, [Validators.min(0)]],
      codigoProductoProveedor: ['']
    });


    this.formEdicion = this.fb.group({
      precioReferencial: [0, [Validators.min(0)]],
      codigoProductoProveedor: ['']
    });

    this.cargarProductosMaestros();
    this.cargarProductosAsociados();
  }

  cargarProductosMaestros() {
    this.http.get<any[]>(`${environment.apiUrl}/productos`).subscribe({
      next: (res) => {
        this.productosMaestros.set(res);
        this.productosFiltrados.set(res);
      },
      error: () => {
        const fallbacks = [
          { idProducto: 1, nombre: 'Urea 46%' },
          { idProducto: 2, nombre: 'Glifosato' }
        ];
        this.productosMaestros.set(fallbacks);
        this.productosFiltrados.set(fallbacks);
      }
    });
  }

  cargarProductosAsociados() {
    this.proveedorService.listarProductos(this.idProveedor).subscribe({
      next: (res: any) => this.productosAsociados.set(res)
    });
  }

  onFocusProducto() {
    if (this.textoBusquedaProducto.length > 0) {
      this.mostrarDropdownProducto = true;
    }
  }

  filtrarProductos(event: Event) {
    const texto = (event.target as HTMLInputElement).value.toLowerCase();
    this.textoBusquedaProducto = texto;
    if (!texto) {
      this.mostrarDropdownProducto = false;
      this.productosFiltrados.set([]);
    } else {
      this.mostrarDropdownProducto = true;
      const filtrados = this.productosMaestros().filter(p => p.nombre.toLowerCase().includes(texto));
      this.productosFiltrados.set(filtrados);
    }
  }

  seleccionarProducto(prod: any) {
    this.asociarForm.patchValue({ idProducto: prod.idProducto });
    this.textoBusquedaProducto = prod.nombre;
    this.mostrarDropdownProducto = false;
  }

  onBlurProducto() {
    setTimeout(() => {
      this.mostrarDropdownProducto = false;
      const id = this.asociarForm.get('idProducto')?.value;
      if (!id) {
        this.textoBusquedaProducto = '';
      } else {
        const prod = this.productosMaestros().find(p => p.idProducto === id);
        this.textoBusquedaProducto = prod ? prod.nombre : '';
      }
    }, 200);
  }

  asociarProducto() {
    if (this.asociarForm.invalid) return;
    
    const data: ProveedorProductoDTO = {
      idProveedor: this.idProveedor,
      ...this.asociarForm.value
    };

    this.proveedorService.asociarProducto(this.idProveedor, data).subscribe({
      next: () => {
        this.toast.success('Éxito', 'Producto asociado/actualizado');
        this.huboCambios = true;
        this.cargarProductosAsociados();
        this.asociarForm.reset({ precioReferencial: 0 });
        this.textoBusquedaProducto = '';
      },
      error: (err: any) => this.toast.error('Error', err.error?.message || 'Error al asociar')
    });
  }

  desasociarProducto(idProducto: number) {
    if (confirm('¿Desasociar este producto?')) {
      this.proveedorService.desasociarProducto(this.idProveedor, idProducto).subscribe({
        next: () => {
          this.toast.success('Éxito', 'Producto desasociado');
          this.huboCambios = true;
          this.cargarProductosAsociados();
        },
        error: () => this.toast.error('Error', 'No se pudo desasociar')
      });
    }
  }

  iniciarEdicion(pp: ProveedorProductoDTO) {
    this.idEdicionActiva = pp.idProducto!;
    this.formEdicion.patchValue({
      precioReferencial: pp.precioReferencial,
      codigoProductoProveedor: pp.codigoProductoProveedor
    });
  }

  guardarEdicion(idProducto: number) {
    if (this.formEdicion.invalid) return;

    const data: ProveedorProductoDTO = {
      idProveedor: this.idProveedor,
      idProducto: idProducto,
      ...this.formEdicion.value
    };

    this.proveedorService.asociarProducto(this.idProveedor, data).subscribe({
      next: () => {
        this.toast.success('Éxito', 'Producto actualizado');
        this.idEdicionActiva = null;
        this.huboCambios = true;
        this.cargarProductosAsociados();
      },
      error: (err: any) => this.toast.error('Error', err.error?.message || 'Error al actualizar')
    });
  }

  cancelarEdicion() {
    this.idEdicionActiva = null;
  }

  cerrar() {
    this.close.emit(this.huboCambios);
  }
}
