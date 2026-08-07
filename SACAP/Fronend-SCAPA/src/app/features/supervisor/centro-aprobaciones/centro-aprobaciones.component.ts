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

  ngOnInit(): void {
    this.loadAll();
  }

  setTab(tabIndex: number) {
    this.tabActiva.set(tabIndex);
  }

  loadAll(): void {
    this.operacionesService.listarPromociones().subscribe(data => {
      this.promosPendientes.set(data.filter(p => p.estado === 'SUGERIDA' || (p as any).idEstado === 2));
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
