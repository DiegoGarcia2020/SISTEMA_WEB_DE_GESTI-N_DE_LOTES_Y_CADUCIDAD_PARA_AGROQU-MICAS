import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import {
  InventarioService,
  LotePreRegistroRequest,
  LoteDTO, DocumentoDTO
} from '../../../core/services/inventario.service';
import { environment } from '../../../../environments/environment';

type Paso = 'form' | 'documentos' | 'exito';

@Component({
  selector: 'app-pre-registro-lote',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pre-registro-lote.component.html',
  styleUrl:    './pre-registro-lote.component.css'
})
export class PreRegistroLoteComponent implements OnInit {

  paso        = signal<Paso>('form');
  cargando    = signal(false);
  error       = signal('');
  loteCreado  = signal<LoteDTO | null>(null);
  documentos  = signal<DocumentoDTO[]>([]);

  // Datos del proveedor cargados automáticamente
  perfilProveedor = signal<{ idProveedor: number; nombre: string } | null>(null);
  cargandoPerfil  = signal(true);

  form: LotePreRegistroRequest = {
    numeroLote:        '',
    fechaFabricacion:  '',
    fechaVencimiento:  '',
    cantidadDeclarada: 0,
    idProducto:        0,
    idProveedor:       0
  };

  // Para la subida de archivos
  archivoSeleccionado: File | null = null;
  tipoDocumento = 'GUIA_REMISION';
  subiendoDoc   = signal(false);
  tiposDoc = ['GUIA_REMISION', 'FICHA_TECNICA', 'CERTIFICADO_CALIDAD', 'HOJA_SEGURIDAD'];

  private http = inject(HttpClient);
  constructor(private inventario: InventarioService) {}

  ngOnInit() {
    // Cargar automáticamente el perfil del proveedor autenticado
    this.http.get<any>(`${environment.apiUrl}/proveedores/perfil`).subscribe({
      next: perfil => {
        this.perfilProveedor.set({ idProveedor: perfil.idProveedor, nombre: perfil.nombre });
        this.form.idProveedor = perfil.idProveedor;
        this.cargandoPerfil.set(false);
      },
      error: () => {
        // Si falla (sin conexión o no tiene perfil), continuar sin bloquear
        this.cargandoPerfil.set(false);
      }
    });
  }

  enviarPreRegistro() {
    this.error.set('');

    // Validar campos obligatorios
    if (!this.form.numeroLote?.trim()) {
      this.error.set('Ingrese el número de lote.');
      return;
    }
    if (!this.form.fechaFabricacion) {
      this.error.set('Seleccione la fecha de fabricación.');
      return;
    }
    if (!this.form.fechaVencimiento) {
      this.error.set('Seleccione la fecha de vencimiento.');
      return;
    }
    if (!this.form.cantidadDeclarada || Number(this.form.cantidadDeclarada) < 1) {
      this.error.set('Ingrese una cantidad válida (mayor a 0).');
      return;
    }
    if (!this.form.idProducto || Number(this.form.idProducto) < 1) {
      this.error.set('Ingrese un ID de producto válido.');
      return;
    }

    // Construir payload con tipos correctos para el backend
    const payload = {
      numeroLote:        this.form.numeroLote.trim().toUpperCase(),
      fechaFabricacion:  this.form.fechaFabricacion,   // ya en formato yyyy-MM-dd desde <input type="date">
      fechaVencimiento:  this.form.fechaVencimiento,
      cantidadDeclarada: Number(this.form.cantidadDeclarada),
      idProducto:        Number(this.form.idProducto),
      idProveedor:       Number(this.form.idProveedor) || 0
    };

    console.log('[Pre-registro] Enviando payload:', payload);

    this.cargando.set(true);
    this.inventario.preRegistrarLote(payload as any).subscribe({
      next: lote => {
        this.loteCreado.set(lote);
        this.cargando.set(false);
        this.paso.set('documentos');
      },
      error: (e) => {
        this.cargando.set(false);
        const msg = e?.error?.message || e?.error?.error || e?.message || 'Error al registrar el lote.';
        this.error.set(msg);
        console.error('[Pre-registro] Error:', e);
      }
    });
  }

  onArchivoSeleccionado(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) this.archivoSeleccionado = input.files[0];
  }

  subirDocumento() {
    if (!this.archivoSeleccionado || !this.loteCreado()) return;
    this.subiendoDoc.set(true);
    this.inventario.subirDocumento(
      this.loteCreado()!.idLote,
      this.archivoSeleccionado,
      this.tipoDocumento
    ).subscribe({
      next:  doc => {
        this.documentos.update(d => [...d, doc]);
        this.archivoSeleccionado = null;
        this.subiendoDoc.set(false);
      },
      error: _e => {
        this.subiendoDoc.set(false);
        this.error.set('Error al subir el documento. Intente nuevamente.');
      }
    });
  }

  finalizar() { this.paso.set('exito'); }

  reiniciar() {
    this.paso.set('form');
    this.loteCreado.set(null);
    this.documentos.set([]);
    this.archivoSeleccionado = null;
    const idProv = this.perfilProveedor()?.idProveedor || 0;
    this.form = { numeroLote: '', fechaFabricacion: '', fechaVencimiento: '',
                  cantidadDeclarada: 0, idProducto: 0, idProveedor: idProv };
  }
}
