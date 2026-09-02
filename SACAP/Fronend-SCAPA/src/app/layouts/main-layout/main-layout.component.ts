import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from './sidebar.component';
import { TopbarComponent } from './topbar.component';
import { ToastComponent } from '../../shared/components/toast/toast.component';
import { WebsocketService } from '../../core/services/websocket.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../shared/components/toast/toast.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent, TopbarComponent, ToastComponent],
  styleUrl: './main-layout.component.css',
  template: `
    <div class="layout-wrapper" [class.layout-collapsed]="sidebarColapsado()">
      <!-- Sidebar Fijo -->
      <app-sidebar [colapsado]="sidebarColapsado()" (toggle)="toggleSidebar()"></app-sidebar>

      <!-- Área de contenido principal -->
      <div class="layout-content">
        <app-topbar></app-topbar>

        <main class="layout-main custom-scrollbar">
          <div class="layout-container">
            <router-outlet></router-outlet>
          </div>
        </main>
      </div>

      <!-- Contenedor flotante de Toasts -->
      <app-toast-container></app-toast-container>
    </div>
  `
})
export class MainLayoutComponent implements OnInit {
  sidebarColapsado = signal(false);
  
  private wsService = inject(WebsocketService);
  private authService = inject(AuthService);
  private toast = inject(ToastService);

  ngOnInit(): void {
    const user = this.authService.currentUser();
    if (user?.correo) {
      this.wsService.subscribe(`/topic/logout/${user.correo}`, (msg: any) => {
        this.toast.warning('Sesión Cerrada', msg?.mensaje || 'Tu sesión ha sido cerrada por un administrador.');
        this.wsService.disconnect();
        this.authService.logout();
      });
    }
  }

  toggleSidebar() {
    this.sidebarColapsado.set(!this.sidebarColapsado());
  }
}
