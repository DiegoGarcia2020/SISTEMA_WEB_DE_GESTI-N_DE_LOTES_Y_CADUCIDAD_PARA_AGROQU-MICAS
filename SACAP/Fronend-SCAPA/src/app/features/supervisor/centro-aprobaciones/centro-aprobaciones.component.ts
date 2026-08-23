import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { OperacionesService } from '../../../core/services/operaciones.service';
import { ToastService } from '../../../shared/components/toast/toast.service';

@Component({
  selector: 'app-centro-aprobaciones',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './centro-aprobaciones.component.html',
  styleUrls: ['./centro-aprobaciones.component.css']
})
export class CentroAprobacionesComponent implements OnInit {
  private operacionesService = inject(OperacionesService);
  private toast = inject(ToastService);

  tabActiva = signal<number>(1);
  
  promosPendientes = signal<any[]>([]);
  despachosPendientes = signal<any[]>([]);
  devolucionesPendientes = signal<any[]>([]);

  // Paginación
  currentPage = signal<number>(1);
  itemsPerPage = 10;

  get paginatedPromos() {
    const startIndex = (this.currentPage() - 1) * this.itemsPerPage;
    return this.promosPendientes().slice(startIndex, startIndex + this.itemsPerPage);
  }

  get paginatedDespachos() {
    const startIndex = (this.currentPage() - 1) * this.itemsPerPage;
    return this.despachosPendientes().slice(startIndex, startIndex + this.itemsPerPage);
  }

  get paginatedDevoluciones() {
    const startIndex = (this.currentPage() - 1) * this.itemsPerPage;
    return this.devolucionesPendientes().slice(startIndex, startIndex + this.itemsPerPage);
  }

  nextPage() {
    this.currentPage.update(p => p + 1);
  }

  prevPage() {
    this.currentPage.update(p => Math.max(1, p - 1));
  }

  getTotalPages(type: string): number {
    let totalItems = 0;
    if (type === 'promos') totalItems = this.promosPendientes().length;
    else if (type === 'despachos') totalItems = this.despachosPendientes().length;
    else if (type === 'devoluciones') totalItems = this.devolucionesPendientes().length;
    return Math.max(1, Math.ceil(totalItems / this.itemsPerPage));
  }

  ngOnInit(): void {
    this.loadAll();
  }

  setTab(tabIndex: number) {
    this.tabActiva.set(tabIndex);
    this.currentPage.set(1);
  }

  loadAll(): void {
    this.operacionesService.listarPromociones().subscribe(res => {
      this.promosPendientes.set(res.content.filter(p => p.estado === 'SUGERIDA' || (p as any).idEstado === 2));
    });
    this.operacionesService.listarDespachosPendientes().subscribe(data => this.despachosPendientes.set(data));
    this.operacionesService.listarDevolucionesPendientes().subscribe(data => this.devolucionesPendientes.set(data));
  }

  aprobarPromo(promo: any): void {
    const id = promo.idPromocion;
    this.operacionesService.cambiarEstadoPromocion(id, 'APROBADA').subscribe({
      next: () => {
        this.toast.success('Combo IA Aprobado', 'El combo ha sido autorizado.');
        this.loadAll();
      },
      error: () => this.toast.error('Error', 'No se pudo aprobar la promoción.')
    });
  }

  rechazarPromo(promo: any): void {
    const id = promo.idPromocion;
    this.operacionesService.cambiarEstadoPromocion(id, 'RECHAZADA').subscribe({
      next: () => {
        this.toast.info('Combo Denegado', 'La sugerencia ha sido descartada.');
        this.loadAll();
      },
      error: () => this.toast.error('Error', 'No se pudo denegar.')
    });
  }

  aprobarDespacho(idMovimiento: number): void {
    this.operacionesService.aprobarDespacho(idMovimiento, 'Aprobado').subscribe({
      next: () => {
        this.toast.success('Despacho Confirmado', 'Salida autorizada.');
        this.loadAll();
      },
      error: () => this.toast.error('Error', 'No se pudo aprobar.')
    });
  }

  rechazarDespacho(idMovimiento: number): void {
    this.operacionesService.rechazarDespacho(idMovimiento, 'Denegado').subscribe({
      next: () => {
        this.toast.info('Despacho Denegado', 'Salida rechazada.');
        this.loadAll();
      },
      error: () => this.toast.error('Error', 'No se pudo rechazar.')
    });
  }

  aprobarDevolucion(idDevolucion: number): void {
    this.operacionesService.cambiarEstadoDevolucion(idDevolucion, { idEstadoAprobacion: 1, observacionSupervisor: 'Aprobado' }).subscribe({
      next: () => {
        this.toast.success('Devolución Aprobada', 'Inventario actualizado.');
        this.loadAll();
      },
      error: () => this.toast.error('Error', 'No se pudo aprobar.')
    });
  }

  rechazarDevolucion(idDevolucion: number): void {
    this.operacionesService.cambiarEstadoDevolucion(idDevolucion, { idEstadoAprobacion: 3, observacionSupervisor: 'Denegado' }).subscribe({
      next: () => {
        this.toast.info('Devolución Denegada', 'Descartada.');
        this.loadAll();
      },
      error: () => this.toast.error('Error', 'No se pudo denegar.')
    });
  }
}
