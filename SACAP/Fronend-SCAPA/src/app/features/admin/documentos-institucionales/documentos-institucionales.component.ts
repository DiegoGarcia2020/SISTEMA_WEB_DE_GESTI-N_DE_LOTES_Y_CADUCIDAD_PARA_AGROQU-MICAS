import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventarioService, AlmacenDTO, DocumentoInstitucionalDTO } from '../../../core/services/inventario.service';
import { ToastService } from '../../../shared/components/toast/toast.service';

/**
 * Archivo de documentos institucionales del establecimiento (AGROCALIDAD Res. 0227,
 * Anexo 1, puntos 1-2): permiso de funcionamiento, LUAE, RUC, certificado ambiental,
 * registro sanitario -- disponibles para inspección regulatoria.
 */
@Component({
  selector: 'app-documentos-institucionales',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div style="padding: 1.5rem; max-width: 1000px;">
      <h1 style="font-family: var(--font-slab); margin-bottom: 0.25rem;">Documentos Institucionales</h1>
      <p style="color: var(--c-sage-text); margin-bottom: 1.5rem;">
        Permiso de funcionamiento AGROCALIDAD, LUAE, RUC, certificado ambiental, registro sanitario del establecimiento
        -- disponibles para una inspección regulatoria.
      </p>

      <div style="background: var(--c-bone-bg); border: 1px solid var(--c-sage-border); border-radius: var(--radius-card); padding: 1.25rem; margin-bottom: 1.5rem;">
        <h3 style="margin: 0 0 1rem;">Subir documento</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 0.875rem; align-items: end;">
          <div>
            <label style="display:block; font-size:0.75rem; font-weight:700; margin-bottom:0.25rem;">Tipo de documento *</label>
            <select [(ngModel)]="tipoDocumento" style="width:100%; padding:0.5rem; border:1px solid var(--c-sage-border); border-radius:0.5rem;">
              <option value="">Seleccione...</option>
              <option value="PERMISO_FUNCIONAMIENTO_AGROCALIDAD">Permiso de Funcionamiento AGROCALIDAD</option>
              <option value="LUAE">LUAE (Licencia Única de Actividades Económicas)</option>
              <option value="RUC">RUC</option>
              <option value="CERTIFICADO_AMBIENTAL">Certificado Ambiental</option>
              <option value="REGISTRO_SANITARIO">Registro Sanitario del Establecimiento</option>
              <option value="OTRO">Otro</option>
            </select>
          </div>
          <div>
            <label style="display:block; font-size:0.75rem; font-weight:700; margin-bottom:0.25rem;">Bodega (opcional)</label>
            <select [(ngModel)]="idAlmacenSeleccionado" style="width:100%; padding:0.5rem; border:1px solid var(--c-sage-border); border-radius:0.5rem;">
              <option [ngValue]="null">Empresa (general)</option>
              @for (a of almacenes(); track a.idAlmacen) { <option [ngValue]="a.idAlmacen">{{ a.nombre }}</option> }
            </select>
          </div>
          <div>
            <label style="display:block; font-size:0.75rem; font-weight:700; margin-bottom:0.25rem;">Fecha de emisión</label>
            <input type="date" [(ngModel)]="fechaEmision" style="width:100%; padding:0.5rem; border:1px solid var(--c-sage-border); border-radius:0.5rem;" />
          </div>
          <div>
            <label style="display:block; font-size:0.75rem; font-weight:700; margin-bottom:0.25rem;">Fecha de vencimiento</label>
            <input type="date" [(ngModel)]="fechaVencimiento" style="width:100%; padding:0.5rem; border:1px solid var(--c-sage-border); border-radius:0.5rem;" />
          </div>
          <div>
            <label style="display:block; font-size:0.75rem; font-weight:700; margin-bottom:0.25rem;">Archivo *</label>
            <input type="file" (change)="onArchivoSeleccionado($event)" style="width:100%;" />
          </div>
        </div>
        @if (error()) { <div style="color:#b91c1c; margin-top:0.75rem; font-size:0.875rem;">{{ error() }}</div> }
        <button (click)="subir()" [disabled]="subiendo()" style="margin-top:1rem; padding:0.625rem 1.25rem; background:var(--c-dark-green); color:white; border:none; border-radius:0.5rem; cursor:pointer; font-weight:600;">
          {{ subiendo() ? 'Subiendo...' : 'Subir documento' }}
        </button>
      </div>

      <div style="background: var(--c-bone-bg); border: 1px solid var(--c-sage-border); border-radius: var(--radius-card); padding: 1.25rem;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
          <h3 style="margin:0;">Archivo ({{ documentos().length }})</h3>
          <button (click)="cargarDocumentos()" style="background:none; border:1px solid var(--c-sage-border); border-radius:0.5rem; padding:0.375rem 0.75rem; cursor:pointer;">↻ Actualizar</button>
        </div>
        @if (documentos().length === 0) {
          <p style="color: var(--c-sage-text);">Aún no se ha subido ningún documento.</p>
        } @else {
          <div style="overflow-x:auto;">
            <table style="width:100%; border-collapse: collapse; font-size: 0.875rem;">
              <thead>
                <tr style="text-align:left; border-bottom: 1px solid var(--c-sage-border);">
                  <th style="padding: 0.5rem;">Tipo</th>
                  <th style="padding: 0.5rem;">Bodega</th>
                  <th style="padding: 0.5rem;">Archivo</th>
                  <th style="padding: 0.5rem;">Vencimiento</th>
                  <th style="padding: 0.5rem;">Subido por</th>
                  <th style="padding: 0.5rem;"></th>
                </tr>
              </thead>
              <tbody>
                @for (d of documentos(); track d.idDocumento) {
                  <tr style="border-bottom: 1px solid #f0f0ea;">
                    <td style="padding: 0.5rem;">{{ d.tipoDocumento }}</td>
                    <td style="padding: 0.5rem;">{{ d.nombreAlmacen }}</td>
                    <td style="padding: 0.5rem;"><a [href]="d.rutaArchivo" target="_blank" rel="noopener">{{ d.nombreArchivo }}</a></td>
                    <td style="padding: 0.5rem;" [style.color]="d.vencido ? '#b91c1c' : 'inherit'">
                      {{ d.fechaVencimiento || '—' }} @if (d.vencido) { <strong> (VENCIDO)</strong> }
                    </td>
                    <td style="padding: 0.5rem;">{{ d.nombreUsuarioSubida }}</td>
                    <td style="padding: 0.5rem;"><button (click)="eliminar(d.idDocumento)" style="background:none; border:none; color:#b91c1c; cursor:pointer;">Eliminar</button></td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>
    </div>
  `
})
export class DocumentosInstitucionalesComponent implements OnInit {
  private inventarioService = inject(InventarioService);
  private toast = inject(ToastService);

  almacenes = signal<AlmacenDTO[]>([]);
  documentos = signal<DocumentoInstitucionalDTO[]>([]);
  subiendo = signal(false);
  error = signal('');

  tipoDocumento = '';
  idAlmacenSeleccionado: number | null = null;
  fechaEmision: string | null = null;
  fechaVencimiento: string | null = null;
  archivoSeleccionado: File | null = null;

  ngOnInit(): void {
    this.inventarioService.getAlmacenes().subscribe(a => this.almacenes.set(a || []));
    this.cargarDocumentos();
  }

  cargarDocumentos(): void {
    this.inventarioService.listarDocumentosInstitucionales().subscribe(d => this.documentos.set(d || []));
  }

  onArchivoSeleccionado(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.archivoSeleccionado = input.files?.[0] || null;
  }

  subir(): void {
    if (!this.tipoDocumento || !this.archivoSeleccionado) {
      this.error.set('Seleccione el tipo de documento y el archivo.');
      return;
    }
    this.error.set('');
    this.subiendo.set(true);
    this.inventarioService.subirDocumentoInstitucional(
      this.archivoSeleccionado, this.tipoDocumento, this.idAlmacenSeleccionado, this.fechaEmision, this.fechaVencimiento
    ).subscribe({
      next: () => {
        this.subiendo.set(false);
        this.toast.success('Documento subido', 'El documento institucional se registró correctamente.');
        this.tipoDocumento = '';
        this.idAlmacenSeleccionado = null;
        this.fechaEmision = null;
        this.fechaVencimiento = null;
        this.archivoSeleccionado = null;
        this.cargarDocumentos();
      },
      error: e => {
        this.subiendo.set(false);
        this.error.set(e?.error?.message || 'Error al subir el documento.');
      }
    });
  }

  eliminar(idDocumento: number): void {
    this.inventarioService.eliminarDocumentoInstitucional(idDocumento).subscribe({
      next: () => {
        this.toast.success('Eliminado', 'Documento eliminado.');
        this.cargarDocumentos();
      },
      error: () => this.toast.error('Error', 'No se pudo eliminar el documento.')
    });
  }
}
