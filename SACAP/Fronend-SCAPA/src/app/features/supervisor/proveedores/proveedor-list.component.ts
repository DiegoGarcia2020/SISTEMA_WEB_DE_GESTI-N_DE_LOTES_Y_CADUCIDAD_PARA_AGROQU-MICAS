import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { ProveedorService, Proveedor } from '../../../core/services/proveedor.service';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { ProveedorFormComponent } from './proveedor-form/proveedor-form.component';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-proveedor-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule, ProveedorFormComponent],
  templateUrl: './proveedor-list.component.html',
  styleUrls: ['./proveedor-list.component.css']
})
export class ProveedorListComponent implements OnInit, OnDestroy {
  private proveedorService = inject(ProveedorService);
  private toast = inject(ToastService);
  private router = inject(Router);

  proveedores = signal<Proveedor[]>([]);
  isLoading = signal<boolean>(false);

  // Form Modal state
  isFormOpen = signal<boolean>(false);
  selectedProveedorId = signal<number | null>(null);

  // Pagination state
  pagina = signal<number>(0);
  tamanoPagina = signal<number>(25);
  totalPaginas = signal<number>(0);
  totalElementos = signal<number>(0);
  textoBusqueda = new FormControl('');
  private destroy$ = new Subject<void>();

  ngOnInit() {
    this.textoBusqueda.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.pagina.set(0);
      this.cargarProveedores();
    });

    this.cargarProveedores();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  cargarProveedores() {
    this.isLoading.set(true);
    const term = this.textoBusqueda.value?.trim() || '';
    this.proveedorService.listarProveedores(this.pagina(), this.tamanoPagina(), term).subscribe({
      next: (response: any) => {
        if (response && response.content) {
          this.proveedores.set(response.content);
          this.totalElementos.set(response.totalElements);
          this.totalPaginas.set(response.totalPages);
        } else if (Array.isArray(response)) {
          this.proveedores.set(response);
          this.totalElementos.set(response.length);
          this.totalPaginas.set(1);
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.toast.error('Error', 'No se pudieron cargar los proveedores');
        this.isLoading.set(false);
      }
    });
  }

  cambiarPagina(nuevaPagina: number) {
    if (nuevaPagina >= 0 && nuevaPagina < this.totalPaginas()) {
      this.pagina.set(nuevaPagina);
      this.cargarProveedores();
    }
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
