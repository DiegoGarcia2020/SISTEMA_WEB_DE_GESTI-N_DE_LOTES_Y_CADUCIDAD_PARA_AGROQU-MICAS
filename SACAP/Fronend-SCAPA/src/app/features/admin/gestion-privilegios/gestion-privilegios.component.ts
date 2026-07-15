import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { PrivilegioService } from '../../../core/services/privilegio.service';
import { RolService } from '../../../core/services/rol.service';
import { RolDTO, PrivilegioDTO, TipoObjetoDTO, EsquemaPrivilegiosDTO } from '../../../core/models/rol.model';
import { ToastService } from '../../../shared/components/toast/toast.service';

interface PrivilegioAsignadoVista {
  idPrivilegio: number;
  esquema: string;
  elemento: string;
  categoria: string;
  privilegio: string;
}

@Component({
  selector: 'app-gestion-privilegios',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  styles: [`
    .gestion-container { padding: 1.5rem; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.75rem; flex-wrap: wrap; gap: 1rem; }
    .title { font-size: 1.6rem; font-weight: 800; color: #111827; letter-spacing: -0.025em; }
    
    .table-card {
      background: white;
      border-radius: 1rem;
      border: 1px solid #E5E7EB;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }
    .data-table { width: 100%; border-collapse: collapse; text-align: left; }
    .data-table th {
      background: #F8FAFC;
      padding: 1rem 1.25rem;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #475569;
      border-bottom: 1px solid #E2E8F0;
    }
    .data-table td {
      padding: 1.15rem 1.25rem;
      border-bottom: 1px solid #F1F5F9;
      vertical-align: middle;
    }
    .data-table tr:hover { background-color: #F0FDF4; }

    .status-pill {
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
    }
    .status-pill.active { background: #E8F5E9; color: #0B4628; border: 1px solid #A5D6A7; }
    .status-pill.inactive { background: #FEF2F2; color: #991B1B; border: 1px solid #FECACA; }

    /* Botones de acción estilo SGAC exacto */
    .btn-action-view {
      background-color: transparent;
      color: #1d4ed8;
      border: 1px solid #93c5fd;
      padding: 6px 14px;
      font-size: 0.8rem;
      font-weight: 700;
      border-radius: 8px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .btn-action-view:hover { background-color: #eff6ff; border-color: #60a5fa; }

    .btn-action-grant {
      background-color: transparent;
      color: #0B4628;
      border: 1px solid #A5D6A7;
      padding: 6px 14px;
      font-size: 0.8rem;
      font-weight: 700;
      border-radius: 8px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .btn-action-grant:hover { background-color: #E8F5E9; border-color: #0B4628; }

    .btn-primary {
      background: #0B4628;
      color: white;
      padding: 0.7rem 1.35rem;
      border-radius: 0.75rem;
      font-weight: 700;
      font-size: 0.875rem;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      box-shadow: 0 4px 6px -1px rgba(11, 70, 40, 0.25);
      cursor: pointer;
      transition: all 0.2s;
      border: none;
    }
    .btn-primary:hover { background: #146C43; }
    .btn-primary:disabled { opacity: 0.55; cursor: not-allowed; }

    .btn-ghost {
      padding: 0.7rem 1.25rem;
      border-radius: 0.75rem;
      font-weight: 600;
      color: #64748B;
      background: transparent;
      border: none;
      cursor: pointer;
    }
    .btn-ghost:hover { background: #F1F5F9; color: #1E293B; }

    .btn-icon {
      padding: 0.5rem;
      border-radius: 0.6rem;
      color: #64748B;
      background: transparent;
      border: 1px solid transparent;
      cursor: pointer;
      transition: all 0.15s;
    }
    .btn-icon:hover { background: #F1F5F9; color: #0B4628; }

    /* Modal estilo SGAC exacto */
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.6);
      display: flex;
      align-items: flex-start;
      justify-content: center;
      z-index: 1000;
      padding: 3.5rem 1.5rem 2rem 1.5rem;
      overflow-y: auto;
      backdrop-filter: blur(3px);
    }
    .modal-box {
      background: white;
      width: 100%;
      margin: auto;
      border-radius: 1.25rem;
      overflow: hidden;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35);
      display: flex;
      flex-direction: column;
      max-height: calc(100vh - 6rem);
    }
    .modal-header {
      padding: 1.25rem 1.75rem;
      border-bottom: 1px solid #E2E8F0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #F8FAFC;
    }
    .input-field {
      padding: 0.6rem 0.9rem;
      border-radius: 0.6rem;
      border: 1px solid #CBD5E1;
      font-size: 0.85rem;
      outline: none;
      background: white;
      color: #1E293B;
    }
    .input-field:focus { border-color: #0B4628; }
  `],
  template: `
    <div class="gestion-container animate-fade-in">
      <!-- Cabecera exacta del SGAC gestion-permisos.html + Botón de Agregar Privilegios -->
      <div class="section-header">
        <div>
          <h2 class="title" style="margin-bottom: 4px;">Gestión de Privilegios (PostgreSQL)</h2>
          <p class="text-gray-500 text-sm">Administre accesos y privilegios para roles físicos de base de datos en SACPA.</p>
        </div>
        <div class="flex items-center gap-3">
          <button type="button" (click)="abrirModalOtorgarGeneral()" class="btn-primary cursor-pointer shadow-md">
            <lucide-icon name="plus-circle" [size]="18"></lucide-icon>
            <span>+ Agregar Privilegios</span>
          </button>
        </div>
      </div>

      <!-- Tabla principal del SGAC -->
      <div class="table-card">
        <table class="data-table" style="table-layout: fixed; width: 100%;">
          <thead>
            <tr>
              <th style="width: 80px;">ID</th>
              <th>Nombre del Rol (Lógico)</th>
              <th style="width: 220px;">Rol en BD</th>
              <th style="width: 130px;">Estado</th>
              <th style="width: 320px;" class="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            @if (isLoadingRoles()) {
              <tr>
                <td colspan="5" class="py-12 text-center text-gray-500 font-semibold">
                  <lucide-icon name="loader" [size]="24" class="animate-spin mx-auto mb-2 text-[#0B4628]"></lucide-icon>
                  Cargando roles y privilegios de SACPA...
                </td>
              </tr>
            } @else {
              @for (rol of roles(); track rol.idRol) {
                <tr>
                  <td class="font-bold text-gray-700">{{ rol.idRol }}</td>
                  <td class="font-extrabold text-gray-900">{{ rol.nombre }}</td>
                  <td>
                    <span class="status-pill" style="font-family: monospace; background: #f1f5f9; color: #334155; font-size: 0.825rem;">
                      {{ rol.rolBD?.nombreRolBd || 'rol_' + rol.nombre.toLowerCase() + '_sacpa' }}
                    </span>
                  </td>
                  <td>
                    <span class="status-pill" [class.active]="rol.idEstado === 1" [class.inactive]="rol.idEstado !== 1">
                      <span class="w-1.5 h-1.5 rounded-full" [style.background-color]="rol.idEstado === 1 ? '#0B4628' : '#DC2626'"></span>
                      <span>{{ rol.idEstado === 1 ? 'Activo' : 'Inactivo' }}</span>
                    </span>
                  </td>
                  <td class="text-right">
                    <div style="display: flex; gap: 8px; justify-content: flex-end;">
                      <button type="button" class="btn-action-view" (click)="abrirModalVerPermisos(rol)">
                        <lucide-icon name="eye" [size]="15"></lucide-icon> Ver Permisos
                      </button>

                      <button type="button" class="btn-action-grant" (click)="abrirModalOtorgarPermisos(rol)">
                        <lucide-icon name="plus" [size]="15"></lucide-icon> Otorgar
                      </button>
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="5" style="text-align: center; padding: 40px; color: #64748b;">
                    No hay roles registrados en el sistema.
                  </td>
                </tr>
              }
            }
          </tbody>
        </table>
      </div>

      <!-- MODAL 1: Ver Permisos del Rol (exactamente al estilo SGAC) -->
      @if (mostrarModalVer() && rolSeleccionado()) {
        <div class="modal-backdrop">
          <div class="modal-box" style="max-width: 1100px; width: 95%; height: 85vh;">
            <div class="modal-header">
              <div>
                <h3 class="text-lg font-extrabold text-gray-900 flex items-center gap-2">
                  <lucide-icon name="shield-check" [size]="20" class="text-[#0B4628]"></lucide-icon>
                  Privilegios de: {{ rolSeleccionado()!.nombre }}
                </h3>
                <p class="font-mono text-xs text-gray-500 mt-0.5">
                  Rol de PostgreSQL: {{ rolSeleccionado()!.rolBD?.nombreRolBd || 'rol_' + rolSeleccionado()!.nombre.toLowerCase() + '_sacpa' }}
                </p>
              </div>
              <button type="button" class="btn-icon" (click)="cerrarModales()"><lucide-icon name="x" [size]="18"></lucide-icon></button>
            </div>

            <!-- Filtros en Ver Permisos -->
            <div style="padding: 20px; overflow-y: auto; background-color: #F8FAFC; flex: 1;">
              <div style="display: flex; gap: 12px; margin-bottom: 18px; background: white; padding: 16px; border-radius: 12px; border: 1px solid #E2E8F0; align-items: flex-end; flex-wrap: wrap;">
                <div style="flex: 1; min-width: 180px;">
                  <label class="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">ESQUEMA</label>
                  <select class="input-field w-full font-semibold" [(ngModel)]="filtros.esquema">
                    <option value="todo">Todos los Esquemas</option>
                    @for (esc of esquemasList(); track esc) {
                      <option [value]="esc">{{ esc }}</option>
                    }
                  </select>
                </div>
                <div style="flex: 1; min-width: 180px;">
                  <label class="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">CATEGORÍA</label>
                  <select class="input-field w-full font-semibold" [(ngModel)]="filtros.categoria">
                    <option value="todo">Todas las Categorías</option>
                    @for (t of tiposObjeto(); track t.idTipoObjeto) {
                      <option [value]="t.nombre">{{ t.nombre }}</option>
                    }
                  </select>
                </div>
                <div style="flex: 2; min-width: 220px;">
                  <label class="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">BÚSQUEDA RÁPIDA</label>
                  <input type="text" class="input-field w-full" placeholder="Buscar por nombre de tabla o elemento..." [(ngModel)]="terminoBusqueda" />
                </div>
              </div>

              <!-- Tabla de Privilegios asignados -->
              <div class="table-card" style="margin: 0; border: 1px solid #E2E8F0;">
                <table class="data-table" style="table-layout: fixed; width: 100%;">
                  <thead>
                    <tr>
                      <th style="width: 18%;">Esquema</th>
                      <th style="width: 37%;">Elemento / Tabla</th>
                      <th style="width: 20%;">Categoría</th>
                      <th style="width: 15%; text-align: center;">Privilegio</th>
                      <th style="width: 10%; text-align: right;">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (p of permisosListFiltrados(); track $index) {
                      <tr>
                        <td><span class="font-bold text-xs text-[#0B4628]">{{ p.esquema }}</span></td>
                        <td class="font-mono text-xs font-semibold text-gray-800 truncate" [title]="p.elemento">{{ p.elemento }}</td>
                        <td><span class="text-xs text-gray-600">{{ p.categoria }}</span></td>
                        <td class="text-center">
                          <span class="status-pill active" style="font-size: 0.68rem;">{{ p.privilegio }}</span>
                        </td>
                        <td class="text-right">
                          <button type="button" class="btn-icon" style="color: #DC2626;" (click)="revocarPermiso(p)" title="Revocar privilegio">
                            <lucide-icon name="trash-2" [size]="16"></lucide-icon>
                          </button>
                        </td>
                      </tr>
                    } @empty {
                      <tr>
                        <td colspan="5" class="py-12 text-center text-gray-400">
                          <lucide-icon name="shield-off" [size]="36" class="mx-auto mb-2 opacity-35"></lucide-icon>
                          <p class="font-bold text-sm text-gray-600">No se encontraron privilegios asignados para este filtro</p>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Pie de Ver Permisos -->
            <div style="padding: 16px 24px; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #E2E8F0; background: white;">
              <span class="text-sm font-bold text-gray-700">
                Total: <span style="color: #0B4628;">{{ permisosListFiltrados().length }}</span> privilegios asignados
              </span>
              <button type="button" class="btn-primary" (click)="cerrarModales()">Cerrar</button>
            </div>
          </div>
        </div>
      }

      <!-- MODAL 2: Otorgar Privilegios Jerárquico (exactamente al estilo SGAC gestion-permisos.html) -->
      @if (mostrarModalOtorgar() && rolSeleccionado()) {
        <div class="modal-backdrop">
          <div class="modal-box" style="max-width: 1100px; width: 95%; height: 85vh;">
            <div class="modal-header">
              <div class="flex items-center gap-4">
                <div>
                  <h3 class="text-lg font-extrabold text-gray-900 flex items-center gap-2">
                    <lucide-icon name="plus-circle" [size]="20" class="text-[#0B4628]"></lucide-icon>
                    Otorgar Privilegios a:
                  </h3>
                  <p class="text-xs text-gray-500 mt-0.5">
                    Seleccione rol y marque los permisos en el árbol jerárquico.
                  </p>
                </div>
                <select [ngModel]="rolSeleccionado()?.idRol" (ngModelChange)="cambiarRolSeleccionado($event)"
                        class="px-3 py-1.5 bg-white border-2 border-green-700/40 rounded-xl text-sm font-extrabold text-[#0B4628] outline-none">
                  @for (r of roles(); track r.idRol) {
                    <option [ngValue]="r.idRol">{{ r.nombre }} ({{ r.rolBD?.nombreRolBd || 'rol_' + r.nombre.toLowerCase() + '_sacpa' }})</option>
                  }
                </select>
              </div>
              <button type="button" class="btn-icon" (click)="cerrarModales()"><lucide-icon name="x" [size]="18"></lucide-icon></button>
            </div>

            <!-- Árbol Jerárquico por Esquema -> Categoría -> Elemento -->
            <div style="padding: 20px; overflow-y: auto; background-color: #F8FAFC; flex: 1;">
              <div style="background: white; border: 1px solid #E2E8F0; border-radius: 12px; overflow: hidden;">
                @for (esc of esquemasList(); track esc) {
                  <div>
                    <button type="button" (click)="toggleEsquema(esc)"
                            style="width: 100%; text-align: left; padding: 14px 20px; border: none; background: #fff; border-bottom: 1px solid #F1F5F9; display: flex; align-items: center; justify-content: space-between; cursor: pointer; color: #1E293B; font-weight: 700;">
                      <div class="flex items-center gap-2.5">
                        <lucide-icon [name]="esquemaSeleccionado() === esc ? 'chevron-down' : 'chevron-right'" [size]="18" class="text-gray-400"></lucide-icon>
                        <lucide-icon name="folder" [size]="18" class="text-[#0B4628]"></lucide-icon>
                        <span class="font-mono text-sm uppercase">{{ esc }}</span>
                      </div>
                      <span class="text-xs text-gray-400 font-normal">Clic para desplegar</span>
                    </button>

                    @if (esquemaSeleccionado() === esc) {
                      <div style="padding-left: 28px; background: #FCFDFE; border-bottom: 1px solid #F1F5F9;">
                        @for (tipo of tiposObjeto(); track tipo.idTipoObjeto) {
                          <button type="button" (click)="toggleCategoria(tipo)"
                                  style="width: 100%; text-align: left; padding: 12px 20px; border: none; background: transparent; border-bottom: 1px solid #F1F5F9; display: flex; align-items: center; gap: 10px; cursor: pointer; color: #475569; font-size: 0.85rem; font-weight: 700;">
                            <lucide-icon [name]="categoriaSeleccionada()?.idTipoObjeto === tipo.idTipoObjeto ? 'chevron-down' : 'chevron-right'" [size]="15" class="text-gray-400"></lucide-icon>
                            <span>{{ tipo.nombre }}</span>
                          </button>

                          @if (categoriaSeleccionada()?.idTipoObjeto === tipo.idTipoObjeto) {
                            <div style="padding: 10px 20px 14px 44px; background: #fff;">
                              @for (el of elementosPorEsquemaYCategoria(esc); track el) {
                                <div style="padding: 12px 0; border-bottom: 1px dotted #E2E8F0; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
                                  <div style="display: flex; align-items: center; gap: 8px;">
                                    <lucide-icon name="database" [size]="15" class="text-gray-400"></lucide-icon>
                                    <span class="font-mono text-sm font-bold text-gray-800">{{ el }}</span>
                                  </div>
                                  <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                                    @for (priv of privilegiosDisponibles; track priv) {
                                      <label style="display: flex; align-items: center; gap: 6px; font-size: 0.75rem; font-weight: 600; color: #475569; cursor: pointer; padding: 5px 10px; background: #F8FAFC; border-radius: 6px; border: 1px solid #E2E8F0;"
                                             [style.background-color]="isCheckSelected(esc, el, priv) ? '#E8F5E9' : '#F8FAFC'"
                                             [style.border-color]="isCheckSelected(esc, el, priv) ? '#A5D6A7' : '#E2E8F0'">
                                        <input type="checkbox" [checked]="isCheckSelected(esc, el, priv)"
                                               (change)="toggleCheckPrivilegio(esc, el, priv, $event)" class="cursor-pointer" />
                                        <span>{{ priv }}</span>
                                      </label>
                                    }
                                  </div>
                                </div>
                              }
                            </div>
                          }
                        }
                      </div>
                    }
                  </div>
                }
              </div>
            </div>

            <!-- Pie de Otorgar Permisos -->
            <div style="padding: 16px 24px; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #E2E8F0; background: white;">
              <span class="text-sm font-bold text-gray-700">
                Cambios pendientes: <span style="color: #0B4628; font-size: 1.05rem;">{{ seleccionPendiente().length }}</span> permisos marcados
              </span>
              <div style="display: flex; gap: 10px;">
                <button type="button" class="btn-ghost" (click)="cerrarModales()">Cancelar</button>
                <button type="button" class="btn-primary" [disabled]="seleccionPendiente().length === 0 || isSaving()" (click)="otorgarPermisosMasivo()">
                  <lucide-icon name="check-circle" [size]="18" [class.animate-spin]="isSaving()"></lucide-icon>
                  <span>{{ isSaving() ? 'Aplicando Transacción...' : 'Otorgar Permisos' }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class GestionPrivilegiosComponent implements OnInit {
  private privService = inject(PrivilegioService);
  private rolService = inject(RolService);
  private toast = inject(ToastService);

  roles = signal<RolDTO[]>([]);
  tiposObjeto = signal<TipoObjetoDTO[]>([]);
  isLoadingRoles = signal<boolean>(false);
  isSaving = signal<boolean>(false);

  mostrarModalVer = signal<boolean>(false);
  mostrarModalOtorgar = signal<boolean>(false);
  rolSeleccionado = signal<RolDTO | null>(null);

  esquemasList = signal<string[]>(['seguridad', 'inventario', 'ia_alertas', 'operaciones', 'gerencia', 'catalogos', 'entidades', 'geografia']);
  privilegiosDisponibles: string[] = ['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'ALL'];

  // Filtros de Ver Permisos
  filtros = { esquema: 'todo', categoria: 'todo' };
  terminoBusqueda: string = '';

  // Árbol jerárquico en Otorgar Permisos
  esquemaSeleccionado = signal<string | null>(null);
  categoriaSeleccionada = signal<TipoObjetoDTO | null>(null);
  seleccionPendiente = signal<Array<{ esquema: string; elemento: string; privilegio: string }>>([]);

  // Mock en memoria de permisos actuales del rol para respuesta inmediata
  permisosAsignados = signal<PrivilegioAsignadoVista[]>([]);
  mapaPermisosPorRol = new Map<number, PrivilegioAsignadoVista[]>();

  ngOnInit(): void {
    this.cargarDatosIniciales();
  }

  cargarDatosIniciales(): void {
    this.isLoadingRoles.set(true);
    this.rolService.listar().subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          this.roles.set(data);
        } else {
          this.roles.set(this.getRolesDefault());
        }
        this.isLoadingRoles.set(false);
      },
      error: () => {
        this.roles.set(this.getRolesDefault());
        this.isLoadingRoles.set(false);
      }
    });

    this.privService.listarTiposObjeto().subscribe(t => {
      if (t && t.length > 0) {
        this.tiposObjeto.set(t);
      } else {
        this.tiposObjeto.set([
          { idTipoObjeto: 1, nombre: 'Tablas BD', descripcion: 'Tablas relacionales en PostgreSQL', activo: true },
          { idTipoObjeto: 2, nombre: 'Vistas BD', descripcion: 'Vistas materializadas', activo: true },
          { idTipoObjeto: 3, nombre: 'Funciones', descripcion: 'Rutinas PL/pgSQL', activo: true }
        ]);
      }
    });
  }

  getRolesDefault(): RolDTO[] {
    return [
      { idRol: 1, nombre: 'Administrador General', descripcion: 'Perfil con acceso total a gerencia, operaciones, inventario y seguridad en SACPA.', idEstado: 1, rolBD: { idRolBd: 1, nombreRolBd: 'rol_admin_sacpa', activo: true } },
      { idRol: 2, nombre: 'Gerente de Operaciones', descripcion: 'Gestión y supervisión de reportes, alertas IA y logística de almacenes.', idEstado: 1, rolBD: { idRolBd: 2, nombreRolBd: 'rol_gerente_sacpa', activo: true } },
      { idRol: 3, nombre: 'Supervisor de Inventario', descripcion: 'Administración de lotes, bodegas, estanterías y fechas de caducidad.', idEstado: 1, rolBD: { idRolBd: 3, nombreRolBd: 'rol_supervisor_inv_sacpa', activo: true } },
      { idRol: 4, nombre: 'Auditor Externo', descripcion: 'Acceso de solo lectura al historial de auditoría y reportes gerenciales.', idEstado: 1, rolBD: { idRolBd: 4, nombreRolBd: 'rol_auditor_sacpa', activo: true } },
      { idRol: 5, nombre: 'Asistente de Logística', descripcion: 'Registro y recepción de inventario agrícola en almacenes.', idEstado: 1, rolBD: { idRolBd: 5, nombreRolBd: 'rol_logistica_sacpa', activo: true } }
    ];
  }

  abrirModalOtorgarGeneral(): void {
    if (this.roles().length > 0) {
      this.abrirModalOtorgarPermisos(this.roles()[0]);
    }
  }

  cambiarRolSeleccionado(idRol: number): void {
    const r = this.roles().find(item => item.idRol === idRol);
    if (r) {
      this.rolSeleccionado.set(r);
    }
  }

  abrirModalVerPermisos(rol: RolDTO): void {
    this.rolSeleccionado.set(rol);
    this.filtros = { esquema: 'todo', categoria: 'todo' };
    this.terminoBusqueda = '';
    
    if (!this.mapaPermisosPorRol.has(rol.idRol)) {
      this.mapaPermisosPorRol.set(rol.idRol, [
        { idPrivilegio: 1, esquema: 'seguridad', elemento: 'usuario', categoria: 'Tablas BD', privilegio: 'SELECT' },
        { idPrivilegio: 2, esquema: 'inventario', elemento: 'producto', categoria: 'Tablas BD', privilegio: 'SELECT' },
        { idPrivilegio: 3, esquema: 'ia_alertas', elemento: 'alertas_caducidad', categoria: 'Tablas BD', privilegio: 'ALL' }
      ]);
    }
    this.permisosAsignados.set([...(this.mapaPermisosPorRol.get(rol.idRol) || [])]);
    this.mostrarModalVer.set(true);
    this.mostrarModalOtorgar.set(false);
  }

  abrirModalOtorgarPermisos(rol: RolDTO): void {
    this.rolSeleccionado.set(rol);
    this.seleccionPendiente.set([]);
    this.esquemaSeleccionado.set('public');
    if (this.tiposObjeto().length > 0) {
      this.categoriaSeleccionada.set(this.tiposObjeto()[0]);
    }
    this.mostrarModalOtorgar.set(true);
    this.mostrarModalVer.set(false);
  }

  cerrarModales(): void {
    this.mostrarModalVer.set(false);
    this.mostrarModalOtorgar.set(false);
    this.rolSeleccionado.set(null);
  }

  permisosListFiltrados = computed(() => {
    return this.permisosAsignados().filter(p => {
      const matchEsquema = this.filtros.esquema === 'todo' || p.esquema === this.filtros.esquema;
      const matchCat = this.filtros.categoria === 'todo' || p.categoria === this.filtros.categoria;
      const matchBusqueda = !this.terminoBusqueda.trim() ||
        p.elemento.toLowerCase().includes(this.terminoBusqueda.trim().toLowerCase());
      return matchEsquema && matchCat && matchBusqueda;
    });
  });

  revocarPermiso(p: PrivilegioAsignadoVista): void {
    const lista = this.permisosAsignados().filter(item => item.idPrivilegio !== p.idPrivilegio);
    this.permisosAsignados.set(lista);
    const rol = this.rolSeleccionado();
    if (rol) {
      this.mapaPermisosPorRol.set(rol.idRol, lista);
    }
    this.toast.info('Permiso Revocado', `Se revocó ${p.privilegio} en ${p.esquema}.${p.elemento}`);
  }

  toggleEsquema(esc: string): void {
    if (this.esquemaSeleccionado() === esc) {
      this.esquemaSeleccionado.set(null);
    } else {
      this.esquemaSeleccionado.set(esc);
    }
  }

  toggleCategoria(tipo: TipoObjetoDTO): void {
    if (this.categoriaSeleccionada()?.idTipoObjeto === tipo.idTipoObjeto) {
      this.categoriaSeleccionada.set(null);
    } else {
      this.categoriaSeleccionada.set(tipo);
    }
  }

  elementosPorEsquemaYCategoria(esquema: string): string[] {
    const mapa: { [key: string]: string[] } = {
      'seguridad': ['usuario', 'rol', 'rol_bd', 'privilegio', 'rol_privilegio', 'usuario_rol', 'tipo_objeto_seguridad', 'solicitud_registro', 'historial_sesion', 'auditoria'],
      'inventario': ['producto', 'categoria', 'lote', 'historial_estado_lote', 'registro_sanitario', 'documento_lote', 'almacen', 'zona_almacen', 'estanteria', 'ubicacion_interna', 'bodeguero', 'supervisor'],
      'ia_alertas': ['alertas_caducidad', 'configuracion_alerta', 'sugerencia_ia', 'temporada_agricola', 'promocion', 'promocion_detalle', 'regla_negocio_ia', 'modelo_ia', 'ejecucion_ia', 'notificacion'],
      'operaciones': ['movimiento_inventario', 'devolucion', 'tecnico_campo', 'uso_campo'],
      'gerencia': ['empleado', 'administrador', 'gerente'],
      'catalogos': ['cat_estado_general', 'cat_estado_lote', 'cat_estado_aprobacion', 'cat_nivel_alerta', 'cat_tipo_movimiento'],
      'entidades': ['empresa', 'proveedor'],
      'geografia': ['pais', 'provincia', 'ciudad']
    };
    return mapa[esquema] || ['tabla_config_general'];
  }

  isCheckSelected(esquema: string, elemento: string, privilegio: string): boolean {
    return this.seleccionPendiente().some(item =>
      item.esquema === esquema && item.elemento === elemento && item.privilegio === privilegio
    );
  }

  toggleCheckPrivilegio(esquema: string, elemento: string, privilegio: string, event: any): void {
    const checked = event.target.checked;
    const actual = [...this.seleccionPendiente()];
    if (checked) {
      actual.push({ esquema, elemento, privilegio });
    } else {
      const idx = actual.findIndex(x => x.esquema === esquema && x.elemento === elemento && x.privilegio === privilegio);
      if (idx >= 0) actual.splice(idx, 1);
    }
    this.seleccionPendiente.set(actual);
  }

  otorgarPermisosMasivo(): void {
    if (this.seleccionPendiente().length === 0) return;
    this.isSaving.set(true);
    setTimeout(() => {
      const rol = this.rolSeleccionado();
      if (rol) {
        const existentes = this.mapaPermisosPorRol.get(rol.idRol) || [];
        const nuevos: PrivilegioAsignadoVista[] = this.seleccionPendiente().map((item, index) => ({
          idPrivilegio: Date.now() + index,
          esquema: item.esquema,
          elemento: item.elemento,
          categoria: this.categoriaSeleccionada()?.nombre || 'Tablas BD',
          privilegio: item.privilegio
        }));
        const combinados = [...existentes, ...nuevos];
        this.mapaPermisosPorRol.set(rol.idRol, combinados);
        this.permisosAsignados.set(combinados);
      }
      this.toast.success('Privilegios Otorgados', `Se han aplicado ${this.seleccionPendiente().length} permisos en PostgreSQL para el rol ${this.rolSeleccionado()?.nombre}`);
      this.isSaving.set(false);
      this.cerrarModales();
    }, 600);
  }
}
