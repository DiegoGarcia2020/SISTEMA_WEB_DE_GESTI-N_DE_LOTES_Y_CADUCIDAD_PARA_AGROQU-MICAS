import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { VentasService } from '../../../core/services/ventas.service';
import { VentaDTO } from '../../../core/models/ventas.model';
import { ComprobanteService } from '../../../core/services/comprobante.service';
import { ToastService } from '../../../shared/components/toast/toast.service';

@Component({
  selector: 'app-confirmacion-pedido',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './confirmacion-pedido.component.html',
  styleUrl: './confirmacion-pedido.component.css'
})
export class ConfirmacionPedidoComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private ventasService = inject(VentasService);
  private comprobanteService = inject(ComprobanteService);
  private toast = inject(ToastService);

  venta = signal<VentaDTO | null>(null);
  cargando = signal(true);
  error = signal('');

  ngOnInit() {
    const idVenta = Number(this.route.snapshot.paramMap.get('idVenta'));
    if (!idVenta) { this.error.set('Orden inválida.'); this.cargando.set(false); return; }

    this.ventasService.obtenerVenta(idVenta).subscribe({
      next: v => { this.venta.set(v); this.cargando.set(false); },
      error: () => { this.error.set('No se pudo cargar la orden.'); this.cargando.set(false); }
    });
  }

  nuevaVenta() {
    this.router.navigate(['/admin/ventas/sugerencias']);
  }

  volverDashboard() {
    this.router.navigate(['/campo/dashboard']);
  }

  descargarComprobante() {
    const v = this.venta();
    if (v) {
      this.comprobanteService.generarComprobanteVenta(v);
    }
  }

  copiarOrden(numero: string): void {
    navigator.clipboard.writeText(numero).then(
      () => this.toast.success('Copiado', `Orden ${numero} copiada al portapapeles.`),
      () => this.toast.error('Error', 'No se pudo copiar.')
    );
  }
}
