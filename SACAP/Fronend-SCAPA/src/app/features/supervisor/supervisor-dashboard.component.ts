import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { OperacionesService } from '../../core/services/operaciones.service';
import { ToastService } from '../../shared/components/toast/toast.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-supervisor-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  styleUrl: './supervisor-dashboard.component.css',
  templateUrl: './supervisor-dashboard.component.html'
})
export class SupervisorDashboardComponent implements OnInit {
  authService = inject(AuthService);
  private operacionesService = inject(OperacionesService);
  private toast = inject(ToastService);

  promosPendientes = signal<any[]>([]);
  despachosPendientes = signal<any[]>([]);
  devolucionesPendientes = signal<any[]>([]);
  procesadosHoy = signal<number>(4);

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.operacionesService.listarPromociones().subscribe(res => {
      this.promosPendientes.set(res.content.filter(p => p.estado === 'SUGERIDA'));
    });
    this.operacionesService.listarDespachosPendientes().subscribe(data => this.despachosPendientes.set(data));
    this.operacionesService.listarDevolucionesPendientes().subscribe(data => this.devolucionesPendientes.set(data));
  }

  aprobarPromo(promo: any): void {
    const id = promo.idPromocion;
    this.operacionesService.cambiarEstadoPromocion(id, 'APROBADA').subscribe({
      next: () => {
        promo.estado = 'APROBADA';
        (promo as any).idEstado = 1;
        this.toast.success('Combo IA Aprobado', 'El combo ha sido autorizado y está visible para todos los Técnicos-Comerciales.');
        this.procesadosHoy.update((n: number) => n + 1);
        this.loadAll();
      },
      error: () => this.toast.error('Error', 'No se pudo aprobar la promoción/combo.')
    });
  }

  rechazarPromo(promo: any): void {
    const id = promo.idPromocion;
    this.operacionesService.cambiarEstadoPromocion(id, 'RECHAZADA').subscribe({
      next: () => {
        this.toast.info('Combo Denegado', 'La sugerencia de combo ha sido descartada.');
        this.procesadosHoy.update((n: number) => n + 1);
        this.loadAll();
      },
      error: () => this.toast.error('Error', 'No se pudo denegar el combo.')
    });
  }

  aprobarDespacho(idMovimiento: number): void {
    this.operacionesService.aprobarDespacho(idMovimiento, 'Aprobado en auditoría de Supervisor').subscribe({
      next: () => {
        this.toast.success('Despacho Confirmado', 'Se ha autorizado la salida de bodega.');
        this.procesadosHoy.update((n: number) => n + 1);
        this.loadAll();
      },
      error: () => this.toast.error('Error', 'No se pudo aprobar el despacho.')
    });
  }

  rechazarDespacho(idMovimiento: number): void {
    this.operacionesService.rechazarDespacho(idMovimiento, 'Denegado por Supervisor').subscribe({
      next: () => {
        this.toast.info('Despacho Denegado', 'El movimiento logístico fue rechazado.');
        this.procesadosHoy.update((n: number) => n + 1);
        this.loadAll();
      },
      error: () => this.toast.error('Error', 'No se pudo rechazar el despacho.')
    });
  }

  aprobarDevolucion(idDevolucion: number): void {
    this.operacionesService.cambiarEstadoDevolucion(idDevolucion, { idEstadoAprobacion: 1, observacionSupervisor: 'Aprobado por Supervisor' }).subscribe({
      next: () => {
        this.toast.success('Devolución Aprobada', 'Se registró la devolución al proveedor y se actualizó el inventario.');
        this.procesadosHoy.update((n: number) => n + 1);
        this.loadAll();
      },
      error: () => this.toast.error('Error', 'No se pudo procesar la aprobación.')
    });
  }

  rechazarDevolucion(idDevolucion: number): void {
    this.operacionesService.cambiarEstadoDevolucion(idDevolucion, { idEstadoAprobacion: 3, observacionSupervisor: 'Denegado por Supervisor' }).subscribe({
      next: () => {
        this.toast.info('Devolución Denegada', 'La solicitud de devolución al proveedor fue descartada.');
        this.procesadosHoy.update((n: number) => n + 1);
        this.loadAll();
      },
      error: () => this.toast.error('Error', 'No se pudo denegar la devolución.')
    });
  }
}
