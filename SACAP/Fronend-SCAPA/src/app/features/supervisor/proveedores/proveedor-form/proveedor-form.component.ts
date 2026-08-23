import { Component, EventEmitter, Input, OnInit, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { ProveedorService, ProveedorRequest, ProveedorProductoDTO } from '../../../../core/services/proveedor.service';
import { ToastService } from '../../../../shared/components/toast/toast.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

import { ProveedorProductosModalComponent } from '../proveedor-productos-modal/proveedor-productos-modal.component';

@Component({
  selector: 'app-proveedor-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule, ProveedorProductosModalComponent],
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
  
  isModalProductosOpen = signal<boolean>(false);
  nombreProveedorActual = signal<string>('');
  
  ngOnInit() {
    this.initForm();
    this.cargarCatalogos();
    
    if (this.proveedorId) {
      this.cargarProveedor();
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
  }

  cargarCatalogos() {
    // Mock endpoints for now, assuming these exist or will be created
    this.http.get<any[]>(`${environment.apiUrl}/catalogos/empresas`).subscribe({
      next: (res) => this.empresas.set(res),
      error: () => this.toast.error('Error', 'No se pudieron cargar las empresas')
    });
    this.http.get<any[]>(`${environment.apiUrl}/catalogos/ciudades`).subscribe({
      next: (res) => this.ciudades.set(res),
      error: () => this.toast.error('Error', 'No se pudieron cargar las ciudades')
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
        this.nombreProveedorActual.set(data.nombreRepresentante); // Or empresa.nombre
        this.isLoading.set(false);
      },
      error: () => {
        this.toast.error('Error', 'No se pudo cargar el proveedor');
        this.isLoading.set(false);
        this.cerrar();
      }
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

  abrirModalProductos() {
    this.isModalProductosOpen.set(true);
  }

  cerrarModalProductos(huboCambios: boolean) {
    this.isModalProductosOpen.set(false);
  }

  cerrar() {
    this.close.emit(false);
  }
}
