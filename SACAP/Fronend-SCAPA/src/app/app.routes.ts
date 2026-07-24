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

// Componentes por Rol (Bodega, Campo, Supervisor)
import { BodegaDashboardComponent } from './features/bodeguero/bodega-dashboard.component';
import { ComprasRecepcionComponent } from './features/bodeguero/compras-recepcion/compras-recepcion.component';
import { CampoDashboardComponent } from './features/tecnico-campo/campo-dashboard.component';
import { SupervisorDashboardComponent } from './features/supervisor/supervisor-dashboard.component';
import { ComprasListadoComponent } from './features/supervisor/compras-listado/compras-listado.component';
import { ComprasCrearComponent } from './features/supervisor/compras-crear/compras-crear.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroComponent },
  {
    path: 'bodega',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: BodegaDashboardComponent },
      { path: 'recepcion/:idOrden', component: ComprasRecepcionComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  {
    path: 'campo',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: CampoDashboardComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  {
    path: 'supervisor',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: SupervisorDashboardComponent },
      { path: 'compras', component: ComprasListadoComponent },
      { path: 'compras/nueva', component: ComprasCrearComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
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
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];
