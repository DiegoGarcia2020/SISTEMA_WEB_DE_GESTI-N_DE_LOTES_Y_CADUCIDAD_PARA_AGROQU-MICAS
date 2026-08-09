import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { VentasService } from '../../../core/services/ventas.service';
import { AuthService } from '../../../core/services/auth.service';
import { CarritoService } from '../../../core/services/carrito.service';
import { VentaDashboardDTO } from '../../../core/models/ventas.model';

@Component({
  selector: 'app-ventas-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './ventas-dashboard.component.html',
  styleUrl: './ventas-dashboard.component.css'
})
export class VentasDashboardComponent implements OnInit {
  private ventasService = inject(VentasService);
  private auth = inject(AuthService);
  private router = inject(Router);
  carrito = inject(CarritoService);

  dashboard = signal<VentaDashboardDTO | null>(null);
  cargando = signal(true);

  get nombreUsuario() {
    const u = this.auth.currentUser();
    return (u as any)?.nombre || (u as any)?.correo || 'Técnico';
  }

  get horaDelDia() {
    const h = new Date().getHours();
    if (h < 12) return 'Buenos días';
    if (h < 19) return 'Buenas tardes';
    return 'Buenas noches';
  }

  ngOnInit() {
    this.ventasService.getDashboard().subscribe({
      next: d => { this.dashboard.set(d); this.cargando.set(false); },
      error: () => { this.cargando.set(false); }
    });
  }

  irASugerencias() {
    this.router.navigate(['/admin/ventas/sugerencias']);
  }

  irACheckout() {
    this.router.navigate(['/admin/ventas/checkout']);
  }
}
