import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { ProductoService, ProductoDTO } from '../../../core/services/producto.service';
import { ProveedorService } from '../../../core/services/proveedor.service';
import { ProductoFormModalComponent } from './producto-form-modal/producto-form-modal.component';

@Component({
  selector: 'app-producto-list',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, ProductoFormModalComponent],
  templateUrl: './producto-list.component.html',
  styleUrl: './producto-list.component.css'
})
export class ProductoListComponent implements OnInit {
  private productoService = inject(ProductoService);
  private proveedorService = inject(ProveedorService);
  private toast = inject(ToastService);

  proveedores: any[] = [];
  proveedoresFiltrados: any[] = [];
  idProveedorSeleccionado: number | null = null;
  mostrarDropdownProveedor = false;
  textoBusquedaProveedor = '';
  nombreProveedorSeleccionado = '';

  productosTotales: ProductoDTO[] = [];
  productosDelProveedor = signal<ProductoDTO[]>([]);
  productosFiltradosVista = signal<ProductoDTO[]>([]);
  
  textoBusqueda = '';
  cargando = signal(true);

  mostrarModal = false;
  productoEnEdicion: ProductoDTO | null = null;

  ngOnInit(): void {
    this.cargarProveedoresYProductos();
  }

  cargarProveedoresYProductos() {
    this.cargando.set(true);
    // Cargar proveedores
    this.proveedorService.listarTodos().subscribe({
      next: (data) => {
        this.proveedores = data;
        this.proveedoresFiltrados = [...this.proveedores];
      }
    });

    // Cargar catálogo global en memoria (para sacar los detalles completos)
    this.productoService.listarTodos().subscribe({
      next: (data) => {
        this.productosTotales = data;
        this.cargando.set(false);
      },
      error: () => {
        this.toast.error('Error', 'No se pudieron cargar los productos del catálogo');
        this.cargando.set(false);
      }
    });
  }

  onFocusProveedor() {
    if (this.textoBusquedaProveedor.length > 0) {
      this.mostrarDropdownProveedor = true;
      this.proveedoresFiltrados = [...this.proveedores];
    }
  }

  filtrarProveedoresList(event: Event) {
    const texto = (event.target as HTMLInputElement).value.toLowerCase();
    this.textoBusquedaProveedor = (event.target as HTMLInputElement).value;
    if (!texto) {
      this.mostrarDropdownProveedor = false;
      this.proveedoresFiltrados = [];
      this.idProveedorSeleccionado = null;
      this.nombreProveedorSeleccionado = '';
      this.productosDelProveedor.set([]);
      this.productosFiltradosVista.set([]);
    } else {
      this.mostrarDropdownProveedor = true;
      this.proveedoresFiltrados = this.proveedores.filter(p => 
        (p.nombre || p.nombreRepresentante).toLowerCase().includes(texto) ||
        (p.ruc && p.ruc.includes(texto))
      );
    }
  }

  seleccionarProveedor(prov: any) {
    this.idProveedorSeleccionado = prov.idProveedor;
    this.nombreProveedorSeleccionado = prov.nombre || prov.nombreRepresentante;
    this.textoBusquedaProveedor = this.nombreProveedorSeleccionado;
    this.mostrarDropdownProveedor = false;
    
    this.cargarProductosDeProveedor(prov.idProveedor);
  }

  onBlurProveedor() {
    setTimeout(() => {
      this.mostrarDropdownProveedor = false;
      if (!this.idProveedorSeleccionado) {
        this.textoBusquedaProveedor = '';
      } else {
        this.textoBusquedaProveedor = this.nombreProveedorSeleccionado;
      }
    }, 200);
  }

  cargarProductosDeProveedor(idProveedor: number) {
    this.cargando.set(true);
    this.proveedorService.listarProductos(idProveedor).subscribe({
      next: (asociados: any[]) => {
        // Filtrar productosTotales que estén en asociados
        const idsAsociados = asociados.map(a => a.idProducto);
        const filtrados = this.productosTotales.filter(p => idsAsociados.includes(p.idProducto));
        this.productosDelProveedor.set(filtrados);
        this.filtrarProductosInput();
        this.cargando.set(false);
      },
      error: () => {
        this.toast.error('Error', 'No se pudieron cargar los productos asociados');
        this.cargando.set(false);
      }
    });
  }

  filtrarProductosInput() {
    const texto = this.textoBusqueda.toLowerCase();
    if (!texto) {
      this.productosFiltradosVista.set(this.productosDelProveedor());
      return;
    }

    const filtrados = this.productosDelProveedor().filter(p => 
      p.nombre.toLowerCase().includes(texto) ||
      p.categoria?.nombre.toLowerCase().includes(texto) ||
      p.formulacion?.sigla.toLowerCase().includes(texto)
    );
    this.productosFiltradosVista.set(filtrados);
  }

  abrirModalNuevo() {
    if (!this.idProveedorSeleccionado) return;
    this.productoEnEdicion = null;
    this.mostrarModal = true;
  }

  abrirModalEdicion(producto: ProductoDTO) {
    this.productoEnEdicion = producto;
    this.mostrarModal = true;
  }

  cerrarModal(recargar: boolean) {
    this.mostrarModal = false;
    this.productoEnEdicion = null;
    if (recargar) {
      // Recargar catálogo global y luego los del proveedor
      this.cargando.set(true);
      this.productoService.listarTodos().subscribe(data => {
        this.productosTotales = data;
        if (this.idProveedorSeleccionado) {
          this.cargarProductosDeProveedor(this.idProveedorSeleccionado);
        }
      });
    }
  }

  desasociarProducto(producto: ProductoDTO) {
    if (!this.idProveedorSeleccionado) return;
    if (confirm(`¿Estás seguro de eliminar/desvincular el producto "${producto.nombre}" de este proveedor?`)) {
      this.proveedorService.desasociarProducto(this.idProveedorSeleccionado, producto.idProducto).subscribe({
        next: () => {
          this.toast.success('Éxito', 'Producto eliminado del proveedor correctamente');
          this.cargarProductosDeProveedor(this.idProveedorSeleccionado!);
        },
        error: () => this.toast.error('Error', 'No se pudo eliminar el producto del proveedor')
      });
    }
  }
}
