import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { ProveedorService, Proveedor } from '../../../core/services/proveedor.service';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { ProveedorFormComponent } from './proveedor-form/proveedor-form.component';

@Component({
  selector: 'app-proveedor-list',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, ProveedorFormComponent],
  templateUrl: './proveedor-list.component.html',
  styleUrls: ['./proveedor-list.component.css']
})
export class ProveedorListComponent implements OnInit {
  private proveedorService = inject(ProveedorService);
  private toast = inject(ToastService);
  private router = inject(Router);

  proveedores = signal<Proveedor[]>([]);
  isLoading = signal<boolean>(false);

  // Form Modal state
  isFormOpen = signal<boolean>(false);
  selectedProveedorId = signal<number | null>(null);

  ngOnInit() {
    this.cargarProveedores();
  }

  cargarProveedores() {
    this.isLoading.set(true);
    this.proveedorService.listarProveedores().subscribe({
      next: (data: Proveedor[]) => {
        this.proveedores.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.toast.error('Error', 'No se pudieron cargar los proveedores');
        this.isLoading.set(false);
      }
    });
  }

  abrirFormulario(id: number | null = null) {
    this.selectedProveedorId.set(id);
    this.isFormOpen.set(true);
  }

  cerrarFormulario(actualizar: boolean = false) {
    this.isFormOpen.set(false);
    this.selectedProveedorId.set(null);
    if (actualizar) {
      this.cargarProveedores();
    }
  }

  desactivarProveedor(id: number) {
    if (confirm('¿Está seguro de eliminar o desactivar este proveedor?')) {
      this.proveedorService.eliminarProveedor(id).subscribe({
        next: () => {
          this.toast.success('Éxito', 'Proveedor eliminado');
          this.cargarProveedores();
        },
        error: () => this.toast.error('Error', 'No se pudo eliminar el proveedor')
      });
    }
  }
}
