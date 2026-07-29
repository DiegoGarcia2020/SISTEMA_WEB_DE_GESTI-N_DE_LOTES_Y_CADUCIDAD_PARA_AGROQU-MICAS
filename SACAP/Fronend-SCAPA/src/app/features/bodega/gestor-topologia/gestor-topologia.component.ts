import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  InventarioService, NodoTopologiaDTO, AlmacenDTO, ZonaDTO, EstanteriaDTO,
  CiudadDTO, SupervisorOpcionDTO, AlmacenCompletoDTO
} from '../../../core/services/inventario.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-gestor-topologia',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestor-topologia.component.html',
  styleUrl:    './gestor-topologia.component.css'
})
export class GestorTopologiaComponent implements OnInit {

  private inventario = inject(InventarioService);
  private authService = inject(AuthService);

  get esAdmin(): boolean {
    return this.authService.currentRole()?.toUpperCase() === 'ADMINISTRADOR';
  }

  /** El Bodeguero arma la estructura física (zona/estantería/ubicación) dentro de cada bodega. */
  get esBodeguero(): boolean {
    return this.authService.currentRole()?.toUpperCase() === 'BODEGUERO';
  }

  arbol = signal<NodoTopologiaDTO[]>([]);
  cargando = signal(true);
  error = signal('');
  exito = signal('');

  // Nodos expandidos (Set de IDs)
  nodosExpandidos = signal<Set<String>>(new Set<String>());

  // Modal QR
  qrModalVisible = signal(false);
  qrCargando = signal(false);
  qrBase64 = signal('');
  ubicacionSeleccionadaQr = signal<{ id: number; nombre: string; qrCode: string } | null>(null);

  // Modales de creación
  modalTipo = signal<'ZONA' | 'ESTANTERIA' | 'UBICACION' | 'ALMACEN' | null>(null);
  nodoPadreSeleccionado = signal<{ id: number; nombre: string } | null>(null);

  // Formulario zona
  formZona = { nombre: '', condicionClimatica: 'Temperatura controlada 18°C' };
  // Formulario estantería
  formEstanteria = { codigo: '' };
  // Formulario ubicación
  formUbicacion = { nivel: '1', posicion: 'A', capacidadMaxima: 100 };

  // ── Configuración global: Bodegas y Supervisores ─────────
  ciudades    = signal<CiudadDTO[]>([]);
  supervisores = signal<SupervisorOpcionDTO[]>([]);
  almacenEditandoId = signal<number | null>(null); // null = creando, id = editando
  guardandoBodega = signal(false);
  almacenesCompletos = signal<AlmacenCompletoDTO[]>([]);
  formAlmacen = { nombre: '', direccion: '', capacidadMaxima: 100, idCiudad: null as number | null, idSupervisor: null as number | null };

  ngOnInit() {
    this.cargarArbol();
    this.inventario.getCiudades().subscribe({ next: c => this.ciudades.set(c || []) });
    this.inventario.getSupervisoresDisponibles().subscribe({ next: s => this.supervisores.set(s || []) });
    this.inventario.getAlmacenesCompletos().subscribe({ next: a => this.almacenesCompletos.set(a || []) });
  }

  cargarArbol() {
    this.cargando.set(true);
    this.inventario.getArbolTopologia().subscribe({
      next: data => {
        this.arbol.set(data || []);
        // Expandir por defecto el primer nivel de almacenes
        const exp = new Set<String>();
        (data || []).forEach(alm => exp.add(alm.id));
        this.nodosExpandidos.set(exp);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('Error al cargar la topología de almacenes.');
        this.cargando.set(false);
      }
    });
  }

  toggleNodo(id: string) {
    const exp = new Set(this.nodosExpandidos());
    if (exp.has(id)) {
      exp.delete(id);
    } else {
      exp.add(id);
    }
    this.nodosExpandidos.set(exp);
  }

  estaExpandido(id: string): boolean {
    return this.nodosExpandidos().has(id);
  }

  // Generar / Ver QR
  abrirQrModal(idUbicacion: number, nombreUbicacion: string, codigoQr: string) {
    this.ubicacionSeleccionadaQr.set({ id: idUbicacion, nombre: nombreUbicacion, qrCode: codigoQr });
    this.qrModalVisible.set(true);
    this.qrCargando.set(true);

    this.inventario.getQrUbicacionBase64(idUbicacion).subscribe({
      next: res => {
        this.qrBase64.set(res.qrBase64);
        this.qrCargando.set(false);
      },
      error: () => {
        this.qrCargando.set(false);
      }
    });
  }

  cerrarQrModal() {
    this.qrModalVisible.set(false);
    this.qrBase64.set('');
    this.ubicacionSeleccionadaQr.set(null);
  }

  imprimirQr() {
    window.print();
  }

  // Abrir modales de creación
  abrirModalZona(idAlmacen: number, nombreAlmacen: string) {
    this.nodoPadreSeleccionado.set({ id: idAlmacen, nombre: nombreAlmacen });
    this.formZona = { nombre: '', condicionClimatica: 'Temperatura controlada 18°C' };
    this.modalTipo.set('ZONA');
  }

  abrirModalEstanteria(idZona: number, nombreZona: string) {
    this.nodoPadreSeleccionado.set({ id: idZona, nombre: nombreZona });
    this.formEstanteria = { codigo: '' };
    this.modalTipo.set('ESTANTERIA');
  }

  abrirModalUbicacion(idEstanteria: number, codigoEstanteria: string) {
    this.nodoPadreSeleccionado.set({ id: idEstanteria, nombre: codigoEstanteria });
    this.formUbicacion = { nivel: '1', posicion: 'A', capacidadMaxima: 100 };
    this.modalTipo.set('UBICACION');
  }

  cerrarModalCreacion() {
    this.modalTipo.set(null);
    this.nodoPadreSeleccionado.set(null);
    this.almacenEditandoId.set(null);
  }

  // ── Configuración global: crear / editar Bodega ──────────
  abrirModalNuevaBodega() {
    this.almacenEditandoId.set(null);
    this.formAlmacen = { nombre: '', direccion: '', capacidadMaxima: 100, idCiudad: null, idSupervisor: null };
    this.modalTipo.set('ALMACEN');
  }

  abrirModalEditarBodega(idAlmacen: number) {
    const alm = this.almacenesCompletos().find(a => a.idAlmacen === idAlmacen);
    this.almacenEditandoId.set(idAlmacen);
    this.formAlmacen = {
      nombre: alm?.nombre || '',
      direccion: alm?.direccion || '',
      capacidadMaxima: alm?.capacidadTotal || 100,
      idCiudad: alm?.idCiudad ?? null,
      idSupervisor: alm?.idSupervisor ?? null
    };
    this.modalTipo.set('ALMACEN');
  }

  guardarBodega() {
    if (!this.formAlmacen.nombre.trim()) { this.error.set('Ingrese el nombre de la bodega.'); return; }
    if (!this.formAlmacen.direccion.trim()) { this.error.set('Ingrese la dirección de la bodega.'); return; }
    if (!this.formAlmacen.idCiudad) { this.error.set('Seleccione una ciudad.'); return; }

    this.error.set('');
    this.exito.set('');
    this.guardandoBodega.set(true);

    const payload = {
      nombre: this.formAlmacen.nombre.trim(),
      direccion: this.formAlmacen.direccion.trim(),
      capacidadMaxima: this.formAlmacen.capacidadMaxima,
      idCiudad: this.formAlmacen.idCiudad!,
      idSupervisor: this.formAlmacen.idSupervisor
    };

    const idEditando = this.almacenEditandoId();
    const request$ = idEditando
      ? this.inventario.actualizarBodega(idEditando, payload)
      : this.inventario.crearBodega(payload);

    request$.subscribe({
      next: () => {
        this.guardandoBodega.set(false);
        this.exito.set(idEditando ? 'Bodega actualizada correctamente.' : 'Bodega creada correctamente.');
        this.cerrarModalCreacion();
        this.cargarArbol();
        this.inventario.getAlmacenesCompletos().subscribe({ next: a => this.almacenesCompletos.set(a || []) });
      },
      error: e => {
        this.guardandoBodega.set(false);
        this.error.set(e?.error?.message || 'Error al guardar la bodega.');
      }
    });
  }

  guardarElemento() {
    const tipo = this.modalTipo();
    if (tipo === 'ALMACEN') { this.guardarBodega(); return; }

    const padre = this.nodoPadreSeleccionado();
    if (!tipo || !padre) return;

    this.error.set('');
    this.exito.set('');

    if (tipo === 'ZONA') {
      if (!this.formZona.nombre.trim()) return;
      this.inventario.crearZona(this.formZona.nombre, this.formZona.condicionClimatica, padre.id).subscribe({
        next: () => {
          this.exito.set('Zona creada correctamente.');
          this.cerrarModalCreacion();
          this.cargarArbol();
        },
        error: () => this.error.set('Error al crear la zona.')
      });
    } else if (tipo === 'ESTANTERIA') {
      if (!this.formEstanteria.codigo.trim()) return;
      this.inventario.crearEstanteria(this.formEstanteria.codigo, padre.id).subscribe({
        next: () => {
          this.exito.set('Estantería creada correctamente.');
          this.cerrarModalCreacion();
          this.cargarArbol();
        },
        error: () => this.error.set('Error al crear la estantería.')
      });
    } else if (tipo === 'UBICACION') {
      if (!this.formUbicacion.nivel || !this.formUbicacion.posicion) return;
      this.inventario.crearUbicacion(this.formUbicacion.nivel, this.formUbicacion.posicion, this.formUbicacion.capacidadMaxima, padre.id).subscribe({
        next: () => {
          this.exito.set('Ubicación física creada correctamente con código QR generado.');
          this.cerrarModalCreacion();
          this.cargarArbol();
        },
        error: () => this.error.set('Error al crear la ubicación.')
      });
    }
  }
}
