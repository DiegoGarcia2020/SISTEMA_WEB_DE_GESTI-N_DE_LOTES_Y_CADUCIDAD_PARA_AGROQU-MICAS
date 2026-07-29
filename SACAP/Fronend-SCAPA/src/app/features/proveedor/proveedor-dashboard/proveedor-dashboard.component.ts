import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/services/auth.service';

interface LoteSummary {
  idLote: number;
  numeroLote: string;
  nombreProducto: string;
  cantidadDeclarada?: number;
  cantidadActual?: number;
  fechaVencimiento: string;
  estadoLote: string;
  diasHastaVencimiento?: number;
}

@Component({
  selector: 'app-proveedor-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './proveedor-dashboard.component.html',
  styleUrl:    './proveedor-dashboard.component.css'
})
export class ProveedorDashboardComponent implements OnInit {

  private http   = inject(HttpClient);
  private auth   = inject(AuthService);
  private router = inject(Router);

  // Datos del proveedor
  perfil = signal<{ idProveedor: number; nombre: string; ruc?: string; telefono?: string } | null>(null);
  cargandoPerfil = signal(true);

  // Lotes
  lotes        = signal<LoteSummary[]>([]);
  cargandoLotes = signal(true);

  // Stats computadas
  get totalLotes()    { return this.lotes().length; }
  get enRevision()    { return this.lotes().filter(l => l.estadoLote?.toLowerCase().includes('revision') || l.estadoLote === '2').length; }
  get activos()       { return this.lotes().filter(l => l.estadoLote?.toLowerCase() === 'activo' || l.estadoLote === '1').length; }
  get proxVencer()    { return this.lotes().filter(l => (l.diasHastaVencimiento ?? 999) <= 30 && (l.diasHastaVencimiento ?? 999) >= 0).length; }

  get nombreUsuario() {
    const u = this.auth.currentUser();
    return (u as any)?.nombre || (u as any)?.correo || 'Proveedor';
  }

  get horaDelDia() {
    const h = new Date().getHours();
    if (h < 12) return 'Buenos días';
    if (h < 19) return 'Buenas tardes';
    return 'Buenas noches';
  }

  ngOnInit() {
    // Cargar perfil
    this.http.get<any>(`${environment.apiUrl}/proveedores/perfil`).subscribe({
      next: p => {
        this.perfil.set({ idProveedor: p.idProveedor, nombre: p.nombre, ruc: p.ruc, telefono: p.telefono });
        this.cargandoPerfil.set(false);
        this.cargarLotes(p.idProveedor);
      },
      error: () => {
        this.cargandoPerfil.set(false);
        this.cargandoLotes.set(false);
      }
    });
  }

  cargarLotes(idProveedor: number) {
    // Intentar cargar lotes del proveedor
    this.http.get<any[]>(`${environment.apiUrl}/proveedores/mis-lotes`).subscribe({
      next: data => {
        this.lotes.set(data || []);
        this.cargandoLotes.set(false);
      },
      error: () => {
        // Fallback a mocks si el endpoint aún no existe
        this.lotes.set([]);
        this.cargandoLotes.set(false);
      }
    });
  }

  irAPreRegistro() {
    this.router.navigate(['/admin/inventario/pre-registro']);
  }

  getEstadoBadge(estado: string): string {
    const e = (estado || '').toLowerCase();
    if (e.includes('revision') || e === '2') return 'revision';
    if (e.includes('activo')   || e === '1') return 'activo';
    if (e.includes('rechaz'))               return 'rechazado';
    return 'otro';
  }

  getEstadoLabel(estado: string): string {
    const e = (estado || '').toLowerCase();
    if (e.includes('revision') || e === '2') return 'EN REVISIÓN';
    if (e.includes('activo')   || e === '1') return 'ACTIVO';
    if (e.includes('rechaz'))               return 'RECHAZADO';
    return estado;
  }

  getVencimientoClass(dias: number | undefined): string {
    if (dias === undefined) return '';
    if (dias <= 7)  return 'crítico';
    if (dias <= 30) return 'advertencia';
    return 'normal';
  }
}
