import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  InventarioService,
  LotePreRegistroRequest,
  LoteDTO, DocumentoDTO
} from '../../../core/services/inventario.service';

type Paso = 'form' | 'documentos' | 'exito';

@Component({
  selector: 'app-pre-registro-lote',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pre-registro-lote.component.html',
  styleUrl:    './pre-registro-lote.component.css'
})
export class PreRegistroLoteComponent {

  paso        = signal<Paso>('form');
  cargando    = signal(false);
  error       = signal('');
  loteCreado  = signal<LoteDTO | null>(null);
  documentos  = signal<DocumentoDTO[]>([]);

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

  constructor(private inventario: InventarioService) {}

  enviarPreRegistro() {
    this.error.set('');
    if (!this.form.numeroLote || !this.form.fechaVencimiento || !this.form.cantidadDeclarada) {
      this.error.set('Por favor complete todos los campos obligatorios.');
      return;
    }
    this.cargando.set(true);
    this.inventario.preRegistrarLote(this.form).subscribe({
      next:  lote => {
        this.loteCreado.set(lote);
        this.cargando.set(false);
        this.paso.set('documentos');
      },
      error: _e => {
        this.cargando.set(false);
        this.error.set('Error al registrar el lote. Intente nuevamente.');
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
    this.form = { numeroLote: '', fechaFabricacion: '', fechaVencimiento: '',
                  cantidadDeclarada: 0, idProducto: 0, idProveedor: 0 };
  }
}
