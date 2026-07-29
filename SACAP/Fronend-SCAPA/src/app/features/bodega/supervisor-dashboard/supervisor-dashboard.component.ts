import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  InventarioService,
  MiBodegaDTO, CategoriaDTO, ProductoDTO, ProveedorDTO,
  LoteDTO, LoteSupervisorRequest
} from '../../../core/services/inventario.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-supervisor-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './supervisor-dashboard.component.html',
  styleUrl:    './supervisor-dashboard.component.css'
})
export class SupervisorDashboardComponent implements OnInit {

  private inventario = inject(InventarioService);
  private auth       = inject(AuthService);

  // Datos base
  bodegas    = signal<MiBodegaDTO[]>([]);
  categorias = signal<CategoriaDTO[]>([]);
  productos  = signal<ProductoDTO[]>([]);
  proveedores = signal<ProveedorDTO[]>([]);

  cargandoBodegas = signal(true);
  cargandoLotes   = signal(false);

  bodegaSeleccionada = signal<MiBodegaDTO | null>(null);
  lotes = signal<LoteDTO[]>([]);
  filtroCategoria = signal<number | null>(null);

  // Modal "+ Nuevo Lote"
  modalAbierto = signal(false);
  guardando    = signal(false);
  errorModal   = signal('');

  form: {
    numeroLote: string; idCategoria: number | null; idProducto: number | null;
    idProveedor: number | null; fechaFabricacion: string; fechaVencimiento: string; cantidad: number | null;
  } = this.formVacio();

  get nombreUsuario() {
    const u = this.auth.currentUser();
    return (u as any)?.nombre || (u as any)?.correo || 'Supervisor';
  }

  get horaDelDia() {
    const h = new Date().getHours();
    if (h < 12) return 'Buenos días';
    if (h < 19) return 'Buenas tardes';
    return 'Buenas noches';
  }

  // ── KPIs de la bodega seleccionada ──────────────────────
  get totalLotes()   { return this.lotes().length; }
  get lotesActivos() { return this.lotes().filter(l => Number(l.idEstadoLote) === 1).length; }
  get proximosVencer() {
    return this.lotes().filter(l => (l.diasHastaVencimiento ?? 999) <= 30 && (l.diasHastaVencimiento ?? 999) >= 0).length;
  }
  get capacidadUsadaPct() {
    const bodega = this.bodegaSeleccionada();
    if (!bodega || !bodega.capacidadTotal) return 0;
    const usada = this.lotes().reduce((sum, l) => sum + (l.cantidadActual ?? 0), 0);
    return Math.min(100, Math.round((usada / bodega.capacidadTotal) * 100));
  }

  productosFiltrados = computed(() => {
    const idCat = this.form.idCategoria;
    const prods = this.productos();
    return idCat ? prods.filter(p => p.categoria?.idCategoria === idCat) : prods;
  });

  ngOnInit() {
    this.inventario.getMisBodegas().subscribe({
      next: data => {
        this.bodegas.set(data || []);
        this.cargandoBodegas.set(false);
        if (data && data.length > 0) this.seleccionarBodega(data[0]);
      },
      error: () => this.cargandoBodegas.set(false)
    });

    this.inventario.getCategorias().subscribe({ next: data => this.categorias.set(data || []) });
    this.inventario.getProductos().subscribe({ next: data => this.productos.set(data || []) });
    this.inventario.getProveedores().subscribe({ next: data => this.proveedores.set(data || []) });
  }

  seleccionarBodega(bodega: MiBodegaDTO) {
    this.bodegaSeleccionada.set(bodega);
    this.filtroCategoria.set(null);
    this.cargarLotes();
  }

  filtrarPorCategoria(idCategoria: number | null) {
    this.filtroCategoria.set(idCategoria);
    this.cargarLotes();
  }

  cargarLotes() {
    const bodega = this.bodegaSeleccionada();
    if (!bodega) return;
    this.cargandoLotes.set(true);
    const idCat = this.filtroCategoria() ?? undefined;
    this.inventario.getMisLotes(bodega.idAlmacen, idCat).subscribe({
      next: data => { this.lotes.set(data || []); this.cargandoLotes.set(false); },
      error: () => { this.lotes.set([]); this.cargandoLotes.set(false); }
    });
  }

  // ── Modal Nuevo Lote ─────────────────────────────────────
  abrirModal() {
    this.form = this.formVacio();
    this.errorModal.set('');
    this.modalAbierto.set(true);
  }

  cerrarModal() {
    this.modalAbierto.set(false);
  }

  guardarLote() {
    const bodega = this.bodegaSeleccionada();
    this.errorModal.set('');

    if (!bodega) { this.errorModal.set('Seleccione una bodega primero.'); return; }
    if (!this.form.numeroLote?.trim()) { this.errorModal.set('Ingrese el número de lote.'); return; }
    if (!this.form.idProducto) { this.errorModal.set('Seleccione un producto.'); return; }
    if (!this.form.idProveedor) { this.errorModal.set('Seleccione un proveedor.'); return; }
    if (!this.form.fechaFabricacion) { this.errorModal.set('Seleccione la fecha de fabricación.'); return; }
    if (!this.form.fechaVencimiento) { this.errorModal.set('Seleccione la fecha de vencimiento.'); return; }
    if (!this.form.cantidad || this.form.cantidad < 1) { this.errorModal.set('Ingrese una cantidad válida.'); return; }

    const payload: LoteSupervisorRequest = {
      numeroLote:       this.form.numeroLote.trim().toUpperCase(),
      idProducto:       this.form.idProducto,
      idProveedor:      this.form.idProveedor,
      idAlmacen:        bodega.idAlmacen,
      fechaFabricacion: this.form.fechaFabricacion,
      fechaVencimiento: this.form.fechaVencimiento,
      cantidad:         this.form.cantidad
    };

    this.guardando.set(true);
    this.inventario.crearLoteSupervisor(payload).subscribe({
      next: () => {
        this.guardando.set(false);
        this.modalAbierto.set(false);
        this.cargarLotes();
      },
      error: e => {
        this.guardando.set(false);
        this.errorModal.set(e?.error?.message || 'Error al crear el lote. Intente nuevamente.');
      }
    });
  }

  private formVacio() {
    return {
      numeroLote: '', idCategoria: null, idProducto: null,
      idProveedor: null, fechaFabricacion: '', fechaVencimiento: '', cantidad: null
    };
  }

  // ── Presentación ─────────────────────────────────────────
  getEstadoBadge(estado: number): string {
    return Number(estado) === 1 ? 'activo' : 'revision';
  }

  getEstadoLabel(estado: number): string {
    return Number(estado) === 1 ? 'ACTIVO' : 'PENDIENTE DE UBICACIÓN';
  }

  getVencimientoClass(dias: number | undefined): string {
    if (dias === undefined) return '';
    if (dias <= 7)  return 'crítico';
    if (dias <= 30) return 'advertencia';
    return 'normal';
  }
}
