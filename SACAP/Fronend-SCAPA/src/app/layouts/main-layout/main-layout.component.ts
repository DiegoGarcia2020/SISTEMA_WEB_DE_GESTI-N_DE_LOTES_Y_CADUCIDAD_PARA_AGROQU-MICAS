import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from './sidebar.component';
import { TopbarComponent } from './topbar.component';
import { ToastComponent } from '../../shared/components/toast/toast.component';

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
export class MainLayoutComponent {
  sidebarColapsado = signal(false);

  toggleSidebar() {
    this.sidebarColapsado.set(!this.sidebarColapsado());
  }
}
