import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

import { RegistroComponent } from './features/auth/registro/registro.component';
// Componentes de Administración
import { DashboardComponent } from './features/admin/dashboard/dashboard.component';
import { GestionUsuariosComponent } from './features/admin/gestion-usuarios/gestion-usuarios.component';
import { SolicitudesRegistroComponent } from './features/admin/solicitudes-registro/solicitudes-registro.component';
import { GestionRolesComponent } from './features/admin/gestion-roles/gestion-roles.component';
import { GestionPrivilegiosComponent } from './features/admin/gestion-privilegios/gestion-privilegios.component';
import { GestionTemporadasComponent } from './features/admin/gestion-temporadas/gestion-temporadas.component';
import { AlertasCaducidadComponent } from './features/admin/alertas-caducidad/alertas-caducidad.component';
import { PromocionesIAComponent } from './features/admin/promociones-ia/promociones-ia.component';
import { GestionCatalogosComponent } from './features/admin/gestion-catalogos/gestion-catalogos.component';
import { AuditoriaComponent } from './features/admin/auditoria/auditoria.component';
import { ConfiguracionComponent } from './features/admin/configuracion/configuracion.component';
// Módulo Dashboard IA - Secciones
import { IADashboardComponent } from './features/ia/ia-dashboard.component';
import { VentasSectionComponent } from './features/ia/ventas-section.component';
import { InventarioSectionComponent } from './features/ia/inventario-section.component';
import { AlertasSectionComponent } from './features/ia/alertas-section.component';
import { TemporadasSectionComponent } from './features/ia/temporadas-section.component';
import { ClientesSectionComponent } from './features/ia/clientes-section.component';
// Sub-componentes de Ventas
import { VentasMasVendidosComponent } from './features/ia/ventas/mas-vendidos/mas-vendidos.component';
import { MayorIngresoComponent } from './features/ia/ventas/mayor-ingreso/mayor-ingreso.component';
import { DiasCompraComponent } from './features/ia/ventas/dias-compra/dias-compra.component';
// Sub-componentes de Inventario
import { InventarioTotalComponent } from './features/ia/inventario/inventario-total/inventario-total.component';
import { CaducidadComponent } from './features/ia/inventario/caducidad/caducidad.component';
import { EstancadosComponent } from './features/ia/inventario/estancados/estancados.component';
import { MovimientosComponent } from './features/ia/inventario/movimientos/movimientos.component';
// Sub-componentes de Alertas
import { PromocionesEstadisticasComponent } from './features/ia/alertas/promociones-estadisticas/promociones-estadisticas.component';
import { ProductosSalvadosComponent } from './features/ia/alertas/productos-salvados/productos-salvados.component';
import { AnulacionesComponent } from './features/ia/alertas/anulaciones/anulaciones.component';
import { DevolucionesMensualesComponent } from './features/ia/alertas/devoluciones-mensuales/devoluciones-mensuales.component';
// Sub-componentes de Temporadas
import { DemandaTemporadaComponent } from './features/ia/temporadas/demanda/demanda-temporada.component';
import { ProductosTemporadaComponent } from './features/ia/temporadas/productos-temporada/productos-temporada.component';
// Sub-componentes de Clientes
import { ClientesFrecuentesComponent } from './features/ia/clientes/frecuentes/clientes-frecuentes.component';
import { ChurnClientesComponent } from './features/ia/clientes/churn/churn-clientes.component';

const IA_ROLES = ['Administrador', 'Supervisor', 'Gerente'];

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroComponent },
  {
    path: 'admin',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        redirectTo: '/admin/ia/resumen',
        pathMatch: 'full'
      },
      {
        path: 'ia',
        component: IADashboardComponent,
        canActivate: [roleGuard],
        data: { roles: IA_ROLES },
        children: [
          { path: '', redirectTo: 'resumen', pathMatch: 'full' },
          {
            path: 'resumen',
            component: DashboardComponent,
            canActivate: [roleGuard],
            data: { roles: IA_ROLES }
          },
          // ===== VENTAS =====
          {
            path: 'ventas',
            component: VentasSectionComponent,
            canActivate: [roleGuard],
            data: { roles: IA_ROLES },
            children: [
              { path: '', redirectTo: 'mas-vendidos', pathMatch: 'full' },
              { path: 'mas-vendidos', component: VentasMasVendidosComponent, data: { roles: IA_ROLES } },
              { path: 'mayor-ingreso', component: MayorIngresoComponent, data: { roles: IA_ROLES } },
              { path: 'dias-compra', component: DiasCompraComponent, data: { roles: IA_ROLES } }
            ]
          },
          // ===== INVENTARIO =====
          {
            path: 'inventario',
            component: InventarioSectionComponent,
            canActivate: [roleGuard],
            data: { roles: IA_ROLES },
            children: [
              { path: '', redirectTo: 'total', pathMatch: 'full' },
              { path: 'total', component: InventarioTotalComponent, data: { roles: IA_ROLES } },
              { path: 'caducidad', component: CaducidadComponent, data: { roles: IA_ROLES } },
              { path: 'estancados', component: EstancadosComponent, data: { roles: IA_ROLES } },
              { path: 'movimientos', component: MovimientosComponent, data: { roles: IA_ROLES } }
            ]
          },
          // ===== ALERTAS =====
          {
            path: 'alertas',
            component: AlertasSectionComponent,
            canActivate: [roleGuard],
            data: { roles: IA_ROLES },
            children: [
              { path: '', redirectTo: 'promociones', pathMatch: 'full' },
              { path: 'promociones', component: PromocionesEstadisticasComponent, data: { roles: IA_ROLES } },
              { path: 'salvados', component: ProductosSalvadosComponent, data: { roles: IA_ROLES } },
              { path: 'anulaciones', component: AnulacionesComponent, data: { roles: IA_ROLES } },
              { path: 'devoluciones', component: DevolucionesMensualesComponent, data: { roles: IA_ROLES } }
            ]
          },
          // ===== TEMPORADAS =====
          {
            path: 'temporadas',
            component: TemporadasSectionComponent,
            canActivate: [roleGuard],
            data: { roles: IA_ROLES },
            children: [
              { path: '', redirectTo: 'demanda', pathMatch: 'full' },
              { path: 'demanda', component: DemandaTemporadaComponent, data: { roles: IA_ROLES } },
              { path: 'productos', component: ProductosTemporadaComponent, data: { roles: IA_ROLES } }
            ]
          },
          // ===== CLIENTES =====
          {
            path: 'clientes',
            component: ClientesSectionComponent,
            canActivate: [roleGuard],
            data: { roles: IA_ROLES },
            children: [
              { path: '', redirectTo: 'frecuentes', pathMatch: 'full' },
              { path: 'frecuentes', component: ClientesFrecuentesComponent, data: { roles: IA_ROLES } },
              { path: 'churn', component: ChurnClientesComponent, data: { roles: IA_ROLES } }
            ]
          },
          // ===== ANÁLISIS IA =====
          { path: 'ia', component: VentasMasVendidosComponent, data: { roles: IA_ROLES } }
        ]
      },
      {
        path: 'usuarios',
        component: GestionUsuariosComponent,
        canActivate: [roleGuard],
        data: { roles: ['Administrador', 'Supervisor', 'Gerente'] }
      },
      {
        path: 'solicitudes',
        component: SolicitudesRegistroComponent,
        canActivate: [roleGuard],
        data: { roles: ['Administrador', 'Gerente'] }
      },
      {
        path: 'roles',
        component: GestionRolesComponent,
        canActivate: [roleGuard],
        data: { roles: ['Administrador'] }
      },
      {
        path: 'privilegios',
        component: GestionPrivilegiosComponent,
        canActivate: [roleGuard],
        data: { roles: ['Administrador'] }
      },
      {
        path: 'temporadas',
        component: GestionTemporadasComponent,
        canActivate: [roleGuard],
        data: { roles: ['Administrador', 'Supervisor', 'Gerente'] }
      },
      {
        path: 'alertas',
        component: AlertasCaducidadComponent,
        canActivate: [roleGuard],
        data: { roles: ['Administrador', 'Supervisor', 'Bodeguero'] }
      },
      {
        path: 'ia/promociones',
        component: PromocionesIAComponent,
        canActivate: [roleGuard],
        data: { roles: ['Administrador', 'Gerente'] }
      },
      {
        path: 'catalogos',
        component: GestionCatalogosComponent,
        canActivate: [roleGuard],
        data: { roles: ['Administrador'] }
      },
      {
        path: 'auditoria',
        component: AuditoriaComponent,
        canActivate: [roleGuard],
        data: { roles: ['Administrador'] }
      },
      {
        path: 'configuracion',
        component: ConfiguracionComponent,
        canActivate: [roleGuard],
        data: { roles: ['Administrador'] }
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];
