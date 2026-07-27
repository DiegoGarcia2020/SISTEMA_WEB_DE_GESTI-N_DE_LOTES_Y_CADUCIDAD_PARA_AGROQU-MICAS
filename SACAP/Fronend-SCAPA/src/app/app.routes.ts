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

// Componentes de Inventario (Módulo 3)
import { EstructuraFisicaComponent } from './features/inventario/estructura-fisica/estructura-fisica.component';
import { PreRegistroLoteComponent } from './features/inventario/pre-registro-lote/pre-registro-lote.component';
import { RecepcionLoteComponent } from './features/inventario/recepcion-lote/recepcion-lote.component';

// Componentes de Bodega (Módulo 2: Topología y Gestión Física)
import { GestorTopologiaComponent } from './features/bodega/gestor-topologia/gestor-topologia.component';
import { AsignacionUbicacionComponent } from './features/bodega/asignacion-ubicacion/asignacion-ubicacion.component';
import { AuditoriaQrComponent } from './features/bodega/auditoria-qr/auditoria-qr.component';

// Componentes de Proveedor
import { ProveedorDashboardComponent } from './features/proveedor/proveedor-dashboard/proveedor-dashboard.component';

// Dashboard del Supervisor (Módulo 2)
import { SupervisorDashboardComponent } from './features/bodega/supervisor-dashboard/supervisor-dashboard.component';

// Componentes de Ventas (Módulo 3: Ventas y Motor IA — Técnico de Campo)
import { VentasDashboardComponent } from './features/ventas/dashboard/ventas-dashboard.component';
import { MotorSugerenciasComponent } from './features/ventas/motor-sugerencias/motor-sugerencias.component';
import { CheckoutComponent } from './features/ventas/checkout/checkout.component';
import { ConfirmacionPedidoComponent } from './features/ventas/confirmacion/confirmacion-pedido.component';

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
        component: DashboardComponent,
        canActivate: [roleGuard],
        data: { roles: ['Administrador', 'Supervisor', 'Gerente'] }
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
      // -- MÓDULO 2: TOPOLOGÍA Y GESTIÓN FÍSICA (Bodeguero & Admin) --
      {
        path: 'bodega/topologia',
        component: GestorTopologiaComponent,
        canActivate: [roleGuard],
        data: { roles: ['Administrador', 'Bodeguero'] }
      },
      {
        path: 'bodega/asignacion',
        component: AsignacionUbicacionComponent,
        canActivate: [roleGuard],
        data: { roles: ['Administrador', 'Bodeguero'] }
      },
      {
        path: 'bodega/auditoria-qr',
        component: AuditoriaQrComponent,
        canActivate: [roleGuard],
        data: { roles: ['Administrador', 'Bodeguero'] }
      },
      // -- Rutas de Inventario --
      {
        path: 'inventario/estructura',
        component: EstructuraFisicaComponent,
        canActivate: [roleGuard],
        data: { roles: ['Administrador', 'Bodeguero'] }
      },
      {
        path: 'inventario/pre-registro',
        component: PreRegistroLoteComponent,
        canActivate: [roleGuard],
        data: { roles: ['Administrador', 'Proveedor', 'Bodeguero'] }
      },
      {
        path: 'inventario/recepcion',
        component: RecepcionLoteComponent,
        canActivate: [roleGuard],
        data: { roles: ['Administrador', 'Bodeguero'] }
      },
      // -- Dashboard Proveedor --
      {
        path: 'proveedor/dashboard',
        component: ProveedorDashboardComponent,
        canActivate: [roleGuard],
        data: { roles: ['Proveedor'] }
      },
      // -- Dashboard Supervisor (Módulo 2) --
      {
        path: 'supervisor/dashboard',
        component: SupervisorDashboardComponent,
        canActivate: [roleGuard],
        data: { roles: ['Supervisor'] }
      },
      // -- Módulo 3: Ventas y Motor IA (Técnico de Campo) --
      {
        path: 'ventas/dashboard',
        component: VentasDashboardComponent,
        canActivate: [roleGuard],
        data: { roles: ['Tecnico', 'Administrador'] }
      },
      {
        path: 'ventas/sugerencias',
        component: MotorSugerenciasComponent,
        canActivate: [roleGuard],
        data: { roles: ['Tecnico', 'Administrador'] }
      },
      {
        path: 'ventas/checkout',
        component: CheckoutComponent,
        canActivate: [roleGuard],
        data: { roles: ['Tecnico', 'Administrador'] }
      },
      {
        path: 'ventas/confirmacion/:idVenta',
        component: ConfirmacionPedidoComponent,
        canActivate: [roleGuard],
        data: { roles: ['Tecnico', 'Administrador'] }
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];
