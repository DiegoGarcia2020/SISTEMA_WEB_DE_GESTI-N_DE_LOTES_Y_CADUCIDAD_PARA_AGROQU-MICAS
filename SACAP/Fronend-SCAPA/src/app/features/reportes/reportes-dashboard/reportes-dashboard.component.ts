import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { AuthService } from '../../../core/services/auth.service';

interface ReportLink {
  id: string;
  ruta: string; // ej: 'ventas/productos-mas-vendidos'
  titulo: string;
  descripcion: string;
  icon: string;
  rolesPermitidos: string[];
}

interface ReportCategory {
  nombre: string;
  links: ReportLink[];
}

@Component({
  selector: 'app-reportes-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './reportes-dashboard.component.html',
  styleUrl: './reportes-dashboard.component.css'
})
export class ReportesDashboardComponent implements OnInit {
  private authService = inject(AuthService);
  
  categorias: ReportCategory[] = [];
  rolActual: string = '';

  ngOnInit(): void {
    this.rolActual = (this.authService.currentRole() || '').toUpperCase();
    this.initCatalog();
  }

  private initCatalog() {
    const allCategories: ReportCategory[] = [
      {
        nombre: 'A. Ventas y Rentabilidad',
        links: [
          {
            id: 'productos-mas-vendidos',
            ruta: 'ventas/productos-mas-vendidos',
            titulo: 'Productos Más Vendidos',
            descripcion: 'Volumen de ventas generado por producto.',
            icon: 'trending-up',
            rolesPermitidos: ['ADMINISTRADOR', 'SUPERVISOR', 'TÉCNICO DE CAMPO']
          },
          {
            id: 'productos-mayor-ganancia',
            ruta: 'ventas/productos-mayor-ganancia',
            titulo: 'Productos con Mayor Ganancia',
            descripcion: 'Margen de rentabilidad descontando costos.',
            icon: 'dollar-sign',
            rolesPermitidos: ['ADMINISTRADOR']
          },
          {
            id: 'demanda-temporada',
            ruta: 'ventas/demanda-temporada',
            titulo: 'Demanda por Temporada',
            descripcion: 'Rendimiento de productos en temporada de cultivo.',
            icon: 'sun',
            rolesPermitidos: ['ADMINISTRADOR', 'SUPERVISOR']
          },
          {
            id: 'dia-mas-compras',
            ruta: 'ventas/dia-mas-compras',
            titulo: 'Días de Mayor Compra',
            descripcion: 'Análisis de demanda por días de la semana.',
            icon: 'calendar',
            rolesPermitidos: ['ADMINISTRADOR', 'SUPERVISOR']
          },
          {
            id: 'rotacion-temporada',
            ruta: 'ventas/rotacion-temporada',
            titulo: 'Rotación Rápida de Inventario',
            descripcion: 'Días que tarda el producto desde su recepción hasta su venta.',
            icon: 'refresh-ccw',
            rolesPermitidos: ['ADMINISTRADOR', 'SUPERVISOR', 'TÉCNICO DE CAMPO']
          }
        ]
      },
      {
        nombre: 'B. Promociones e IA',
        links: [
          {
            id: 'combos-exito',
            ruta: 'promociones/combos-exito',
            titulo: 'Combos Exitosos',
            descripcion: 'Combos manuales o de IA más vendidos.',
            icon: 'award',
            rolesPermitidos: ['ADMINISTRADOR', 'SUPERVISOR']
          },
          {
            id: 'efectividad-combos',
            ruta: 'promociones/efectividad-combos',
            titulo: 'Efectividad de Supervisores',
            descripcion: 'Porcentaje de ventas originadas de combos aprobados.',
            icon: 'users',
            rolesPermitidos: ['ADMINISTRADOR', 'SUPERVISOR']
          }
        ]
      },
      {
        nombre: 'C. Inventario y Caducidad',
        links: [
          {
            id: 'productos-por-caducar',
            ruta: 'inventario/productos-por-caducar',
            titulo: 'Próximos a Caducar',
            descripcion: 'Lotes que vencen en menos de 30 días.',
            icon: 'alert-triangle',
            rolesPermitidos: ['ADMINISTRADOR', 'SUPERVISOR', 'BODEGUERO']
          },
          {
            id: 'articulos-estancados',
            ruta: 'inventario/articulos-estancados',
            titulo: 'Artículos Estancados',
            descripcion: 'Lotes sin movimientos recientes.',
            icon: 'archive',
            rolesPermitidos: ['ADMINISTRADOR', 'SUPERVISOR', 'BODEGUERO']
          },
          {
            id: 'total-almacenado',
            ruta: 'inventario/total-almacenado',
            titulo: 'Total Inventario Almacenado',
            descripcion: 'Unidades y valores almacenados en bodega.',
            icon: 'package',
            rolesPermitidos: ['ADMINISTRADOR', 'SUPERVISOR', 'BODEGUERO']
          },
          {
            id: 'movimientos',
            ruta: 'inventario/movimientos',
            titulo: 'Kardex de Movimientos',
            descripcion: 'Entradas y salidas por fecha.',
            icon: 'list',
            rolesPermitidos: ['ADMINISTRADOR', 'SUPERVISOR', 'BODEGUERO']
          },
          {
            id: 'alertas-criticas',
            ruta: 'inventario/alertas-criticas',
            titulo: 'Alertas Críticas Activas',
            descripcion: 'Alertas de caducidad IA no gestionadas.',
            icon: 'bell',
            rolesPermitidos: ['ADMINISTRADOR', 'SUPERVISOR', 'BODEGUERO']
          },
          {
            id: 'productos-salvados',
            ruta: 'inventario/productos-salvados',
            titulo: 'Impacto IA: Productos Salvados',
            descripcion: 'Lotes rescatados antes de caducar.',
            icon: 'shield-check',
            rolesPermitidos: ['ADMINISTRADOR', 'SUPERVISOR', 'BODEGUERO']
          }
        ]
      },
      {
        nombre: 'D. Operación de Bodega',
        links: [
          {
            id: 'ordenes-pendientes',
            ruta: 'bodega/ordenes-pendientes',
            titulo: 'Órdenes Pendientes',
            descripcion: 'Órdenes de compra esperando recepción.',
            icon: 'clock',
            rolesPermitidos: ['ADMINISTRADOR', 'SUPERVISOR', 'BODEGUERO']
          },
          {
            id: 'ordenes-despachadas',
            ruta: 'bodega/ordenes-despachadas',
            titulo: 'Rendimiento de Despacho',
            descripcion: 'Órdenes despachadas por bodeguero hoy.',
            icon: 'truck',
            rolesPermitidos: ['ADMINISTRADOR', 'SUPERVISOR', 'BODEGUERO']
          }
        ]
      },
      {
        nombre: 'E. Clientes',
        links: [
          {
            id: 'mas-compran',
            ruta: 'clientes/mas-compran',
            titulo: 'Top Clientes',
            descripcion: 'Clientes con mayor volumen de compras.',
            icon: 'star',
            rolesPermitidos: ['ADMINISTRADOR', 'SUPERVISOR', 'TÉCNICO DE CAMPO']
          },
          {
            id: 'devoluciones',
            ruta: 'clientes/devoluciones',
            titulo: 'Análisis de Devoluciones',
            descripcion: 'Motivos principales de devolución.',
            icon: 'corner-down-left',
            rolesPermitidos: ['ADMINISTRADOR', 'SUPERVISOR', 'TÉCNICO DE CAMPO']
          },
          {
            id: 'churn',
            ruta: 'clientes/churn',
            titulo: 'Riesgo de Abandono (Churn)',
            descripcion: 'Clientes sin compras en 3 meses.',
            icon: 'user-minus',
            rolesPermitidos: ['ADMINISTRADOR', 'SUPERVISOR', 'TÉCNICO DE CAMPO']
          }
        ]
      },
      {
        nombre: 'F. Auditoría',
        links: [
          {
            id: 'anulaciones',
            ruta: 'auditoria/anulaciones',
            titulo: 'Log de Anulaciones',
            descripcion: 'Auditoría de eliminaciones y ajustes de inventario.',
            icon: 'eye',
            rolesPermitidos: ['ADMINISTRADOR']
          }
        ]
      }
    ];

    // Filtrar por rol
    this.categorias = allCategories.map(cat => ({
      ...cat,
      links: cat.links.filter(l => l.rolesPermitidos.includes(this.rolActual) || this.rolActual === 'ADMINISTRADOR')
    })).filter(cat => cat.links.length > 0);
  }
}
