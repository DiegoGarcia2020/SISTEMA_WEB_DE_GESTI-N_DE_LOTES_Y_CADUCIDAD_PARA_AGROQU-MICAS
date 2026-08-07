import { Component, EventEmitter, Input, OnInit, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { ProveedorService, ProveedorRequest, ProveedorProductoDTO } from '../../../../core/services/proveedor.service';
import { ToastService } from '../../../../shared/components/toast/toast.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-proveedor-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  templateUrl: './proveedor-form.component.html',
  styleUrls: ['./proveedor-form.component.css']
})
export class ProveedorFormComponent implements OnInit {
  @Input() proveedorId: number | null = null;
  @Output() close = new EventEmitter<boolean>();

  private fb = inject(FormBuilder);
  private proveedorService = inject(ProveedorService);
  private toast = inject(ToastService);
  private http = inject(HttpClient);

  form!: FormGroup;
  asociarForm!: FormGroup;
  isLoading = signal<boolean>(false);
  
  empresas = signal<any[]>([]);
  ciudades = signal<any[]>([]);
  productosMaestros = signal<any[]>([]);
  productosAsociados = signal<ProveedorProductoDTO[]>([]);
  
  ngOnInit() {
    this.initForm();
    this.cargarCatalogos();
    
    if (this.proveedorId) {
      this.cargarProveedor();
      this.cargarProductosAsociados();
    }
  }

  private initForm() {
    this.form = this.fb.group({
      ruc: ['', [Validators.required, Validators.pattern('^[0-9]{13}$')]],
      nombreRepresentante: ['', Validators.required],
      direccion: ['', Validators.required],
      telefonoEmpresa: [''],
      correoContacto: ['', [Validators.email]],
      idEmpresa: [null, Validators.required],
      idCiudad: [null, Validators.required],
      idEstado: [1, Validators.required]
    });

    this.asociarForm = this.fb.group({
      idProducto: [null, Validators.required],
      precioReferencial: [0, [Validators.min(0)]],
      codigoProductoProveedor: ['']
    });
  }

  cargarCatalogos() {
    // Mock endpoints for now, assuming these exist or will be created
    this.http.get<any[]>(`${environment.apiUrl}/api/catalogos/empresas`).subscribe({
      next: (res) => this.empresas.set(res),
      error: () => this.empresas.set([{ idEmpresa: 1, nombre: 'Empresa Matriz' }]) // Mock fallback
    });
    
    this.http.get<any[]>(`${environment.apiUrl}/api/catalogos/ciudades`).subscribe({
      next: (res) => this.ciudades.set(res),
      error: () => this.ciudades.set([{ idCiudad: 1, nombre: 'Quevedo' }]) // Mock fallback
    });

    this.http.get<any[]>(`${environment.apiUrl}/api/productos`).subscribe({
      next: (res) => this.productosMaestros.set(res),
      error: () => this.productosMaestros.set([
        { idProducto: 1, nombre: 'Urea 46%' },
        { idProducto: 2, nombre: 'Glifosato' }
      ])
    });
  }

  cargarProveedor() {
    this.isLoading.set(true);
    this.proveedorService.obtenerPorId(this.proveedorId!).subscribe({
      next: (data) => {
        this.form.patchValue({
          ruc: data.ruc,
          nombreRepresentante: data.nombreRepresentante,
          direccion: data.direccion,
          telefonoEmpresa: data.telefonoEmpresa,
          correoContacto: data.correoContacto,
          idEmpresa: data.empresa?.idEmpresa,
          idCiudad: data.ciudad?.idCiudad,
          idEstado: data.idEstado
        });
        this.isLoading.set(false);
      },
      error: () => {
        this.toast.error('Error', 'No se pudo cargar el proveedor');
        this.isLoading.set(false);
        this.cerrar();
      }
    });
  }
  
  cargarProductosAsociados() {
    if (!this.proveedorId) return;
    this.proveedorService.listarProductos(this.proveedorId).subscribe({
      next: (res: any) => this.productosAsociados.set(res)
    });
  }

  guardar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    const data: ProveedorRequest = this.form.value;

    const request$ = this.proveedorId 
      ? this.proveedorService.actualizarProveedor(this.proveedorId, data)
      : this.proveedorService.crearProveedor(data);

    request$.subscribe({
      next: () => {
        this.toast.success('Éxito', 'Proveedor guardado correctamente');
        this.isLoading.set(false);
        this.close.emit(true);
      },
      error: (err: any) => {
        this.toast.error('Error', err.error?.message || 'Error al guardar');
        this.isLoading.set(false);
      }
    });
  }

  asociarProducto() {
    if (this.asociarForm.invalid || !this.proveedorId) return;
    
    const data: ProveedorProductoDTO = {
      idProveedor: this.proveedorId,
      ...this.asociarForm.value
    };

    this.proveedorService.asociarProducto(this.proveedorId, data).subscribe({
      next: () => {
        this.toast.success('Éxito', 'Producto asociado');
        this.cargarProductosAsociados();
        this.asociarForm.reset({ precioReferencial: 0 });
      },
      error: (err: any) => this.toast.error('Error', err.error?.message || 'Error al asociar')
    });
  }

  desasociarProducto(idProducto: number) {
    if (!this.proveedorId) return;
    if (confirm('¿Desasociar este producto?')) {
      this.proveedorService.desasociarProducto(this.proveedorId, idProducto).subscribe({
        next: () => {
          this.toast.success('Éxito', 'Producto desasociado');
          this.cargarProductosAsociados();
        },
        error: () => this.toast.error('Error', 'No se pudo desasociar')
      });
    }
  }

  cerrar() {
    this.close.emit(false);
  }
}
