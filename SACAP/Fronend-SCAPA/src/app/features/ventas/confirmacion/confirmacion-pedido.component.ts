import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { VentasService } from '../../../core/services/ventas.service';
import { VentaDTO } from '../../../core/models/ventas.model';

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
    this.router.navigate(['/admin/ventas/dashboard']);
  }
}
