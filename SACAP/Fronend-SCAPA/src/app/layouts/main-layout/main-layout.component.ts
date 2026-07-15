import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from './sidebar.component';
import { TopbarComponent } from './topbar.component';
import { ToastComponent } from '../../shared/components/toast/toast.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent, TopbarComponent, ToastComponent],
  template: `
    <div class="flex h-screen bg-[#F4F6F8] font-sans text-gray-900 overflow-hidden">
      <!-- Sidebar Fijo -->
      <app-sidebar></app-sidebar>

      <!-- Área de contenido principal -->
      <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
        <app-topbar></app-topbar>

        <main class="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
          <div class="max-w-7xl mx-auto">
            <router-outlet></router-outlet>
          </div>
        </main>
      </div>

      <!-- Contenedor flotante de Toasts -->
      <app-toast-container></app-toast-container>
    </div>
  `
})
export class MainLayoutComponent {}
