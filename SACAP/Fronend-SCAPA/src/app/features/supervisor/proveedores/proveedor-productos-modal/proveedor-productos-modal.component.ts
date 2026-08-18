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
  productosAsociados = signal<ProveedorProductoDTO[]>([]);
  huboCambios = false;

  ngOnInit() {
    this.asociarForm = this.fb.group({
      idProducto: [null, Validators.required],
      precioReferencial: [0, [Validators.min(0)]],
      codigoProductoProveedor: ['']
    });

    this.cargarProductosMaestros();
    this.cargarProductosAsociados();
  }

  cargarProductosMaestros() {
    this.http.get<any[]>(`${environment.apiUrl}/productos`).subscribe({
      next: (res) => this.productosMaestros.set(res),
      error: () => this.productosMaestros.set([
        { idProducto: 1, nombre: 'Urea 46%' },
        { idProducto: 2, nombre: 'Glifosato' }
      ])
    });
  }

  cargarProductosAsociados() {
    this.proveedorService.listarProductos(this.idProveedor).subscribe({
      next: (res: any) => this.productosAsociados.set(res)
    });
  }

  asociarProducto() {
    if (this.asociarForm.invalid) return;
    
    const data: ProveedorProductoDTO = {
      idProveedor: this.idProveedor,
      ...this.asociarForm.value
    };

    this.proveedorService.asociarProducto(this.idProveedor, data).subscribe({
      next: () => {
        this.toast.success('Éxito', 'Producto asociado');
        this.huboCambios = true;
        this.cargarProductosAsociados();
        this.asociarForm.reset({ precioReferencial: 0 });
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

  cerrar() {
    this.close.emit(this.huboCambios);
  }
}
