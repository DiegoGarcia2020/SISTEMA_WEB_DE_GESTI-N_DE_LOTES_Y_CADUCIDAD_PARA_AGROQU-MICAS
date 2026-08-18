import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { ProductoService } from '../../../core/services/producto.service';
import { InventarioService } from '../../../core/services/inventario.service';
import { SectionHeaderComponent } from '../../../shared/components/section-header/section-header.component';
import { ToastService } from '../../../shared/components/toast/toast.service';

@Component({
  selector: 'app-localizar-producto',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, SectionHeaderComponent],
  templateUrl: './localizar-producto.component.html',
  styleUrls: ['./localizar-producto.component.css']
})
export class LocalizarProductoComponent implements OnInit {
  private productoService = inject(ProductoService);
  private inventarioService = inject(InventarioService);
  private toast = inject(ToastService);

  productos = signal<any[]>([]);
  busqueda = signal('');
  isDropdownOpen = signal(false);
  
  productosFiltrados = computed(() => {
    const term = this.busqueda().toLowerCase();
    if (!term) return [];
    return this.productos().filter(p => 
      p.nombre.toLowerCase().includes(term) || 
      (p.categoria?.nombre && p.categoria.nombre.toLowerCase().includes(term))
    ).slice(0, 10);
  });

  productoSeleccionado = signal<any | null>(null);
  ubicaciones = signal<any[]>([]);
  isLoading = signal(false);

  // Totales
  totalUnidades = computed(() => this.ubicaciones().reduce((acc, u) => acc + (u.cantidadActual || 0), 0));
  totalLotes = computed(() => this.ubicaciones().length);

  ngOnInit() {
    this.productoService.listarTodos().subscribe({
      next: (res) => this.productos.set(res),
      error: () => this.toast.error('Error', 'No se pudieron cargar los productos')
    });
  }

  onSearchChange(term: string) {
    this.busqueda.set(term);
    this.isDropdownOpen.set(term.length > 0);
    if (this.productoSeleccionado() && this.productoSeleccionado().nombre !== term) {
      this.productoSeleccionado.set(null);
      this.ubicaciones.set([]);
    }
  }

  seleccionarProducto(prod: any) {
    this.productoSeleccionado.set(prod);
    this.busqueda.set(prod.nombre);
    this.isDropdownOpen.set(false);
    this.buscarUbicaciones(prod.idProducto);
  }

  buscarUbicaciones(idProducto: number) {
    this.isLoading.set(true);
    this.ubicaciones.set([]);
    this.inventarioService.getUbicacionesPorProducto(idProducto).subscribe({
      next: (res) => {
        this.ubicaciones.set(res);
        this.isLoading.set(false);
      },
      error: () => {
        this.toast.error('Error', 'No se pudieron cargar las ubicaciones');
        this.isLoading.set(false);
      }
    });
  }

  limpiarSeleccion() {
    this.productoSeleccionado.set(null);
    this.busqueda.set('');
    this.ubicaciones.set([]);
    this.isDropdownOpen.set(false);
  }
}
